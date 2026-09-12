import { createServer } from "node:http";
import { Server } from "socket.io";
import {
  createRoomSchema,
  joinRoomSchema,
  roomActionRequestSchema,
  roomCommandSchema,
  type ClientToServerEvents,
  type MultiplayerError,
  type MultiplayerResponse,
  type ServerToClientEvents,
} from "@/lib/multiplayer/contracts";
import { MultiplayerRoomService, RoomServiceError } from "./multiplayer/room-service";

const port = Number(process.env.MULTIPLAYER_PORT ?? 3001);
const allowedOrigin = process.env.MULTIPLAYER_ALLOWED_ORIGIN ?? "http://localhost:3000";
const rooms = new MultiplayerRoomService();

const httpServer = createServer((request, response) => {
  if (request.url === "/health") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ status: "ok", service: "aventura-vida-multiplayer" }));
    return;
  }
  response.writeHead(404, { "content-type": "application/json" });
  response.end(JSON.stringify({ error: "Not found" }));
});

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: allowedOrigin.split(",").map((origin) => origin.trim()), methods: ["GET", "POST"] },
  transports: ["websocket", "polling"],
});

function errorResponse(error: unknown): MultiplayerResponse {
  if (error instanceof RoomServiceError) return { error: { code: error.code, message: error.message } };
  console.error("Error de sala multijugador", error);
  return { error: { code: "INVALID_STATE", message: "No pudimos actualizar la sala. Intenta nuevamente." } };
}

function sendError(socket: { emit: (event: "room:error", error: MultiplayerError) => boolean }, response: MultiplayerResponse) {
  if (response.error) socket.emit("room:error", response.error);
}

function currentPlayerId(socket: { data: Record<string, unknown> }) {
  return typeof socket.data.playerId === "string" ? socket.data.playerId : undefined;
}

function actionAllowed(socket: { data: Record<string, unknown> }) {
  const now = Date.now();
  const windowStartedAt = typeof socket.data.actionWindowStartedAt === "number" ? socket.data.actionWindowStartedAt : now;
  const count = typeof socket.data.actionCount === "number" ? socket.data.actionCount : 0;
  if (now - windowStartedAt > 1000) {
    socket.data.actionWindowStartedAt = now;
    socket.data.actionCount = 1;
    return true;
  }
  if (count >= 30) return false;
  socket.data.actionCount = count + 1;
  return true;
}

async function broadcastRoom(code: string, room: MultiplayerResponse["room"]) {
  if (room) io.to(code).emit("room:state", room);
}

async function start() {
  await rooms.hydrate();
  io.on("connection", (socket) => {
    socket.on("room:create", async (rawPayload, respond) => {
      const payload = createRoomSchema.safeParse(rawPayload);
      if (!payload.success) { const response: MultiplayerResponse = { error: { code: "INVALID_INPUT", message: "Revisa los datos de la sala." } }; sendError(socket, response); respond(response); return; }
      try {
        const room = await rooms.create(payload.data.gameKey, payload.data.maxPlayers, payload.data.player);
        socket.data.roomCode = room.code;
        socket.data.playerId = payload.data.player.id;
        socket.join(room.code);
        respond({ room });
        await broadcastRoom(room.code, room);
      } catch (error) { const response = errorResponse(error); sendError(socket, response); respond(response); }
    });

    socket.on("room:join", async (rawPayload, respond) => {
      const payload = joinRoomSchema.safeParse(rawPayload);
      if (!payload.success) { const response: MultiplayerResponse = { error: { code: "INVALID_INPUT", message: "El código de sala debe tener seis caracteres." } }; sendError(socket, response); respond(response); return; }
      try {
        const room = await rooms.join(payload.data.code, payload.data.player);
        socket.data.roomCode = room.code;
        socket.data.playerId = payload.data.player.id;
        socket.join(room.code);
        respond({ room });
        await broadcastRoom(room.code, room);
      } catch (error) { const response = errorResponse(error); sendError(socket, response); respond(response); }
    });

    socket.on("room:start", async (rawPayload, respond) => {
      const payload = roomCommandSchema.safeParse(rawPayload);
      const playerId = currentPlayerId(socket);
      if (!payload.success || !playerId || socket.data.roomCode !== payload.data.code) { const response: MultiplayerResponse = { error: { code: "INVALID_INPUT", message: "No encontramos tu lugar en esta sala." } }; sendError(socket, response); respond(response); return; }
      try { const room = await rooms.start(payload.data.code, playerId); respond({ room }); await broadcastRoom(room.code, room); }
      catch (error) { const response = errorResponse(error); sendError(socket, response); respond(response); }
    });

    socket.on("room:action", async (rawPayload, respond) => {
      const payload = roomActionRequestSchema.safeParse(rawPayload);
      const playerId = currentPlayerId(socket);
      if (!actionAllowed(socket)) { const response: MultiplayerResponse = { error: { code: "RATE_LIMITED", message: "Espera un momento antes de enviar otra acción." } }; sendError(socket, response); respond(response); return; }
      if (!payload.success || !playerId || socket.data.roomCode !== payload.data.code) { const response: MultiplayerResponse = { error: { code: "INVALID_INPUT", message: "La acción no corresponde a tu sala." } }; sendError(socket, response); respond(response); return; }
      try { const room = await rooms.action(payload.data.code, playerId, payload.data.action); respond({ room }); await broadcastRoom(room.code, room); }
      catch (error) { const response = errorResponse(error); sendError(socket, response); respond(response); }
    });

    socket.on("room:leave", async (rawPayload, respond) => {
      const payload = roomCommandSchema.safeParse(rawPayload);
      const playerId = currentPlayerId(socket);
      if (!payload.success || !playerId || socket.data.roomCode !== payload.data.code) { const response: MultiplayerResponse = { error: { code: "INVALID_INPUT", message: "No encontramos tu lugar en esta sala." } }; sendError(socket, response); respond(response); return; }
      try {
        const room = await rooms.leave(payload.data.code, playerId);
        socket.leave(payload.data.code);
        socket.data.roomCode = undefined;
        respond({ room });
        await broadcastRoom(room.code, room);
      } catch (error) { const response = errorResponse(error); sendError(socket, response); respond(response); }
    });

    socket.on("disconnect", async () => {
      const code = typeof socket.data.roomCode === "string" ? socket.data.roomCode : undefined;
      const playerId = currentPlayerId(socket);
      if (!code || !playerId) return;
      try {
        const room = await rooms.disconnect(code, playerId);
        if (room) await broadcastRoom(code, room);
      } catch (error) { console.error("No se pudo registrar una desconexión", error); }
    });
  });

  setInterval(() => rooms.sweepExpired(), 60_000).unref();
  httpServer.listen(port, () => console.log(`Aventura Vida multiplayer listo en http://localhost:${port}`));
}

start().catch((error) => { console.error("No se pudo iniciar el servidor multijugador", error); process.exit(1); });
