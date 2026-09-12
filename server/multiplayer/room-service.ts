import { randomBytes } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { bibleMazeLevels, mazeCellAt, mazePointFor, mazeTokenKeys, nextMazePoint, type MazePoint } from "@/lib/bible-maze";
import type {
  MultiplayerError,
  MultiplayerParticipant,
  MultiplayerRoomAction,
  MultiplayerRoomSnapshot,
  PublicPlayerIdentity,
} from "@/lib/multiplayer/contracts";

const ROOM_TTL_MS = 6 * 60 * 60 * 1000;
const ROOM_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

type InternalRoom = MultiplayerRoomSnapshot & { createdAt: string };

export class RoomServiceError extends Error {
  constructor(public readonly code: MultiplayerError["code"], message: string) { super(message); }
}

function cloneRoom(room: InternalRoom): MultiplayerRoomSnapshot {
  return {
    code: room.code,
    gameKey: room.gameKey,
    maxPlayers: room.maxPlayers,
    hostPlayerId: room.hostPlayerId,
    status: room.status,
    revision: room.revision,
    state: { ...room.state },
    players: room.players.map((player) => ({ ...player, state: { ...player.state } })),
    expiresAt: room.expiresAt,
  };
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function statusForDatabase(status: MultiplayerRoomSnapshot["status"]) {
  return status;
}

function participantStatusForDatabase(status: MultiplayerParticipant["status"]) {
  return status;
}

function matchStatusForRoom(status: MultiplayerRoomSnapshot["status"]) {
  if (status === "LOBBY") return "WAITING" as const;
  if (status === "PLAYING") return "ACTIVE" as const;
  return status === "FINISHED" ? "FINISHED" as const : "ABANDONED" as const;
}

function matchPlayerStatusForParticipant(status: MultiplayerParticipant["status"]) {
  return status === "LEFT" ? "LEFT" as const : status === "DISCONNECTED" ? "DISCONNECTED" as const : "ACTIVE" as const;
}

function mazeState(value: Record<string, unknown>) {
  const level = typeof value.level === "number" && Number.isInteger(value.level) ? value.level : 1;
  const route = typeof value.route === "number" && Number.isInteger(value.route) ? value.route : 0;
  const board = bibleMazeLevels[level - 1];
  if (!board) throw new RoomServiceError("INVALID_STATE", "Ese nivel del laberinto no existe.");
  const layout = board.layouts[route % board.layouts.length];
  const start = mazePointFor(layout, "S");
  const point: MazePoint = typeof value.row === "number" && typeof value.column === "number"
    ? { row: value.row, column: value.column }
    : start;
  const collected = Array.isArray(value.collected) ? value.collected.filter((item): item is string => typeof item === "string") : [];
  const moves = typeof value.moves === "number" && Number.isInteger(value.moves) ? value.moves : 0;
  return { board, layout, level, route, point, collected, moves };
}

class RoomPersistence {
  private readonly enabled = Boolean(process.env.DATABASE_URL);

  async loadActiveRooms(): Promise<InternalRoom[]> {
    if (!this.enabled) return [];
    const rooms = await prisma.multiplayerRoom.findMany({
      where: { expiresAt: { gt: new Date() }, status: { in: ["LOBBY", "PLAYING"] } },
      include: { participants: true },
    });
    return rooms.map((room) => {
      const stored = record(room.state);
      const revision = typeof stored.revision === "number" ? stored.revision : 0;
      const state = record(stored.state);
      return {
        code: room.code,
        gameKey: room.gameKey as InternalRoom["gameKey"],
        maxPlayers: room.maxPlayers,
        hostPlayerId: room.hostPlayerKey,
        status: room.status,
        revision,
        state,
        players: room.participants.map((participant) => ({
          id: participant.playerKey,
          nickname: participant.nickname,
          avatar: participant.avatarKey,
          status: participant.status === "LEFT" ? "LEFT" : "DISCONNECTED",
          state: record(participant.state),
        })),
        expiresAt: room.expiresAt.toISOString(),
        createdAt: room.createdAt.toISOString(),
      };
    });
  }

  async save(room: InternalRoom) {
    if (!this.enabled) return;
    const databaseRoom = await prisma.multiplayerRoom.upsert({
      where: { code: room.code },
      update: {
        gameKey: room.gameKey,
        maxPlayers: room.maxPlayers,
        hostPlayerKey: room.hostPlayerId,
        status: statusForDatabase(room.status),
        state: { revision: room.revision, state: room.state } as Prisma.InputJsonValue,
        expiresAt: new Date(room.expiresAt),
      },
      create: {
        code: room.code,
        gameKey: room.gameKey,
        maxPlayers: room.maxPlayers,
        hostPlayerKey: room.hostPlayerId,
        status: statusForDatabase(room.status),
        state: { revision: room.revision, state: room.state } as Prisma.InputJsonValue,
        expiresAt: new Date(room.expiresAt),
      },
    });
    await Promise.all(room.players.map((player) => prisma.multiplayerParticipant.upsert({
      where: { roomId_playerKey: { roomId: databaseRoom.id, playerKey: player.id } },
      update: {
        nickname: player.nickname,
        avatarKey: player.avatar,
        status: participantStatusForDatabase(player.status),
        state: player.state as Prisma.InputJsonValue,
        leftAt: player.status === "LEFT" ? new Date() : null,
      },
      create: {
        roomId: databaseRoom.id,
        playerKey: player.id,
        nickname: player.nickname,
        avatarKey: player.avatar,
        status: participantStatusForDatabase(player.status),
        state: player.state as Prisma.InputJsonValue,
        leftAt: player.status === "LEFT" ? new Date() : null,
      },
    })));
    // La sala cooperativa persiste un Match de la misma base. El futuro PvP
    // reutilizará estos contratos, eventos y participantes, sin otro servidor.
    const match = await prisma.match.upsert({
      where: { roomId: databaseRoom.id },
      update: {
        status: matchStatusForRoom(room.status),
        state: { revision: room.revision, state: room.state } as Prisma.InputJsonValue,
        startedAt: room.status === "PLAYING" ? new Date() : undefined,
      },
      create: {
        roomId: databaseRoom.id,
        gameKey: room.gameKey,
        mode: "COOPERATIVE",
        status: matchStatusForRoom(room.status),
        state: { revision: room.revision, state: room.state } as Prisma.InputJsonValue,
        startedAt: room.status === "PLAYING" ? new Date() : null,
      },
    });
    await Promise.all(room.players.map((player) => prisma.matchPlayer.upsert({
      where: { matchId_playerKey: { matchId: match.id, playerKey: player.id } },
      update: { status: matchPlayerStatusForParticipant(player.status), state: player.state as Prisma.InputJsonValue, leftAt: player.status === "LEFT" ? new Date() : null },
      create: { matchId: match.id, playerKey: player.id, status: matchPlayerStatusForParticipant(player.status), state: player.state as Prisma.InputJsonValue, leftAt: player.status === "LEFT" ? new Date() : null },
    })));
  }

  async event(room: InternalRoom, playerKey: string | undefined, type: string, payload: Record<string, unknown>) {
    if (!this.enabled) return;
    const databaseRoom = await prisma.multiplayerRoom.findUnique({ where: { code: room.code }, select: { id: true } });
    if (!databaseRoom) return;
    await prisma.multiplayerRoomEvent.create({
      data: { roomId: databaseRoom.id, playerKey, type, revision: room.revision, payload: payload as Prisma.InputJsonValue },
    });
  }
}

export class MultiplayerRoomService {
  private readonly rooms = new Map<string, InternalRoom>();
  private readonly persistence = new RoomPersistence();

  async hydrate() {
    for (const room of await this.persistence.loadActiveRooms()) this.rooms.set(room.code, room);
  }

  private generateCode() {
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const bytes = randomBytes(6);
      const code = Array.from(bytes, (value) => ROOM_ALPHABET[value % ROOM_ALPHABET.length]).join("");
      if (!this.rooms.has(code)) return code;
    }
    throw new RoomServiceError("INVALID_STATE", "No pudimos crear una sala única. Intenta otra vez.");
  }

  private read(code: string) {
    const room = this.rooms.get(code);
    if (!room || new Date(room.expiresAt).getTime() <= Date.now() || room.status === "CLOSED") {
      if (room) this.rooms.delete(code);
      throw new RoomServiceError("ROOM_NOT_FOUND", "Esta sala ya no está disponible.");
    }
    return room;
  }

  private chooseHost(room: InternalRoom) {
    const nextHost = room.players.find((player) => player.status === "CONNECTED") ?? room.players.find((player) => player.status !== "LEFT");
    if (nextHost) room.hostPlayerId = nextHost.id;
  }

  private async persist(room: InternalRoom, playerKey: string | undefined, event: string, payload: Record<string, unknown>) {
    try {
      await this.persistence.save(room);
      await this.persistence.event(room, playerKey, event, payload);
    } catch (error) {
      console.error("No se pudo persistir la sala multijugador", error);
    }
  }

  async create(gameKey: InternalRoom["gameKey"], maxPlayers: number, player: PublicPlayerIdentity) {
    const now = new Date();
    const room: InternalRoom = {
      code: this.generateCode(),
      gameKey,
      maxPlayers,
      hostPlayerId: player.id,
      status: "LOBBY",
      revision: 1,
      state: { activeLevel: 1 },
      players: [{ ...player, status: "CONNECTED", state: {} }],
      expiresAt: new Date(now.getTime() + ROOM_TTL_MS).toISOString(),
      createdAt: now.toISOString(),
    };
    this.rooms.set(room.code, room);
    await this.persist(room, player.id, "room.created", { maxPlayers, gameKey });
    return cloneRoom(room);
  }

  async join(code: string, player: PublicPlayerIdentity) {
    const room = this.read(code);
    if (room.status !== "LOBBY" && room.status !== "PLAYING") throw new RoomServiceError("INVALID_STATE", "La sala no acepta nuevos jugadores.");
    const existing = room.players.find((item) => item.id === player.id);
    const activeCount = room.players.filter((item) => item.status !== "LEFT").length;
    if (!existing && activeCount >= room.maxPlayers) throw new RoomServiceError("ROOM_FULL", "La sala ya tiene todos sus lugares ocupados.");
    if (existing) Object.assign(existing, player, { status: "CONNECTED" as const });
    else room.players.push({ ...player, status: "CONNECTED", state: {} });
    room.revision += 1;
    await this.persist(room, player.id, "room.joined", {});
    return cloneRoom(room);
  }

  async leave(code: string, playerId: string, disconnected = false) {
    const room = this.read(code);
    const player = room.players.find((item) => item.id === playerId);
    if (!player) throw new RoomServiceError("ROOM_NOT_FOUND", "Ese jugador no pertenece a la sala.");
    player.status = disconnected ? "DISCONNECTED" : "LEFT";
    if (room.hostPlayerId === playerId) this.chooseHost(room);
    room.revision += 1;
    await this.persist(room, playerId, disconnected ? "player.disconnected" : "room.left", {});
    return cloneRoom(room);
  }

  async start(code: string, playerId: string) {
    const room = this.read(code);
    if (room.hostPlayerId !== playerId) throw new RoomServiceError("NOT_HOST", "Solo quien creó la sala puede iniciar el recorrido.");
    if (room.status !== "LOBBY") throw new RoomServiceError("INVALID_STATE", "La sala ya comenzó.");
    room.status = "PLAYING";
    room.state = { ...room.state, activeLevel: 1, route: 0, startedAt: new Date().toISOString() };
    for (const player of room.players) {
      const layout = bibleMazeLevels[0].layouts[0];
      const start = mazePointFor(layout, "S");
      player.state = { level: 1, route: 0, row: start.row, column: start.column, moves: 0, collected: [] };
    }
    room.revision += 1;
    await this.persist(room, playerId, "room.started", { activeLevel: 1 });
    return cloneRoom(room);
  }

  async action(code: string, playerId: string, action: MultiplayerRoomAction) {
    const room = this.read(code);
    if (room.status !== "PLAYING") throw new RoomServiceError("INVALID_STATE", "Inicia el recorrido antes de enviar acciones.");
    const player = room.players.find((item) => item.id === playerId && item.status === "CONNECTED");
    if (!player) throw new RoomServiceError("ROOM_NOT_FOUND", "El jugador ya no está conectado a la sala.");
    if (action.type === "maze.move") {
      const current = mazeState(player.state);
      const destination = nextMazePoint(current.point, action.direction);
      const destinationCell = mazeCellAt(current.layout, destination);
      if (!destinationCell || destinationCell === "#" || destinationCell === "~") throw new RoomServiceError("INVALID_STATE", "Ese movimiento no tiene un camino válido.");
      const destinationKey = `${destination.row}-${destination.column}`;
      const collected = destinationCell === "*" && !current.collected.includes(destinationKey) ? [...current.collected, destinationKey] : current.collected;
      const requiredTokens = mazeTokenKeys(current.layout);
      if (destinationCell === "E" && collected.length < requiredTokens.length) throw new RoomServiceError("INVALID_STATE", "Todavía faltan destellos antes de llegar a la salida.");
      player.state = {
        ...player.state,
        level: current.level,
        route: current.route,
        row: destination.row,
        column: destination.column,
        moves: current.moves + 1,
        collected,
        ...(destinationCell === "E" ? { completedLevel: current.level } : {}),
      };
    }
    if (action.type === "maze.level-complete") {
      const current = mazeState(player.state);
      const exit = mazePointFor(current.layout, "E");
      const requiredTokens = mazeTokenKeys(current.layout);
      if (action.level !== current.level || current.point.row !== exit.row || current.point.column !== exit.column || current.collected.length < requiredTokens.length) throw new RoomServiceError("INVALID_STATE", "El nivel no está listo para completarse.");
      player.state = { ...player.state, completedLevel: current.level };
    }
    room.revision += 1;
    await this.persist(room, playerId, action.type, action);
    return cloneRoom(room);
  }

  async disconnect(code: string, playerId: string) {
    try { return await this.leave(code, playerId, true); }
    catch (error) { if (error instanceof RoomServiceError && error.code === "ROOM_NOT_FOUND") return undefined; throw error; }
  }

  sweepExpired() {
    const now = Date.now();
    for (const [code, room] of this.rooms) if (new Date(room.expiresAt).getTime() <= now) this.rooms.delete(code);
  }
}
