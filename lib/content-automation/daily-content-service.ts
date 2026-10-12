import { GeneratedContentSource, GeneratedContentStatus, MissionStatus, ScheduledJobStatus } from "@prisma/client";
import { dailyBibleChallengeFor, dailyBibleDateKey, type DailyBibleChallenge } from "@/lib/daily-bible-challenge";
import { contentExpansionDraftFor, validateContentExpansionDraft } from "@/lib/content-automation/expansion-templates";
import { prisma } from "@/lib/prisma";

const JOB_KEY = "daily-bible-content";
const CONTENT_KIND = "DAILY_BIBLE_CHALLENGE";
const MAX_REWARD = 500;
const RUN_STALE_AFTER_MS = 20 * 60 * 1000;

export type DailyContentRunResult = {
  status: "published" | "already-processed" | "in-progress";
  dateKey: string;
  contentKey: string;
  missionId?: string;
};

function dateForKey(dateKey: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) throw new Error("La fecha de contenido no es válida.");
  return new Date(`${dateKey}T12:00:00-05:00`);
}

function challengeForDateKey(dateKey: string) {
  const challenge = dailyBibleChallengeFor(dateForKey(dateKey));
  if (challenge.dateKey !== dateKey) throw new Error("La fecha del reto no coincide con el calendario de la plataforma.");
  return challenge;
}

/** Validación estricta para las plantillas confiables y futuras salidas de IA. */
export function validateDailyBibleChallenge(challenge: DailyBibleChallenge) {
  const errors: string[] = [];
  if (!/^nivel-diario-\d{4}-\d{2}-\d{2}$/.test(challenge.id) || challenge.id !== `nivel-diario-${challenge.dateKey}`) errors.push("identificador diario inválido");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(challenge.dateKey)) errors.push("fecha inválida");
  if (!challenge.title.trim() || !challenge.objective.trim() || !challenge.description.trim()) errors.push("texto esencial ausente");
  if (!/\d/.test(challenge.verse.reference) || !challenge.verse.text.trim()) errors.push("referencia bíblica incompleta");
  if (challenge.rewardXp < 0 || challenge.rewardXp > MAX_REWARD || challenge.rewardPoints < 0 || challenge.rewardPoints > MAX_REWARD) errors.push("recompensa fuera de límites");
  if (challenge.questions.length < 3 || challenge.questions.length > 5) errors.push("cantidad de preguntas inválida");
  challenge.questions.forEach((question, index) => {
    if (!question.prompt.trim() || !question.explanation.trim()) errors.push(`pregunta ${index + 1} incompleta`);
    if (question.options.length < 2 || question.options.length > 4 || new Set(question.options.map((option) => option.trim().toLocaleLowerCase())).size !== question.options.length) errors.push(`opciones inválidas en pregunta ${index + 1}`);
    if (!Number.isInteger(question.correct) || question.correct < 0 || question.correct >= question.options.length) errors.push(`respuesta inválida en pregunta ${index + 1}`);
  });
  return { valid: errors.length === 0, errors };
}

function isDailyBibleChallenge(value: unknown): value is DailyBibleChallenge {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<DailyBibleChallenge>;
  return typeof candidate.id === "string" && typeof candidate.dateKey === "string" && typeof candidate.title === "string" && Array.isArray(candidate.questions)
    && validateDailyBibleChallenge(candidate as DailyBibleChallenge).valid;
}

type RunClaim = { run: Awaited<ReturnType<typeof prisma.contentGenerationRun.findUniqueOrThrow>>; claimed: boolean };

async function claimRun(dateKey: string): Promise<RunClaim> {
  const current = await prisma.contentGenerationRun.findUnique({ where: { jobKey_dateKey: { jobKey: JOB_KEY, dateKey } } });
  if (!current) {
    try {
      const run = await prisma.contentGenerationRun.create({ data: { jobKey: JOB_KEY, dateKey, source: GeneratedContentSource.TEMPLATE, status: ScheduledJobStatus.RUNNING } });
      return { run, claimed: true };
    } catch {
      const concurrent = await prisma.contentGenerationRun.findUniqueOrThrow({ where: { jobKey_dateKey: { jobKey: JOB_KEY, dateKey } } });
      return { run: concurrent, claimed: false };
    }
  }
  if (current.status === ScheduledJobStatus.SUCCEEDED) return { run: current, claimed: false };
  if (current.status === ScheduledJobStatus.RUNNING && Date.now() - current.startedAt.getTime() < RUN_STALE_AFTER_MS) return { run: current, claimed: false };

  const claim = await prisma.contentGenerationRun.updateMany({
    // La marca temporal es una compare-and-swap: solo una reejecución puede
    // reclamar una ejecución fallida o atascada.
    where: { id: current.id, status: { in: [ScheduledJobStatus.FAILED, ScheduledJobStatus.RUNNING] }, startedAt: current.startedAt },
    data: { status: ScheduledJobStatus.RUNNING, attempt: { increment: 1 }, error: null, startedAt: new Date(), finishedAt: null },
  });
  if (!claim.count) return { run: await prisma.contentGenerationRun.findUniqueOrThrow({ where: { id: current.id } }), claimed: false };
  return { run: await prisma.contentGenerationRun.findUniqueOrThrow({ where: { id: current.id } }), claimed: true };
}

/**
 * Materializa una plantilla bíblica validada una sola vez por fecha. No usa IA
 * en este momento: las plantillas curadas se publican tras validación local.
 */
