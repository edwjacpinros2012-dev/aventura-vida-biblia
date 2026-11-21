import { CHAPTERS } from "./chapters";
import type { ChapterId, PlayerProfile } from "./types";
export function isChapterUnlocked(id:ChapterId,profile:PlayerProfile){const chapter=CHAPTERS.find(c=>c.id===id);if(!chapter)return false;if(chapter.order===1)return true;const previous=CHAPTERS.find(c=>c.order===chapter.order-1);return !!previous&&profile.completedChapterIds.includes(previous.id);}
export function unlockedChapterIds(profile:PlayerProfile){return CHAPTERS.filter(c=>isChapterUnlocked(c.id,profile)).map(c=>c.id);}
export function nextUnlockedChapter(profile:PlayerProfile):ChapterId|null{return CHAPTERS.find(c=>isChapterUnlocked(c.id,profile)&&!profile.completedChapterIds.includes(c.id))?.id??null;}
