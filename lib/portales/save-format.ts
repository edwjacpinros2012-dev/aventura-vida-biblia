import type { ChapterId, PlayerProfile } from "./types";
export const SAVE_VERSION=1;
export type GameSave={version:typeof SAVE_VERSION; profile:PlayerProfile; currentChapter:ChapterId; collectedByChapter:Partial<Record<ChapterId,string[]>>; savedAt:string};
export function makeSave(profile:PlayerProfile,currentChapter:ChapterId,collectedByChapter:GameSave["collectedByChapter"]={}):GameSave{return {version:SAVE_VERSION,profile,currentChapter,collectedByChapter,savedAt:new Date().toISOString()};}
export function validateSave(value:unknown):value is GameSave {if(!value||typeof value!=="object")return false;const v=value as Partial<GameSave>;return v.version===SAVE_VERSION&&typeof v.currentChapter==="string"&&!!v.profile&&typeof v.profile==="object"&&typeof v.savedAt==="string";}
