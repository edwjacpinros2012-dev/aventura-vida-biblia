import { io, type Socket } from "socket.io-client";
import { duelQuestions } from "./pvp-questions";
import type { ClientToServerEvents, MultiplayerResponse, PvpResponse, ServerToClientEvents } from "@/lib/multiplayer/contracts";

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

function pvpRequest(socket: TestSocket, event: string, payload: unknown): Promise<PvpResponse> {
  return new Promise((resolve) => {
    (socket.emit as (name: string, data: unknown, callback: (response: PvpResponse) => void) => void)(event, payload, resolve);
  });
}

function requireDuel(response: PvpResponse) {
  if (!response.match) throw new Error(response.error?.message ?? "El servidor no devolvió un duelo.");
  return response.match;
}

function correctOption(questionId: string) {
  const question = duelQuestions.find((item) => item.id === questionId);
  if (!question) throw new Error("Pregunta PvP desconocida.");
  return question.correct;
}

async function main() {
  const host = await connect();
  const guest = await connect();
  const third = await connect();
  const fourth = await connect();
  try {
    const created = requireRoom(await request(host, "room:create", { gameKey: "bible-maze", maxPlayers: 4, player: { id: "verify_host_0001", nickname: "Luz Host", avatar: "vida-kids-01-rosa-morado" } }));
    const joined = requireRoom(await request(guest, "room:join", { code: created.code, player: { id: "verify_guest_0002", nickname: "Luz Guest", avatar: "avatar-inventado" } }));
    requireRoom(await request(third, "room:join", { code: created.code, player: { id: "verify_guest_0003", nickname: "Luz Tres", avatar: "vida-kids-05-verde" } }));
    const joinedFour = requireRoom(await request(fourth, "room:join", { code: created.code, player: { id: "verify_guest_0004", nickname: "Luz Cuatro", avatar: "🌿" } }));
    if (joined.players.filter((player) => player.status === "CONNECTED").length !== 2 || joinedFour.players.filter((player) => player.status === "CONNECTED").length !== 4) throw new Error("Las cuatro personas no se sincronizaron.");
    if (joined.players.find((player) => player.id === "verify_host_0001")?.avatar !== "vida-kids-01-rosa-morado") throw new Error("El avatar oficial no se conservó en la sala.");
    if (joined.players.find((player) => player.id === "verify_guest_0002")?.avatar !== "spark") throw new Error("El servidor aceptó una clave de avatar inventada.");
    const started = requireRoom(await request(host, "room:start", { code: created.code }));
    if (started.status !== "PLAYING") throw new Error("La sala no inició.");
    const moved = requireRoom(await request(guest, "room:action", { code: created.code, action: { type: "maze.move", direction: "right" } }));
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

  const duelistA = await connect();
  const duelistB = await connect();
  let reconnectedA: TestSocket | undefined;
  try {
    const playerA = { id: "verify_duelist_0001", nickname: "Duelista Uno", avatar: "vida-kids-03-azul" };
    const playerB = { id: "verify_duelist_0002", nickname: "Duelista Dos", avatar: "vida-kids-06-rojo" };
    const queued = await pvpRequest(duelistA, "pvp:queue", { gameKey: "bible-quiz-duel", player: playerA });
    if (!queued.queued) throw new Error("El primer duelista no entró a la cola.");
    let duel = requireDuel(await pvpRequest(duelistB, "pvp:queue", { gameKey: "bible-quiz-duel", player: playerB }));
    if (duel.status !== "PLAYING" || duel.players.length !== 2 || !duel.question) throw new Error("No se creó el duelo 1 vs 1.");

    const disconnectedPvp = new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("No llegó la desconexión PvP.")), 5_000);
      duelistB.on("pvp:state", function state(next) {
        if (next.id !== duel.id || next.players.find((player) => player.id === playerA.id)?.status !== "DISCONNECTED") return;
        clearTimeout(timer); duelistB.off("pvp:state", state); resolve();
      });
    });
    duelistA.disconnect();
    await disconnectedPvp;
    reconnectedA = await connect();
    duel = requireDuel(await pvpRequest(reconnectedA, "pvp:rejoin", { matchId: duel.id, player: playerA }));
    if (duel.players.find((player) => player.id === playerA.id)?.status !== "CONNECTED") throw new Error("La reconexión PvP no restauró al jugador.");

    for (let round = 1; round <= 3; round += 1) {
      if (!duel.question) throw new Error("Falta una pregunta del duelo.");
      const correct = correctOption(duel.question.id);
      await pvpRequest(reconnectedA, "pvp:answer", { matchId: duel.id, round, option: correct });
      duel = requireDuel(await pvpRequest(duelistB, "pvp:answer", { matchId: duel.id, round, option: (correct + 1) % 4 }));
      if (duel.status !== "ROUND_RESULT") throw new Error("El servidor no cerró la ronda PvP.");
      await pvpRequest(reconnectedA, "pvp:continue", { matchId: duel.id, round });
      duel = requireDuel(await pvpRequest(duelistB, "pvp:continue", { matchId: duel.id, round }));
    }
    if (duel.status !== "FINISHED" || duel.result?.winnerId !== playerA.id) throw new Error("El servidor no validó la victoria del duelo.");
    console.log("PASS: matchmaking 1 vs 1, acciones validadas, reconexión y victoria PvP.");
  } finally {
    duelistA.disconnect(); duelistB.disconnect(); reconnectedA?.disconnect();
  }
}

main().catch((error) => { console.error("FAIL: verificación multijugador", error); process.exit(1); });
