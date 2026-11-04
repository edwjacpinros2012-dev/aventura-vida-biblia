import { centralBrainEditorialContextFor, centralBrainPolicy } from "@/lib/central-brain/editorial-service";
import { internalGameRegistry } from "@/lib/games/registry";
import { dailyBibleChallengeFor } from "@/lib/daily-bible-challenge";
import { playableGamePackFromAiProposal } from "@/lib/central-brain/game-content";

const context = centralBrainEditorialContextFor(dailyBibleChallengeFor(new Date("2026-01-15T12:00:00-05:00")));

if (!context.games.length) throw new Error("El cerebro central no recibió juegos internos.");
if (!context.adventures.length) throw new Error("El cerebro central no recibió aventuras autorizadas.");
for (const game of context.games) {
  if (!internalGameRegistry[game.gameKey]) throw new Error(`El contexto incluye un módulo inexistente: ${game.gameKey}`);
}
if (!centralBrainPolicy.forbidden.includes("economy.award") || !centralBrainPolicy.forbidden.includes("pvp.resolve")) {
  throw new Error("La política debe bloquear economía y resultados PvP.");
}
const playablePack = playableGamePackFromAiProposal({
  kind: "QUIZ_DRAFT",
  title: "Reto del arca",
  description: "Una pregunta para recordar el cuidado de Dios.",
  educationalGoal: "Comprensión lectora bíblica.",
  ageMin: 6,
  ageMax: 9,
  bibleReference: "Génesis 6:22",
  story: "Noé completa con cuidado la tarea que recibió.",
  instructions: ["Lee la pregunta.", "Elige la respuesta.", "Descubre la explicación."],
  rewardXp: 20,
  rewardPoints: 15,
  targetGameSlug: "preguntas-de-aventura",
  targetAdventureSlug: "",
  questions: [{ prompt: "¿Qué hizo Noé según Génesis 6:22?", options: ["Todo lo que Dios le mandó", "Nada", "Una fiesta"], correct: 0, explanation: "El versículo enseña que Noé obedeció." }, { prompt: "¿Qué valor muestra el relato?", options: ["Obediencia", "Burla", "Prisa"], correct: 0, explanation: "Noé siguió las instrucciones con cuidado." }],
});
if (!playablePack || playablePack.questions.length !== 2) throw new Error("La propuesta aprobada no pudo convertirse en un pack jugable de preguntas.");

console.log(`PASS: cerebro central editorial con ${context.games.length} juegos y ${context.adventures.length} aventuras autorizados; los packs de preguntas aprobados se integran en un módulo jugable y economía/PvP permanecen fuera de sus permisos.`);
