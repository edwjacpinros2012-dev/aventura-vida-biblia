export type DuelQuestion = {
  id: string;
  category: string;
  prompt: string;
  options: [string, string, string, string];
  correct: number;
  explanation: string;
};

// Banco propio y breve para el primer modo PvP. La respuesta correcta nunca
// sale del servidor antes de que la ronda se cierre.
export const duelQuestions: DuelQuestion[] = [
  { id: "noe", category: "Historias", prompt: "¿Quién construyó un arca para cuidar a su familia y a los animales?", options: ["Noé", "David", "Moisés", "Jonás"], correct: 0, explanation: "Noé preparó el arca siguiendo las instrucciones de Dios." },
  { id: "mar", category: "Historias", prompt: "¿Qué abrió un camino en el mar para que el pueblo pudiera pasar?", options: ["Una escalera", "El viento de Dios", "Un puente", "Una roca"], correct: 1, explanation: "El relato cuenta que Dios abrió un camino en el mar." },
  { id: "pasos", category: "Versículos", prompt: "Completa la idea: “Tu palabra es lámpara a mis…”", options: ["manos", "juegos", "pasos", "sueños"], correct: 2, explanation: "El Salmo 119 usa una lámpara como imagen de guía para los pasos." },
  { id: "amable", category: "Valores", prompt: "Cuando alguien necesita ayuda, una respuesta amable es…", options: ["Reírse", "Ayudar con cuidado", "Ignorarlo", "Esconderse"], correct: 1, explanation: "Servir y cuidar es una manera de mostrar amor." },
  { id: "david", category: "Historias", prompt: "¿Qué llevaba David cuando fue a enfrentar su gran desafío?", options: ["Una corona", "Cinco piedras lisas", "Un escudo de oro", "Una escalera"], correct: 1, explanation: "David llevó piedras lisas y confió en Dios." },
  { id: "sabiduria", category: "Valores", prompt: "¿Qué puede ayudarte a responder con sabiduría cuando estás molesto?", options: ["Gritar", "Apurarse", "Respirar, orar y pensar", "Culpar"], correct: 2, explanation: "Pausar y pensar ayuda a tomar una buena decisión." },
];

export function duelQuestionFor(matchSeed: number, round: number) {
  return duelQuestions[(matchSeed + round - 1) % duelQuestions.length];
}
