import type { ChapterId, Objective } from "./types";
export const CHAPTER_OBJECTIVES: Record<ChapterId,Objective[]> = {
 portal:[{id:"lights",title:"Reunir luces",description:"Encuentra las tres luces del claro.",status:"active",count:0,target:3},{id:"portal",title:"Activar portal",description:"Interactúa con el portal.",status:"pending"}],
 ship:[{id:"crystals",title:"Encontrar cristales",description:"Busca tres cristales de energía.",status:"active",count:0,target:3},{id:"rescue",title:"Rescate amistoso",description:"Libera a la criatura.",status:"pending"}],
 armies:[{id:"strategy",title:"Estrategia protectora",description:"Organiza a tus compañeros y protege el campamento.",status:"active"}],
 flood:[{id:"evacuation",title:"Evacuación",description:"Guía a los campistas a terreno elevado.",status:"active"}],
 forest:[{id:"path",title:"Camino seguro",description:"Sigue las pistas del bosque.",status:"active"}],
 "fruit-tree":[{id:"riddle",title:"Acertijos",description:"Resuelve las pistas del árbol.",status:"active"}],
 "rock-avalanche":[{id:"mountain",title:"Ruta de montaña",description:"Encuentra refugio y cruza con seguridad.",status:"active"}]
};
export function countObjective(id: ChapterId, objectiveId: string, amount = 1){ const list=CHAPTER_OBJECTIVES[id] ?? []; return list.map(o=>o.id===objectiveId?{...o,status:(o.count ?? 0)+amount >= (o.target ?? 1)?"completed" as const:"active" as const,count:Math.min(o.target ?? 1,(o.count ?? 0)+amount)}:o); }
