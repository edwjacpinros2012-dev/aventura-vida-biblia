import type { ChapterId, Objective } from "./types";
export type MissionSnapshot = { chapterId: ChapterId; objectives: Objective[]; collectedIds: string[]; completed: boolean };
export function createMissionSnapshot(chapterId: ChapterId, objectives: Objective[]): MissionSnapshot { return {chapterId,objectives:objectives.map(o=>({...o})),collectedIds:[],completed:false}; }
export function collectMissionItem(state: MissionSnapshot, collectibleId: string, objectiveId: string): MissionSnapshot {
 if(state.completed || state.collectedIds.includes(collectibleId)) return state;
 const collectedIds=[...state.collectedIds,collectibleId];
 const objectives=state.objectives.map(o=>o.id===objectiveId?{...o,count:(o.count??0)+1,status:(o.count??0)+1>=(o.target??1)?"completed" as const:"active" as const}:o);
 return {...state,collectedIds,objectives,completed:objectives.every(o=>o.status==="completed")};
}
export function completeMissionObjective(state: MissionSnapshot, objectiveId: string): MissionSnapshot { const objectives=state.objectives.map(o=>o.id===objectiveId?{...o,status:"completed" as const}:o); return {...state,objectives,completed:objectives.every(o=>o.status==="completed")}; }
export function missionProgress(state: MissionSnapshot){ const total=state.objectives.length; const complete=state.objectives.filter(o=>o.status==="completed").length; return {complete,total,percent:total?Math.round(complete/total*100):0}; }
