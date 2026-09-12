import { z } from "zod";

export const MULTIPLAYER_GAME_KEYS = ["bible-maze"] as const;
export type MultiplayerGameKey = (typeof MULTIPLAYER_GAME_KEYS)[number];
export type MultiplayerRoomStatus = "LOBBY" | "PLAYING" | "FINISHED" | "CLOSED";
export type MultiplayerParticipantStatus = "CONNECTED" | "DISCONNECTED" | "LEFT";

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

export type MultiplayerError = { message: string; code: "INVALID_INPUT" | "ROOM_NOT_FOUND" | "ROOM_FULL" | "NOT_HOST" | "INVALID_STATE" | "RATE_LIMITED" };
export type MultiplayerResponse = { room?: MultiplayerRoomSnapshot; error?: MultiplayerError };

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
    level: z.number().int().min(1).max(7),
    row: z.number().int().min(0).max(12),
    column: z.number().int().min(0).max(12),
    moves: z.number().int().min(0).max(5000),
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

export type ClientToServerEvents = {
  "room:create": (payload: z.infer<typeof createRoomSchema>, respond: (response: MultiplayerResponse) => void) => void;
  "room:join": (payload: z.infer<typeof joinRoomSchema>, respond: (response: MultiplayerResponse) => void) => void;
  "room:leave": (payload: z.infer<typeof roomCommandSchema>, respond: (response: MultiplayerResponse) => void) => void;
  "room:start": (payload: z.infer<typeof roomCommandSchema>, respond: (response: MultiplayerResponse) => void) => void;
  "room:action": (payload: z.infer<typeof roomActionRequestSchema>, respond: (response: MultiplayerResponse) => void) => void;
};

export type ServerToClientEvents = {
  "room:state": (room: MultiplayerRoomSnapshot) => void;
  "room:error": (error: MultiplayerError) => void;
};
