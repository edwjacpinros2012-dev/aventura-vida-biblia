import { officialCharacters } from "@/lib/characters/catalog";
import type { ExistingAvatarId } from "./types";
export type GameAvatar = { id: ExistingAvatarId; label: string; full: string; profile: string; thumbnail: string };
export const GAME_AVATARS: GameAvatar[] = officialCharacters.filter(c=>c.status==="active").map(c=>({id:c.id as ExistingAvatarId,label:c.name,full:c.asset,profile:c.avatar,thumbnail:c.thumbnail}));
export function resolveGameAvatar(id?: string){return GAME_AVATARS.find(a=>a.id===id) ?? GAME_AVATARS[0] ?? null;}
export function getCompanionAvatars(playerId: string, count=2){return GAME_AVATARS.filter(a=>a.id!==playerId).slice(0,count);}
