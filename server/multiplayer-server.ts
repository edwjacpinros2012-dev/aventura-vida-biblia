import { createServer } from "node:http";
import { Server } from "socket.io";
import {
  createRoomSchema,
  joinRoomSchema,
  roomActionRequestSchema,
  roomChatSchema,
  roomCommandSchema,
  type ClientToServerEvents,
  type MultiplayerError,
  type MultiplayerResponse,
  type ServerToClientEvents,
} from "@/lib/multiplayer/contracts";
import { MultiplayerRoomService, RoomServiceError } from "./multiplayer/room-service";
import { accountFromSessionToken } from "@/lib/auth/service";
import { assertCommunityAccess, CommunityError, isBlocked } from "@/lib/community/service";
import { ChatError, createRoomChatMessage } from "@/lib/community/chat-service";
import type { SafeAccount } from "@/lib/auth/contracts";

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
  cors: { origin: allowedOrigin.split(",").map((origin) => origin.trim()), methods: ["GET", "POST"], credentials: true },
  transports: ["websocket", "polling"],
});

function sessionTokenFromCookie(cookieHeader: string | undefined) {
  return cookieHeader?.match(/(?:^|;\s*)aventura_vida_session=([^;]+)/)?.[1];
}

function socketAccount(socket: { data: Record<string, unknown> }) {
  return socket.data.account as SafeAccount | undefined;
}

function socketPlayer(socket: { data: Record<string, unknown> }, player: { id: string; nickname: string; avatar: string }) {
  const account = socketAccount(socket);
  return account ? { id: `user_${account.id}`, nickname: account.nickname, avatar: account.avatarKey } : player;
}

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

function chatAllowed(socket: { data: Record<string, unknown> }) {
  const now = Date.now();
  const startedAt = typeof socket.data.chatWindowStartedAt === "number" ? socket.data.chatWindowStartedAt : now;
  const count = typeof socket.data.chatCount === "number" ? socket.data.chatCount : 0;
  if (now - startedAt >= 30_000) { socket.data.chatWindowStartedAt = now; socket.data.chatCount = 1; return true; }
  if (count >= 5) return false;
  socket.data.chatCount = count + 1;
  return true;
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
  io.use(async (socket, next) => {
    // Las salas siguen disponibles como invitado para conservar el modo local;
    // el chat exige una sesión de cuenta y nunca acepta una identidad del cliente.
    if (!process.env.DATABASE_URL) return next();
    try {
      const account = await accountFromSessionToken(sessionTokenFromCookie(socket.handshake.headers.cookie));
      if (account) socket.data.account = account;
      next();
    } catch (error) {
      console.warn("No se pudo resolver la sesión de sala", error);
      next();
    }
  });
  io.on("connection", (socket) => {
    socket.on("room:create", async (rawPayload, respond) => {
      const payload = createRoomSchema.safeParse(rawPayload);
      if (!payload.success) { const response: MultiplayerResponse = { error: { code: "INVALID_INPUT", message: "Revisa los datos de la sala." } }; sendError(socket, response); respond(response); return; }
      try {
        const account = socketAccount(socket);
        if (account) await assertCommunityAccess(account.id, "multiplayer");
        const player = socketPlayer(socket, payload.data.player);
        const room = await rooms.create(payload.data.gameKey, payload.data.maxPlayers, player);
        socket.data.roomCode = room.code;
        socket.data.playerId = player.id;
        socket.join(room.code);
        respond({ room });
        await broadcastRoom(room.code, room);
      } catch (error) { const response = errorResponse(error); sendError(socket, response); respond(response); }
    });

    socket.on("room:join", async (rawPayload, respond) => {
      const payload = joinRoomSchema.safeParse(rawPayload);
      if (!payload.success) { const response: MultiplayerResponse = { error: { code: "INVALID_INPUT", message: "El código de sala debe tener seis caracteres." } }; sendError(socket, response); respond(response); return; }
      try {
        const account = socketAccount(socket);
        if (account) await assertCommunityAccess(account.id, "multiplayer");
        const player = socketPlayer(socket, payload.data.player);
        const room = await rooms.join(payload.data.code, player);
        socket.data.roomCode = room.code;
        socket.data.playerId = player.id;
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

    socket.on("room:chat", async (rawPayload, respond) => {
      const payload = roomChatSchema.safeParse(rawPayload);
      const playerId = currentPlayerId(socket);
      const account = socketAccount(socket);
      if (!payload.success || !playerId || socket.data.roomCode !== payload.data.code) {
        respond({ error: { code: "INVALID_INPUT", message: "Ese mensaje no corresponde a tu sala." } }); return;
      }
      if (!account) { respond({ error: { code: "NOT_AUTHENTICATED", message: "Inicia sesión para usar el chat seguro." } }); return; }
      if (!chatAllowed(socket)) { respond({ error: { code: "RATE_LIMITED", message: "Puedes enviar hasta cinco mensajes cada 30 segundos." } }); return; }
      try {
        await assertCommunityAccess(account.id, "chat");
        const saved = await createRoomChatMessage({ roomCode: payload.data.code, authorId: account.id, authorPlayerKey: playerId, text: payload.data.text, presetKey: payload.data.presetKey });
        const message = { id: saved.id, roomCode: payload.data.code, author: { nickname: account.nickname, avatar: account.avatarKey }, text: saved.text, presetKey: saved.presetKey ?? undefined, createdAt: saved.createdAt.toISOString() };
        respond({ message });
        const recipients = await io.in(payload.data.code).fetchSockets();
        await Promise.all(recipients.map(async (recipient) => {
          const recipientAccount = socketAccount(recipient);
          if (recipientAccount && await isBlocked(recipientAccount.id, account.id)) return;
          recipient.emit("room:chat", message);
        }));
      } catch (error) {
        if (error instanceof ChatError) { respond({ error: { code: error.code, message: error.message } }); return; }
        if (error instanceof CommunityError) { respond({ error: { code: "NOT_ALLOWED", message: error.message } }); return; }
        console.error("No se pudo enviar el mensaje seguro", error);
        respond({ error: { code: "INVALID_STATE", message: "No pudimos enviar el mensaje." } });
      }
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
