import type { ChapterId } from "./types";
export type CollectibleKind = "light" | "crystal" | "fruit" | "clue" | "supply";
export type Collectible = { id: string; chapter: ChapterId; kind: CollectibleKind; label: string; position: [number,number,number]; value?: number };
export const CHAPTER_COLLECTIBLES: Partial<Record<ChapterId,Collectible[]>> = {
 portal:[{id:"portal-light-1",chapter:"portal",kind:"light",label:"Luz de esperanza",position:[-5,1,-3],value:1},{id:"portal-light-2",chapter:"portal",kind:"light",label:"Luz de amistad",position:[5,1,-7],value:1},{id:"portal-light-3",chapter:"portal",kind:"light",label:"Luz de valentía",position:[0,1,4],value:1}],
 ship:[{id:"ship-crystal-1",chapter:"ship",kind:"crystal",label:"Cristal de energía",position:[-4,1,-3],value:1},{id:"ship-crystal-2",chapter:"ship",kind:"crystal",label:"Cristal de energía",position:[4,1,-5],value:1},{id:"ship-crystal-3",chapter:"ship",kind:"crystal",label:"Cristal de energía",position:[0,1,-9],value:1}]
};
export function collectibleCount(items: Collectible[], ids: Set<string>){return items.reduce((count,item)=>count+(ids.has(item.id)?1:0),0);}
