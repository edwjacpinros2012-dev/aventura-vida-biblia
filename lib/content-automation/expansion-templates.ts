/**
 * Propuestas editoriales de contenido ampliable. Son datos, no rutas nuevas
 * ni código ejecutable: un moderador debe revisarlas antes de integrarlas en
 * un juego o capítulo publicado.
 */
export type ContentExpansionDraft = {
  contentKey: string;
  kind: "MAZE_LEVEL" | "RACE_PATH" | "FIND_DIFFERENCES" | "MEMORY_SET" | "LOGIC_CHALLENGE" | "ADVENTURE_CHAPTER";
  title: string;
  ageRange: { min: number; max: number };
  educationalGoal: string;
  story: string;
  instructions: string[];
  rewards: { xp: number; points: number };
  bibleReference: string;
  reviewChecklist: string[];
};

type DraftTemplate = Omit<ContentExpansionDraft, "contentKey">;

const templates: readonly DraftTemplate[] = [
  { kind: "MAZE_LEVEL", title: "El sendero del arca", ageRange: { min: 6, max: 10 }, educationalGoal: "Planificación espacial y obediencia paciente.", story: "Noé organiza un camino de provisiones para cuidar a cada animal.", instructions: ["Encuentra la ruta segura.", "Reúne los símbolos de cuidado.", "Llega a la salida sin cruzar los muros."], rewards: { xp: 45, points: 25 }, bibleReference: "Génesis 6:22", reviewChecklist: ["Comprobar que la ruta tiene salida.", "Verificar que los coleccionables son alcanzables.", "Revisar el texto bíblico y la edad sugerida."] },
  { kind: "RACE_PATH", title: "Camino de provisiones", ageRange: { min: 7, max: 11 }, educationalGoal: "Atención, ritmo y decisiones amables.", story: "Un equipo lleva provisiones por un sendero tranquilo para compartir con la comunidad.", instructions: ["Elige desvíos seguros.", "Recoge provisiones útiles.", "Completa el recorrido con calma."], rewards: { xp: 50, points: 30 }, bibleReference: "Gálatas 6:2", reviewChecklist: ["Comprobar controles táctiles y de teclado.", "Evitar obstáculos violentos.", "Revisar dificultad progresiva."] },
  { kind: "FIND_DIFFERENCES", title: "El jardín cuidado", ageRange: { min: 4, max: 8 }, educationalGoal: "Atención visual y cuidado de la creación.", story: "Dos escenas del jardín muestran pequeñas decisiones de cuidado por descubrir.", instructions: ["Observa ambas escenas.", "Encuentra las diferencias con calma.", "Lee la enseñanza final."], rewards: { xp: 35, points: 20 }, bibleReference: "Génesis 2:15", reviewChecklist: ["Usar únicamente ilustraciones originales autorizadas.", "Definir coordenadas de diferencias comprobables.", "No incluir texto pequeño difícil de leer."] },
  { kind: "MEMORY_SET", title: "Parejas que animan", ageRange: { min: 5, max: 10 }, educationalGoal: "Memoria visual y vocabulario positivo.", story: "Encuentra parejas de gestos que ayudan a una comunidad a crecer.", instructions: ["Voltea dos cartas.", "Busca las parejas.", "Descubre un mensaje de ánimo."], rewards: { xp: 40, points: 25 }, bibleReference: "1 Tesalonicenses 5:11", reviewChecklist: ["No repetir símbolos existentes sin variación.", "Comprobar pares y dificultad del tablero.", "Revisar enseñanza y respuesta final."] },
  { kind: "LOGIC_CHALLENGE", title: "Patrones de sabiduría", ageRange: { min: 7, max: 12 }, educationalGoal: "Patrones, secuencias y toma de decisiones.", story: "Una luz del mapa se enciende cuando cada patrón se ordena correctamente.", instructions: ["Mira el patrón.", "Elige la pieza que sigue.", "Lee la explicación antes de continuar."], rewards: { xp: 45, points: 30 }, bibleReference: "Proverbios 2:6", reviewChecklist: ["Validar una respuesta correcta por reto.", "Evitar ambigüedad visual.", "Escalar dificultad por edad."] },
  { kind: "ADVENTURE_CHAPTER", title: "Una mesa para todos", ageRange: { min: 6, max: 12 }, educationalGoal: "Comprensión lectora, servicio y cooperación.", story: "El equipo prepara una mesa de bienvenida y decide cómo incluir a cada visitante.", instructions: ["Lee cada escena.", "Elige una acción amable.", "Completa una pregunta de comprensión."], rewards: { xp: 55, points: 35 }, bibleReference: "Romanos 12:13", reviewChecklist: ["Comprobar coherencia de decisiones.", "Validar respuestas y referencia.", "Asegurar un mensaje inclusivo y apropiado."] },
];

function indexFor(dateKey: string) {
  return [...dateKey].reduce((total, character) => total + character.charCodeAt(0), 0) % templates.length;
}

export function contentExpansionDraftFor(dateKey: string): ContentExpansionDraft {
  const template = templates[indexFor(dateKey)];
  return { ...template, contentKey: `propuesta-${template.kind.toLowerCase()}-${dateKey}` };
}

export function validateContentExpansionDraft(draft: ContentExpansionDraft) {
  const errors: string[] = [];
  // Los tipos internos conservan guiones bajos (por ejemplo, `maze_level`).
  // El identificador se deriva de ese tipo y debe seguir siendo validable.
  if (!/^propuesta-[a-z_-]+-\d{4}-\d{2}-\d{2}$/.test(draft.contentKey)) errors.push("identificador de propuesta inválido");
  if (!draft.title.trim() || !draft.story.trim() || !draft.educationalGoal.trim()) errors.push("texto editorial incompleto");
  if (draft.ageRange.min < 2 || draft.ageRange.max > 14 || draft.ageRange.min > draft.ageRange.max) errors.push("edad sugerida inválida");
  if (draft.instructions.length < 2 || draft.instructions.some((instruction) => !instruction.trim())) errors.push("instrucciones incompletas");
  if (!/\d/.test(draft.bibleReference)) errors.push("referencia bíblica incompleta");
  if (draft.rewards.xp < 0 || draft.rewards.xp > 100 || draft.rewards.points < 0 || draft.rewards.points > 100) errors.push("recompensa fuera de límites");
  return { valid: errors.length === 0, errors };
}
