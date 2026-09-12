import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, MultiplayerResponse, ServerToClientEvents } from "@/lib/multiplayer/contracts";

const url = process.env.MULTIPLAYER_VERIFY_URL ?? "http://localhost:3001";
type TestSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

function connect(): Promise<TestSocket> {
  return new Promise((resolve, reject) => {
    const socket: TestSocket = io(url, { transports: ["websocket"], timeout: 5_000, forceNew: true });
    const timer = setTimeout(() => { socket.disconnect(); reject(new Error("Tiempo de conexión agotado.")); }, 7_000);
    socket.once("connect", () => { clearTimeout(timer); resolve(socket); });
    socket.once("connect_error", (error) => { clearTimeout(timer); reject(error); });
  });
}

function request(socket: TestSocket, event: string, payload: unknown): Promise<MultiplayerResponse> {
  return new Promise((resolve) => {
    (socket.emit as (name: string, data: unknown, callback: (response: MultiplayerResponse) => void) => void)(event, payload, resolve);
  });
}

function requireRoom(response: MultiplayerResponse) {
  if (!response.room) throw new Error(response.error?.message ?? "El servidor no devolvió una sala.");
  return response.room;
}

async function main() {
  const host = await connect();
  const guest = await connect();
  const third = await connect();
  const fourth = await connect();
  try {
    const created = requireRoom(await request(host, "room:create", { gameKey: "bible-maze", maxPlayers: 4, player: { id: "verify_host_0001", nickname: "Luz Host", avatar: "✦" } }));
    const joined = requireRoom(await request(guest, "room:join", { code: created.code, player: { id: "verify_guest_0002", nickname: "Luz Guest", avatar: "☀" } }));
    requireRoom(await request(third, "room:join", { code: created.code, player: { id: "verify_guest_0003", nickname: "Luz Tres", avatar: "☁" } }));
    const joinedFour = requireRoom(await request(fourth, "room:join", { code: created.code, player: { id: "verify_guest_0004", nickname: "Luz Cuatro", avatar: "🌿" } }));
    if (joined.players.filter((player) => player.status === "CONNECTED").length !== 2 || joinedFour.players.filter((player) => player.status === "CONNECTED").length !== 4) throw new Error("Las cuatro personas no se sincronizaron.");
    const started = requireRoom(await request(host, "room:start", { code: created.code }));
    if (started.status !== "PLAYING") throw new Error("La sala no inició.");
    const moved = requireRoom(await request(guest, "room:action", { code: created.code, action: { type: "maze.move", level: 1, row: 0, column: 1, moves: 1 } }));
    const guestState = moved.players.find((player) => player.id === "verify_guest_0002")?.state;
    if (guestState?.row !== 0 || guestState?.column !== 1) throw new Error("El movimiento no se sincronizó.");
    const disconnectedPromise = new Promise<MultiplayerResponse>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("No llegó el evento de desconexión.")), 5_000);
      host.on("room:state", function onState(room) {
        if (room.players.find((player) => player.id === "verify_guest_0004")?.status !== "DISCONNECTED") return;
        clearTimeout(timer);
        host.off("room:state", onState);
        resolve({ room });
      });
    });
    fourth.disconnect();
    const disconnected = await disconnectedPromise;
    if (disconnected.room?.players.find((player) => player.id === "verify_guest_0004")?.status !== "DISCONNECTED") throw new Error("La desconexión no se comunicó.");
    console.log("PASS: sala de 4, anfitrión, inicio, sincronización de movimiento y desconexión.");
  } finally {
    host.disconnect();
    guest.disconnect();
    third.disconnect();
    fourth.disconnect();
  }
}

main().catch((error) => { console.error("FAIL: verificación multijugador", error); process.exit(1); });
