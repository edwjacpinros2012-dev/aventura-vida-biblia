import { z } from "zod";

export const MULTIPLAYER_GAME_KEYS = ["bible-maze", "bible-quiz-duel"] as const;
export type MultiplayerGameKey = (typeof MULTIPLAYER_GAME_KEYS)[number];
export type MultiplayerRoomStatus = "LOBBY" | "PLAYING" | "FINISHED" | "CLOSED";
export type MultiplayerParticipantStatus = "CONNECTED" | "DISCONNECTED" | "LEFT";

// Contratos de la misma infraestructura de salas. PVP_FUTURE no se expone ni
// activa hasta contar con reglas y validaciones específicas de cada juego.
export type MatchMode = "COOPERATIVE" | "PVP_FUTURE";
export type MatchState = "WAITING" | "ACTIVE" | "FINISHED" | "ABANDONED";
export type MatchResult = "WIN" | "LOSS" | "DRAW" | "ABANDONED";
export type MatchAction = { type: string; sequence: number; payload: Record<string, unknown> };
export type MatchmakingRequest = { gameKey: MultiplayerGameKey; mode: MatchMode; maxPlayers: 1 | 2 | 3 | 4 };
export type PlayerSession = { playerKey: string; accountId?: string; roomCode?: string; connectedAt: string };

export type PublicPlayerIdentity = {
  id: string;
  nickname: string;
  avatar: string;
};

export type MultiplayerParticipant = PublicPlayerIdentity & {
  status: MultiplayerParticipantStatus;
  state: Record<string, unknown>;
};

export type MultiplayerRoomSnapshot = {
  code: string;
  gameKey: MultiplayerGameKey;
  maxPlayers: number;
  hostPlayerId: string;
  status: MultiplayerRoomStatus;
  revision: number;
  state: Record<string, unknown>;
  players: MultiplayerParticipant[];
  expiresAt: string;
};

export type MultiplayerError = { message: string; code: "INVALID_INPUT" | "ROOM_NOT_FOUND" | "ROOM_FULL" | "NOT_HOST" | "INVALID_STATE" | "RATE_LIMITED" | "NOT_AUTHENTICATED" | "NOT_ALLOWED" };
export type MultiplayerResponse = { room?: MultiplayerRoomSnapshot; error?: MultiplayerError };

export type RoomChatMessage = {
  id: string;
  roomCode: string;
  author: { nickname: string; avatar: string };
  text: string;
  presetKey?: string;
  createdAt: string;
};

export const playerIdentitySchema = z.object({
  id: z.string().trim().min(12).max(80).regex(/^[a-zA-Z0-9_-]+$/),
  nickname: z.string().trim().min(2).max(20).regex(/^[\p{L}\p{N}_ -]+$/u),
  avatar: z.string().trim().min(1).max(8),
});

export const createRoomSchema = z.object({
  gameKey: z.enum(MULTIPLAYER_GAME_KEYS),
  maxPlayers: z.number().int().min(1).max(4),
  player: playerIdentitySchema,
});

export const joinRoomSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-HJ-NP-Z2-9]{6}$/),
  player: playerIdentitySchema,
});

export const roomCodeSchema = z.string().trim().toUpperCase().regex(/^[A-HJ-NP-Z2-9]{6}$/);

export const roomActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("maze.move"),
    direction: z.enum(["up", "down", "left", "right"]),
  }),
  z.object({
    type: z.literal("maze.level-complete"),
    level: z.number().int().min(1).max(7),
  }),
]);

export type MultiplayerRoomAction = z.infer<typeof roomActionSchema>;

export const roomActionRequestSchema = z.object({
  code: roomCodeSchema,
  action: roomActionSchema,
});

export const roomCommandSchema = z.object({ code: roomCodeSchema });

export const roomChatSchema = z.object({
  code: roomCodeSchema,
  text: z.string().optional(),
  presetKey: z.enum(["great_job", "keep_going", "good_game", "you_can_do_it", "bless_you"]).optional(),
}).refine((value) => Boolean(value.text) !== Boolean(value.presetKey), { message: "Envía un mensaje o una frase positiva." });

export type RoomChatResponse = { message?: RoomChatMessage; error?: MultiplayerError };

export type PvpPlayerSnapshot = {
  id: string;
  nickname: string;
  avatar: string;
  score: number;
  status: "CONNECTED" | "DISCONNECTED" | "LEFT";
  answered: boolean;
};

export type PvpQuestionSnapshot = {
  id: string;
  prompt: string;
  options: string[];
  category: string;
};

export type PvpDuelSnapshot = {
  id: string;
  code: string;
  status: "QUEUED" | "PLAYING" | "ROUND_RESULT" | "FINISHED" | "ABANDONED";
  revision: number;
  round: number;
  totalRounds: number;
  question?: PvpQuestionSnapshot;
  players: PvpPlayerSnapshot[];
  lastRound?: { correctOption: number; explanations: string; scores: Record<string, number> };
  result?: { winnerId?: string; outcome: "WIN" | "LOSS" | "DRAW" | "ABANDONED"; reason: "SCORE" | "DISCONNECT" | "DRAW" };
  disconnectDeadline?: string;
};

export const pvpQueueSchema = z.object({
  gameKey: z.literal("bible-quiz-duel"),
  player: playerIdentitySchema,
});

export const pvpAnswerSchema = z.object({
  matchId: z.string().min(8).max(100),
  round: z.number().int().min(1).max(10),
  option: z.number().int().min(0).max(3),
});

export const pvpContinueSchema = z.object({ matchId: z.string().min(8).max(100), round: z.number().int().min(1).max(10) });
export const pvpRejoinSchema = z.object({ matchId: z.string().min(8).max(100), player: playerIdentitySchema });
export type PvpResponse = { match?: PvpDuelSnapshot; queued?: boolean; error?: MultiplayerError };

export type ClientToServerEvents = {
  "room:create": (payload: z.infer<typeof createRoomSchema>, respond: (response: MultiplayerResponse) => void) => void;
  "room:join": (payload: z.infer<typeof joinRoomSchema>, respond: (response: MultiplayerResponse) => void) => void;
  "room:leave": (payload: z.infer<typeof roomCommandSchema>, respond: (response: MultiplayerResponse) => void) => void;
  "room:start": (payload: z.infer<typeof roomCommandSchema>, respond: (response: MultiplayerResponse) => void) => void;
  "room:action": (payload: z.infer<typeof roomActionRequestSchema>, respond: (response: MultiplayerResponse) => void) => void;
  "room:chat": (payload: z.infer<typeof roomChatSchema>, respond: (response: RoomChatResponse) => void) => void;
  "pvp:queue": (payload: z.infer<typeof pvpQueueSchema>, respond: (response: PvpResponse) => void) => void;
  "pvp:cancel": (payload: Record<string, never>, respond: (response: PvpResponse) => void) => void;
  "pvp:answer": (payload: z.infer<typeof pvpAnswerSchema>, respond: (response: PvpResponse) => void) => void;
  "pvp:continue": (payload: z.infer<typeof pvpContinueSchema>, respond: (response: PvpResponse) => void) => void;
  "pvp:rejoin": (payload: z.infer<typeof pvpRejoinSchema>, respond: (response: PvpResponse) => void) => void;
};

export type ServerToClientEvents = {
  "room:state": (room: MultiplayerRoomSnapshot) => void;
  "room:error": (error: MultiplayerError) => void;
  "room:chat": (message: RoomChatMessage) => void;
  "pvp:state": (match: PvpDuelSnapshot) => void;
  "pvp:queued": () => void;
  "pvp:error": (error: MultiplayerError) => void;
};
