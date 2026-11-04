import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadLocalOpenAiEnvironment() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*(OPENAI_API_KEY|OPENAI_MODEL)\s*=\s*(.*?)\s*$/);
    if (!match || process.env[match[1]]) continue;
    const rawValue = match[2];
    const value = rawValue.startsWith('"') && rawValue.endsWith('"')
      ? rawValue.slice(1, -1)
      : rawValue;
    process.env[match[1]] = value;
  }
}

async function main() {
  loadLocalOpenAiEnvironment();

  const [{ dailyBibleChallengeFor }, { proposeCentralEditorialDraft }] = await Promise.all([
    import("@/lib/daily-bible-challenge"),
    import("@/lib/central-brain/editorial-service"),
  ]);

  const challenge = dailyBibleChallengeFor(new Date("2026-01-15T12:00:00-05:00"));
  const result = await proposeCentralEditorialDraft({ dateKey: challenge.dateKey, challenge });

  if (result.status !== "generated") {
    throw new Error(`La conexión de OpenAI no quedó disponible: ${result.reason}.`);
  }
  if (result.proposal.kind !== "QUIZ_DRAFT" || result.proposal.targetGameSlug !== "preguntas-de-aventura") {
    throw new Error("La generación real no respetó el adaptador jugable autorizado.");
  }

  console.log(JSON.stringify({
    status: "PASS",
    provider: result.provider,
    model: result.model,
    result: "draft-validated",
    targetGameSlug: result.proposal.targetGameSlug,
    questionCount: result.proposal.questions.length,
    approvedForPublication: false,
  }, null, 2));
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "La prueba real del cerebro central falló.";
  console.error(`FAIL: ${message.slice(0, 500)}`);
  process.exitCode = 1;
});
