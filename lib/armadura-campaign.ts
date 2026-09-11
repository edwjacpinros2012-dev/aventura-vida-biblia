import type { ArmorPieceId } from "@/types/player-progress";

export type CampaignWorld = {
  world: number;
  title: string;
  subtitle: string;
  status: "available" | "planned";
};

export type StagePlatform = { x: number; y: number; width: number };
export type StageToken = { id: string; x: number; y: number; secret?: boolean };
export type StageHazard = { id: string; x: number; width: number };

export type CampaignStage = {
  id: "armadura-level-1" | "armadura-level-2";
  level: 1 | 2;
  world: number;
  worldLabel: string;
  title: string;
  subtitle: string;
  intro: string;
  teaching: string;
  groundY: number;
  start: { x: number; y: number };
  platforms: StagePlatform[];
  tokens: StageToken[];
  hazards: StageHazard[];
  interaction: {
    x: number;
    label: string;
    prompt: string;
    response: string;
    question?: { text: string; options: string[]; correctOption: number; explanation: string };
  };
  goal: { x: number; label: string };
  reward: {
    points: number;
    xp: number;
    faithTokens: number;
    badge?: string;
    armorPiece?: ArmorPieceId;
    title: string;
    description: string;
  };
  nextNarrative: { title: string; text: string; action: string };
};

export const armorCampaignWorlds: CampaignWorld[] = [
  { world: 1, title: "El comienzo", subtitle: "El llamado", status: "available" },
  { world: 2, title: "La Armadura", subtitle: "En busca de la Armadura", status: "available" },
  { world: 3, title: "El valle del desafío", subtitle: "El gran desafío", status: "planned" },
  { world: 4, title: "El bosque de las pruebas", subtitle: "El bosque de las decisiones", status: "planned" },
  { world: 5, title: "El jardín del Espíritu", subtitle: "Los frutos del Espíritu", status: "planned" },
  { world: 6, title: "La batalla de la fe", subtitle: "Permanece firme", status: "planned" },
  { world: 7, title: "La ciudad celestial", subtitle: "La meta", status: "planned" },
];

export const armorCampaignStages: CampaignStage[] = [
  {
    id: "armadura-level-1",
    level: 1,
    world: 1,
    worldLabel: "Mundo 1 · El comienzo",
    title: "El llamado",
    subtitle: "Aprende a caminar por el Sendero Claro.",
    intro: "Elián encontró un mapa luminoso. Para que el camino se revele, necesita reunir destellos de fe y escuchar el consejo junto al Libro de la Vida.",
    teaching: "La valentía empieza con un buen paso, incluso cuando todavía estamos aprendiendo.",
    groundY: 84,
    start: { x: 7, y: 72 },
    platforms: [
      { x: 19, y: 69, width: 13 },
      { x: 38, y: 60, width: 15 },
      { x: 58, y: 71, width: 12 },
      { x: 75, y: 61, width: 13 },
    ],
    tokens: [
      { id: "l1-light-1", x: 15, y: 76 },
      { id: "l1-light-2", x: 25, y: 62 },
      { id: "l1-light-3", x: 44, y: 53 },
      { id: "l1-light-4", x: 64, y: 64 },
      { id: "l1-light-5", x: 81, y: 54, secret: true },
    ],
    hazards: [
      { id: "l1-cloud-1", x: 34, width: 7 },
      { id: "l1-cloud-2", x: 70, width: 6 },
    ],
    interaction: {
      x: 48,
      label: "Libro de la Vida",
      prompt: "Pulsa E cerca del libro para escuchar el mensaje.",
      response: "“Sé fuerte y valiente.” Un camino nuevo se abre cuando das tu primer paso con fe.",
    },
    goal: { x: 94, label: "Arco del Llamado" },
    reward: {
      points: 140,
      xp: 110,
      faithTokens: 5,
      badge: "Insignia del Valor",
      title: "¡Nivel completado!",
      description: "Ganaste la Insignia del Valor por recorrer el sendero con atención y esperanza.",
    },
    nextNarrative: {
      title: "Una señal entre las nubes",
      text: "La insignia brilla sobre el mapa. Una ruta hacia las Colinas de Justicia acaba de aparecer; allí podría estar la primera pieza de la Armadura.",
      action: "Seguir hacia el Nivel 2",
    },
  },
  {
    id: "armadura-level-2",
    level: 2,
    world: 2,
    worldLabel: "Mundo 2 · La Armadura",
    title: "En busca de la Armadura",
    subtitle: "Encuentra la primera pieza y abre la siguiente ruta.",
    intro: "En las Colinas de Justicia hay atajos, nubes que invitan a esperar y una pregunta que ilumina el puente final. Elián debe reunir todos los símbolos antes de cruzar.",
    teaching: "Elegir lo justo también es cuidar, decir la verdad y hacer lo correcto cuando nadie mira.",
    groundY: 84,
    start: { x: 7, y: 72 },
    platforms: [
      { x: 16, y: 67, width: 12 },
      { x: 32, y: 56, width: 12 },
      { x: 49, y: 67, width: 13 },
      { x: 67, y: 55, width: 12 },
      { x: 84, y: 67, width: 9 },
    ],
    tokens: [
      { id: "l2-light-1", x: 12, y: 76 },
      { id: "l2-light-2", x: 22, y: 59 },
      { id: "l2-light-3", x: 38, y: 49, secret: true },
      { id: "l2-light-4", x: 56, y: 60 },
      { id: "l2-light-5", x: 73, y: 48 },
      { id: "l2-light-6", x: 88, y: 60 },
    ],
    hazards: [
      { id: "l2-cloud-1", x: 27, width: 6 },
      { id: "l2-cloud-2", x: 61, width: 6 },
      { id: "l2-cloud-3", x: 79, width: 5 },
    ],
    interaction: {
      x: 58,
      label: "Baliza de sabiduría",
      prompt: "Pulsa E junto a la baliza para resolver su pregunta.",
      response: "La baliza se enciende. El puente de luz reconoce una respuesta sabia.",
      question: {
        text: "¿Qué pieza de la Armadura de Dios nos recuerda elegir lo correcto?",
        options: ["La Coraza de Justicia", "El Sombrero del Viento", "Las Botas de Carrera"],
        correctOption: 0,
        explanation: "La Coraza de Justicia nos recuerda vivir con justicia y hacer lo correcto.",
      },
    },
    goal: { x: 95, label: "Santuario de Justicia" },
    reward: {
      points: 190,
      xp: 150,
      faithTokens: 6,
      armorPiece: "coraza-de-justicia",
      title: "¡Has conseguido la Coraza de Justicia!",
      description: "La primera pieza de la Armadura ya acompaña a Elián. El mapa revela el valle del próximo desafío.",
    },
    nextNarrative: {
      title: "El valle se ilumina",
      text: "Con la Coraza de Justicia, Elián puede continuar. El Mundo 3 — El valle del desafío — ya está desbloqueado en el mapa y se prepara como la próxima gran aventura.",
      action: "Volver al mapa de campaña",
    },
  },
];

export function getArmorCampaignStage(level: 1 | 2) {
  return armorCampaignStages.find((stage) => stage.level === level);
}
