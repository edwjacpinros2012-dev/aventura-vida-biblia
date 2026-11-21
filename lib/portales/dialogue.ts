import type { ChapterId } from "./types";
export type DialogueLine = { speaker: "Narrador" | "Niño 1" | "Niño 2" | "Niño 3" | "Criatura"; text: string; choice?: { label: string; action: "pray" | "help" | "continue" }[] };
export const CHAPTER_DIALOGUE: Record<ChapterId, DialogueLine[]> = {
 portal:[{speaker:"Narrador",text:"Un brillo aparece en el bosque. Los tres amigos se acercan con curiosidad, pero deciden permanecer juntos."},{speaker:"Niño 1",text:"¿Y si pedimos a Dios que nos guíe y nos dé sabiduría?"},{speaker:"Niño 2",text:"¡Sí! Podemos ayudarnos y explorar con cuidado."},{speaker:"Niño 3",text:"Busquemos las tres luces. No dejemos a nadie atrás."}],
 ship:[{speaker:"Narrador",text:"Al cruzar, encuentran una nave misteriosa. Una criatura pequeña pide ayuda desde una cápsula."},{speaker:"Criatura",text:"No quiero asustarlos. Estoy atrapada y necesito ayuda para salir."},{speaker:"Niño 1",text:"Vamos a ayudarte. Podemos encontrar los cristales y abrir la cápsula con cuidado."}],
 armies:[{speaker:"Narrador",text:"Los dos grupos se acercan. Los niños buscan una forma de proteger a todos y resolver el conflicto sin lastimar a nadie."},{speaker:"Niño 2",text:"¡Construyamos refugios y ayudemos a que todos estén a salvo!"}],
 flood:[{speaker:"Narrador",text:"El agua sube cerca del campamento. El equipo busca rutas seguras y ayuda a las personas a llegar a terreno elevado."}],
 forest:[{speaker:"Narrador",text:"El bosque es desconocido. Los niños caminan juntos, siguen las señales y respetan a los animales."}],
 "fruit-tree":[{speaker:"Narrador",text:"Un árbol brillante guarda frutos mágicos. Cada fruto es una pista para un acertijo de paciencia y sabiduría."}],
 "rock-avalanche":[{speaker:"Narrador",text:"En la montaña se escuchan rocas moverse. El grupo se detiene, observa y busca una ruta segura lejos del peligro."}]
};
export function getDialogue(chapter: ChapterId){return CHAPTER_DIALOGUE[chapter] ?? [];}
