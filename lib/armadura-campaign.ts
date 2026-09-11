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
export type StageChallenge =
  | { kind: "precision"; text: string; explanation: string }
  | { kind: "collection"; text: string; options: string[]; requiredOptions: string[]; explanation: string }
  | { kind: "memory"; text: string; sequence: string[]; explanation: string };

export type CampaignStage = {
  id: `armadura-level-${1 | 2 | 3 | 4 | 5 | 6 | 7}`;
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7;
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
    challenge?: StageChallenge;
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
  { world: 3, title: "El valle del desafío", subtitle: "David y Goliat", status: "available" },
  { world: 4, title: "El bosque de las pruebas", subtitle: "El bosque de las decisiones", status: "available" },
  { world: 5, title: "El jardín del Espíritu", subtitle: "Los frutos del Espíritu", status: "available" },
  { world: 6, title: "La batalla de la fe", subtitle: "Permanece firme", status: "available" },
  { world: 7, title: "La ciudad celestial", subtitle: "La meta", status: "available" },
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
  {
    id: "armadura-level-3",
    level: 3,
    world: 3,
    worldLabel: "Mundo 3 · El valle del desafío",
    title: "David y Goliat",
    subtitle: "Una prueba de valor, estrategia y precisión.",
    intro: "David acompaña a Elián en una representación amable: una gran sombra de duda se disipa con una decisión precisa y una fe tranquila.",
    teaching: "La fe nos ayuda a dar pasos valientes con sabiduría, sin hacer daño a nadie.",
    groundY: 84,
    start: { x: 7, y: 72 },
    platforms: [{ x: 17, y: 67, width: 10 }, { x: 31, y: 58, width: 12 }, { x: 47, y: 70, width: 11 }, { x: 63, y: 58, width: 14 }, { x: 82, y: 66, width: 9 }],
    tokens: [{ id: "l3-light-1", x: 13, y: 76 }, { id: "l3-light-2", x: 22, y: 59 }, { id: "l3-light-3", x: 37, y: 50 }, { id: "l3-light-4", x: 52, y: 63 }, { id: "l3-light-5", x: 70, y: 50 }, { id: "l3-light-6", x: 87, y: 59, secret: true }],
    hazards: [{ id: "l3-rock-1", x: 27, width: 5 }, { id: "l3-rock-2", x: 58, width: 6 }, { id: "l3-rock-3", x: 77, width: 5 }],
    interaction: { x: 69, label: "Hondilla de luz", prompt: "Pulsa E cerca de la hondilla para completar la prueba de precisión.", response: "El destello llegó al centro. La gran sombra se disipa y el valle vuelve a estar en calma.", challenge: { kind: "precision", text: "Envía el destello cuando la luz esté dentro del círculo dorado.", explanation: "David avanzó con fe, prudencia y confianza; esta aventura celebra su valor sin violencia gráfica." } },
    goal: { x: 95, label: "Puente del Valor" },
    reward: { points: 220, xp: 170, faithTokens: 7, armorPiece: "cinturon-de-verdad", badge: "Paso de Fe", title: "¡La fe te hizo avanzar!", description: "Recibiste el Cinturón de la Verdad y una nueva insignia de valor." },
    nextNarrative: { title: "Un sendero entre árboles", text: "El mapa revela que las decisiones pequeñas también iluminan grandes caminos.", action: "Seguir hacia el Nivel 4" },
  },
  {
    id: "armadura-level-4",
    level: 4,
    world: 4,
    worldLabel: "Mundo 4 · El bosque de las pruebas",
    title: "El bosque de las decisiones",
    subtitle: "Elige una ruta sabia y descubre rincones secretos.",
    intro: "Tres senderos se cruzan en el bosque. Las señales no piden rapidez: invitan a pensar, obedecer y cuidar de los demás.",
    teaching: "La sabiduría escucha, espera y elige el bien aun cuando existe un atajo fácil.",
    groundY: 84,
    start: { x: 7, y: 72 },
    platforms: [{ x: 15, y: 68, width: 13 }, { x: 32, y: 56, width: 11 }, { x: 46, y: 69, width: 10 }, { x: 62, y: 55, width: 14 }, { x: 80, y: 67, width: 10 }],
    tokens: [{ id: "l4-light-1", x: 11, y: 76 }, { id: "l4-light-2", x: 23, y: 60 }, { id: "l4-light-3", x: 37, y: 48, secret: true }, { id: "l4-light-4", x: 51, y: 62 }, { id: "l4-light-5", x: 69, y: 48 }, { id: "l4-light-6", x: 86, y: 60 }],
    hazards: [{ id: "l4-mist-1", x: 27, width: 5 }, { id: "l4-mist-2", x: 56, width: 6 }, { id: "l4-mist-3", x: 76, width: 5 }],
    interaction: { x: 65, label: "Cruce de caminos", prompt: "Pulsa E junto a las señales para elegir un camino.", response: "Elegiste con paciencia. El sendero secreto se abrió entre los árboles.", question: { text: "Un compañero se retrasó en la caminata. ¿Qué camino muestra sabiduría?", options: ["Seguir solo para llegar primero", "Esperar, avisar y caminar juntos", "Esconder el mapa"], correctOption: 1, explanation: "La paciencia y el cuidado ayudan a que nadie se quede atrás." } },
    goal: { x: 95, label: "Claro de Paz" },
    reward: { points: 230, xp: 180, faithTokens: 7, armorPiece: "calzado-de-paz", badge: "Explorador Sabio", title: "¡El bosque te mostró una ruta nueva!", description: "Obtuviste el Calzado de la Paz por elegir con cuidado." },
    nextNarrative: { title: "Semillas de muchos colores", text: "Al salir del bosque, Elián ve un jardín donde cada fruto guarda una enseñanza para compartir.", action: "Seguir hacia el Nivel 5" },
  },
  {
    id: "armadura-level-5",
    level: 5,
    world: 5,
    worldLabel: "Mundo 5 · El jardín del Espíritu",
    title: "Los frutos del Espíritu",
    subtitle: "Reúne semillas de bien y cuida el jardín.",
    intro: "Nueve zonas del jardín brillan con amor, gozo, paz, paciencia, benignidad, bondad, fe, mansedumbre y dominio propio.",
    teaching: "Los frutos del Espíritu se cultivan poco a poco en nuestras decisiones diarias.",
    groundY: 84,
    start: { x: 7, y: 72 },
    platforms: [{ x: 15, y: 68, width: 12 }, { x: 30, y: 57, width: 13 }, { x: 47, y: 68, width: 11 }, { x: 62, y: 56, width: 13 }, { x: 80, y: 67, width: 10 }],
    tokens: [{ id: "l5-light-1", x: 12, y: 76 }, { id: "l5-light-2", x: 21, y: 59 }, { id: "l5-light-3", x: 36, y: 49 }, { id: "l5-light-4", x: 52, y: 61 }, { id: "l5-light-5", x: 68, y: 49, secret: true }, { id: "l5-light-6", x: 85, y: 60 }],
    hazards: [{ id: "l5-puddle-1", x: 26, width: 5 }, { id: "l5-puddle-2", x: 57, width: 5 }, { id: "l5-puddle-3", x: 76, width: 5 }],
    interaction: { x: 68, label: "Cantero de frutos", prompt: "Pulsa E junto al cantero para escoger tres frutos del Espíritu.", response: "Las semillas despiertan. El jardín celebra una decisión llena de amor y dominio propio.", challenge: { kind: "collection", text: "Toca Amor, Paz y Dominio propio para cuidar este cantero.", options: ["Amor", "Gozo", "Paz", "Paciencia", "Fe", "Dominio propio"], requiredOptions: ["Amor", "Paz", "Dominio propio"], explanation: "Cada fruto puede crecer cuando practicamos el bien en pequeñas acciones." } },
    goal: { x: 95, label: "Fuente de Gozo" },
    reward: { points: 250, xp: 195, faithTokens: 9, armorPiece: "escudo-de-fe", badge: "Jardinero de Esperanza", title: "¡El jardín floreció!", description: "El Escudo de la Fe se forma con cada decisión que cuida y anima." },
    nextNarrative: { title: "Luces en la noche", text: "La ruta se vuelve más desafiante. Elián necesitará recordar las señales que ya aprendió.", action: "Seguir hacia el Nivel 6" },
  },
  {
    id: "armadura-level-6",
    level: 6,
    world: 6,
    worldLabel: "Mundo 6 · La batalla de la fe",
    title: "Permanece firme",
    subtitle: "Recuerda las señales y supera la gran prueba.",
    intro: "No hay combate gráfico en este camino: hay plataformas difíciles, nubes de duda y una secuencia de luz para recordar con calma.",
    teaching: "Permanecer firme puede significar respirar, recordar la verdad y pedir ayuda cuando un reto parece grande.",
    groundY: 84,
    start: { x: 7, y: 72 },
    platforms: [{ x: 14, y: 68, width: 10 }, { x: 29, y: 53, width: 10 }, { x: 44, y: 66, width: 10 }, { x: 59, y: 51, width: 10 }, { x: 74, y: 63, width: 10 }, { x: 87, y: 53, width: 7 }],
    tokens: [{ id: "l6-light-1", x: 11, y: 76 }, { id: "l6-light-2", x: 19, y: 60 }, { id: "l6-light-3", x: 34, y: 45 }, { id: "l6-light-4", x: 49, y: 59 }, { id: "l6-light-5", x: 64, y: 44 }, { id: "l6-light-6", x: 79, y: 56 }, { id: "l6-light-7", x: 90, y: 45, secret: true }],
    hazards: [{ id: "l6-cloud-1", x: 24, width: 5 }, { id: "l6-cloud-2", x: 54, width: 5 }, { id: "l6-cloud-3", x: 84, width: 4 }],
    interaction: { x: 76, label: "Panel de memoria", prompt: "Pulsa E junto al panel para repetir su secuencia de luz.", response: "Recordaste la secuencia. La luz de la fe abre el último puente.", challenge: { kind: "memory", text: "Toca las señales en este orden: Libro, Escudo, Estrella.", sequence: ["Libro", "Escudo", "Estrella"], explanation: "Recordar palabras de ánimo puede ayudarnos a permanecer firmes." } },
    goal: { x: 95, label: "Puerta de la Ciudad" },
    reward: { points: 280, xp: 220, faithTokens: 10, armorPiece: "yelmo-de-salvacion", badge: "Corazón Firme", title: "¡Permaneciste firme!", description: "Obtuviste el Yelmo de la Salvación al superar la prueba con calma." },
    nextNarrative: { title: "La ciudad aparece", text: "Al otro lado del puente se levanta una ciudad llena de luz. La última meta está cerca.", action: "Seguir hacia el Nivel 7" },
  },
  {
    id: "armadura-level-7",
    level: 7,
    world: 7,
    worldLabel: "Mundo 7 · La ciudad celestial",
    title: "La meta",
    subtitle: "Un último recorrido para celebrar todo el camino.",
    intro: "La Ciudad Celestial recibe a Elián con puentes de luz. Reúne los últimos destellos y responde desde el corazón.",
    teaching: "La meta de una aventura no es llegar solo: es crecer, agradecer y compartir la luz con otros.",
    groundY: 84,
    start: { x: 7, y: 72 },
    platforms: [{ x: 13, y: 67, width: 12 }, { x: 28, y: 55, width: 12 }, { x: 44, y: 64, width: 11 }, { x: 59, y: 50, width: 12 }, { x: 75, y: 61, width: 11 }, { x: 88, y: 50, width: 6 }],
    tokens: [{ id: "l7-light-1", x: 10, y: 76 }, { id: "l7-light-2", x: 19, y: 59 }, { id: "l7-light-3", x: 34, y: 47 }, { id: "l7-light-4", x: 50, y: 57 }, { id: "l7-light-5", x: 65, y: 43 }, { id: "l7-light-6", x: 80, y: 54 }, { id: "l7-light-7", x: 91, y: 43, secret: true }],
    hazards: [{ id: "l7-cloud-1", x: 24, width: 4 }, { id: "l7-cloud-2", x: 55, width: 4 }, { id: "l7-cloud-3", x: 84, width: 4 }],
    interaction: { x: 80, label: "Puerta de celebración", prompt: "Pulsa E junto a la puerta para resolver la última pregunta.", response: "La puerta se abre con una luz suave: tu aventura está lista para celebrarse.", question: { text: "¿Qué puedes hacer con lo que aprendiste en la aventura?", options: ["Compartir amor y esperanza", "Guardarlo para no ayudar", "Olvidar a los demás"], correctOption: 0, explanation: "Cada aprendizaje puede convertirse en una acción amable para alguien más." } },
    goal: { x: 95, label: "Plaza de la Luz" },
    reward: { points: 350, xp: 300, faithTokens: 12, armorPiece: "espada-de-la-palabra", badge: "Gran Aventura Completada", title: "¡AVENTURA COMPLETADA!", description: "Elián reunió la Armadura del Espíritu y llegó a la Ciudad Celestial." },
    nextNarrative: { title: "Una celebración de luz", text: "Has llegado a la meta. Tu mapa guarda cada destello, cada pieza de armadura y cada paso de fe.", action: "Ver celebración final" },
  },
];

export function getArmorCampaignStage(level: CampaignStage["level"]) {
  return armorCampaignStages.find((stage) => stage.level === level);
}
