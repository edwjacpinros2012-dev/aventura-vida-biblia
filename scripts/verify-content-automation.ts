import { contentExpansionDraftFor, validateContentExpansionDraft } from "@/lib/content-automation/expansion-templates";
import { dailyBibleChallengeFor } from "@/lib/daily-bible-challenge";
import { validateDailyBibleChallenge } from "@/lib/content-automation/daily-content-service";

const failures: string[] = [];
const ids = new Set<string>();
const start = Date.UTC(2026, 0, 1, 12);

for (let day = 0; day < 90; day += 1) {
  const date = new Date(start + day * 86_400_000);
  const challenge = dailyBibleChallengeFor(date);
  const challengeValidation = validateDailyBibleChallenge(challenge);
  if (!challengeValidation.valid) failures.push(`${challenge.id}: ${challengeValidation.errors.join(", ")}`);
  if (ids.has(challenge.id)) failures.push(`${challenge.id}: identificador duplicado`);
  ids.add(challenge.id);
  const draftValidation = validateContentExpansionDraft(contentExpansionDraftFor(challenge.dateKey));
  if (!draftValidation.valid) failures.push(`${challenge.id}: borrador inválido (${draftValidation.errors.join(", ")})`);
}

if (failures.length) {
  console.error(`Fallaron ${failures.length} validaciones de contenido:`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("PASS: 90 retos diarios y 90 borradores editoriales válidos, sin IDs duplicados. Esta prueba no carga secretos ni llama al proveedor; usa brain:live para comprobar la conexión de IA.");