export async function ensureDailyBibleContent(date = new Date()): Promise<DailyContentRunResult> {
  const dateKey = dailyBibleDateKey(date);
  const challenge = challengeForDateKey(dateKey);
  const claim = await claimRun(dateKey);
  const run = claim.run;
  if (!claim.claimed) return { status: run.status === ScheduledJobStatus.SUCCEEDED ? "already-processed" : "in-progress", dateKey, contentKey: challenge.id };

  try {
    const validation = validateDailyBibleChallenge(challenge);
    if (!validation.valid) throw new Error(`La plantilla diaria no pasó validación: ${validation.errors.join(", ")}`);
    const expansionDraft = contentExpansionDraftFor(dateKey);
    const draftValidation = validateContentExpansionDraft(expansionDraft);
    if (!draftValidation.valid) throw new Error(`La propuesta de expansión no pasó validación: ${draftValidation.errors.join(", ")}`);
    const game = await prisma.game.findUnique({ where: { slug: challenge.gameSlug }, select: { id: true } });
    if (!game) throw new Error(`El juego relacionado (${challenge.gameSlug}) no existe en la base de datos.`);

    const mission = await prisma.mission.upsert({
      where: { slug: challenge.id },
      update: {
        title: challenge.title,
        description: challenge.description,
        objective: { type: "daily_bible_challenge", contentKey: challenge.id, target: challenge.questions.length, verse: challenge.verse.reference },
        xpReward: challenge.rewardXp,
        pointsReward: challenge.rewardPoints,
        status: MissionStatus.ACTIVE,
        gameId: game.id,
      },
      create: {
        slug: challenge.id,
        title: challenge.title,
        description: challenge.description,
        startsAt: dateForKey(dateKey),
        endsAt: new Date(dateForKey(dateKey).getTime() + 24 * 60 * 60 * 1000),
        objective: { type: "daily_bible_challenge", contentKey: challenge.id, target: challenge.questions.length, verse: challenge.verse.reference },
        xpReward: challenge.rewardXp,
        pointsReward: challenge.rewardPoints,
        status: MissionStatus.ACTIVE,
        gameId: game.id,
      },
    });

    await prisma.generatedContent.upsert({
      where: { contentKey: challenge.id },
      update: {
        payload: challenge,
        validation: { valid: true, errors: [] },
        source: GeneratedContentSource.TEMPLATE,
        status: GeneratedContentStatus.PUBLISHED,
        publishedAt: new Date(),
        missionId: mission.id,
        runId: run.id,
      },
      create: {
        contentKey: challenge.id,
        kind: CONTENT_KIND,
        dateKey,
        version: 1,
        payload: challenge,
        validation: { valid: true, errors: [] },
        source: GeneratedContentSource.TEMPLATE,
        status: GeneratedContentStatus.PUBLISHED,
        publishedAt: new Date(),
        missionId: mission.id,
        runId: run.id,
      },
    });
    // El borrador prepara crecimiento de capítulos/juegos sin alterar rutas ni
    // publicar contenido automáticamente. Requiere revisión de moderación.
    await prisma.generatedContent.upsert({
      where: { contentKey: expansionDraft.contentKey },
      update: { payload: expansionDraft, validation: { valid: true, errors: [] }, source: GeneratedContentSource.TEMPLATE, status: GeneratedContentStatus.DRAFT, runId: run.id },
      create: { contentKey: expansionDraft.contentKey, kind: expansionDraft.kind, dateKey, version: 1, payload: expansionDraft, validation: { valid: true, errors: [] }, source: GeneratedContentSource.TEMPLATE, status: GeneratedContentStatus.DRAFT, runId: run.id },
    });

    await prisma.contentGenerationRun.update({
      where: { id: run.id },
      data: { status: ScheduledJobStatus.SUCCEEDED, output: { contentKey: challenge.id, missionId: mission.id, draftContentKey: expansionDraft.contentKey, source: "template" }, finishedAt: new Date() },
    });
    await prisma.auditLog.create({ data: { action: "PUBLISH", entity: "GeneratedContent", entityId: challenge.id, metadata: { source: "template", dateKey, runId: run.id } } });
    return { status: "published", dateKey, contentKey: challenge.id, missionId: mission.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo generar el contenido diario.";
    await prisma.contentGenerationRun.update({ where: { id: run.id }, data: { status: ScheduledJobStatus.FAILED, error: message.slice(0, 2_000), finishedAt: new Date() } }).catch(() => undefined);
    throw new Error(message);
  }
}

/** Lee contenido aprobado/publicado y mantiene una plantilla segura como respaldo sin DB. */
export async function publishedDailyBibleChallengeFor(date = new Date()) {
  const dateKey = dailyBibleDateKey(date);
  try {
    const content = await prisma.generatedContent.findFirst({ where: { kind: CONTENT_KIND, dateKey, status: GeneratedContentStatus.PUBLISHED }, orderBy: { version: "desc" }, select: { payload: true } });
    if (content && isDailyBibleChallenge(content.payload)) return content.payload;
  } catch {
    // El modo visitante y el uso offline conservan la plantilla validada.
  }
  return challengeForDateKey(dateKey);
}

export const dailyContentAutomation = {
  jobKey: JOB_KEY,
  contentKind: CONTENT_KIND,
  aiProviderConfigured: Boolean(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY),
};
