import { PlayerProgressEventKind, Prisma, SessionStatus } from "@prisma/client";
import { armorCampaignStages } from "@/lib/armadura-campaign";
import { dailyBibleChallengeFor, dailyBibleDateKey } from "@/lib/daily-bible-challenge";
import { applyAdventureCoinChange } from "@/lib/economy/service";
import { prisma } from "@/lib/prisma";
import { levelForXp, type ArmorPieceId, type PlayerAchievementId, type PlayerProgress, type RewardResult } from "@/types/player-progress";

const MINUTES_IN_DAY = 86_400_000;

export class ProgressError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

type JsonRecord = Record<string, unknown>;

export type ServerProgressState = {
  progress: PlayerProgress;
  adventureCoins: number;
};

function platformDateKey(date = new Date()) {
  return dailyBibleDateKey(date);
}

function calendarDistance(previous: string, current: string) {
  const first = Date.parse(`${previous}T00:00:00Z`);
  const second = Date.parse(`${current}T00:00:00Z`);
  return Number.isFinite(first) && Number.isFinite(second) ? Math.round((second - first) / MINUTES_IN_DAY) : Number.NaN;
}

function nextStreak(previous: string | null, current: string, existing: number) {
  if (previous === current) return existing;
  return calendarDistance(previous ?? "", current) === 1 ? existing + 1 : 1;
}

function achievementIdForSlug(slug: string): PlayerAchievementId | null {
  const mapping: Record<string, PlayerAchievementId> = {
    "primera-aventura": "first-adventure",
    "cinco-juegos": "curious-explorer",
    "siete-dias": "steady-light",
  };
  return mapping[slug] ?? null;
}

function numberCriterion(value: Prisma.JsonValue | undefined, key: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return 0;
  const candidate = (value as JsonRecord)[key];
  return typeof candidate === "number" && Number.isSafeInteger(candidate) && candidate > 0 ? candidate : 0;
}

function armorPiece(value: unknown): ArmorPieceId | undefined {
  return value === "cinturon-de-verdad" || value === "coraza-de-justicia" || value === "calzado-de-paz" || value === "escudo-de-fe" || value === "yelmo-de-salvacion" || value === "espada-de-la-palabra"
    ? value
    : undefined;
}

function jsonRecord(value: Prisma.JsonValue | null | undefined): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};
}

function gameReward(game: { xpReward: number; maxPoints: number }) {
  const xp = Math.max(0, Math.min(500, game.xpReward));
  const points = Math.max(0, Math.min(2_000, game.maxPoints));
  // Las monedas son una regla de servidor basada en la recompensa configurada,
  // nunca una cifra enviada por el navegador.
  const coins = Math.max(1, Math.min(30, Math.ceil(xp / 20)));
  return { xp, points, coins };
}

async function awardEligibleAchievements(
  tx: Prisma.TransactionClient,
  userId: string,
  stats: { gamesPlayed: number; streak: number; quizGames: number },
) {
  const achievements = await tx.achievement.findMany({ where: { active: true }, select: { id: true, slug: true, criteria: true, xpReward: true } });
  const owned = new Set((await tx.userAchievement.findMany({ where: { userId }, select: { achievementId: true } })).map((item) => item.achievementId));
  const awarded: Array<{ slug: string; xpReward: number }> = [];
  for (const achievement of achievements) {
    if (owned.has(achievement.id)) continue;
    const completedGames = numberCriterion(achievement.criteria, "completedGames");
    const activeDays = numberCriterion(achievement.criteria, "activeDays");
    const quizGames = numberCriterion(achievement.criteria, "quizGames");
    const eligible = (completedGames > 0 && stats.gamesPlayed >= completedGames)
      || (activeDays > 0 && stats.streak >= activeDays)
      || (quizGames > 0 && stats.quizGames >= quizGames);
    if (!eligible) continue;
    await tx.userAchievement.create({ data: { userId, achievementId: achievement.id } });
    awarded.push({ slug: achievement.slug, xpReward: Math.max(0, achievement.xpReward) });
  }
  return awarded;
}

async function activityStats(tx: Prisma.TransactionClient, userId: string) {
  const [gamesPlayed, quizGames] = await Promise.all([
    tx.playerProgressEvent.count({ where: { userId, kind: PlayerProgressEventKind.GAME_COMPLETION } }),
    tx.playerProgressEvent.count({ where: { userId, kind: PlayerProgressEventKind.GAME_COMPLETION, game: { slug: "preguntas-de-aventura" } } }),
  ]);
  return { gamesPlayed, quizGames };
}

async function updateProfileForReward(
  tx: Prisma.TransactionClient,
  input: { userId: string; xp: number; points: number; source: string; sourceId: string; coins: number; gameCompletion?: boolean },
) {
  const profile = await tx.profile.findUnique({ where: { userId: input.userId } });
  if (!profile) throw new ProgressError("Esta cuenta no tiene un perfil de jugador.", 409);
  const today = platformDateKey();
  const streak = nextStreak(profile.lastActiveDate, today, profile.streak);
  const gameStats = await activityStats(tx, input.userId);
  const totalsBeforeAchievements = {
    gamesPlayed: gameStats.gamesPlayed,
    streak,
    quizGames: gameStats.quizGames,
  };
  const achievementAwards = await awardEligibleAchievements(tx, input.userId, totalsBeforeAchievements);
  const achievementXp = achievementAwards.reduce((total, achievement) => total + achievement.xpReward, 0);
  const totalXp = profile.totalXp + input.xp + achievementXp;
  const updated = await tx.profile.update({
    where: { userId: input.userId },
    data: {
      totalXp,
      points: { increment: input.points },
      level: levelForXp(totalXp),
      streak,
      lastActiveDate: today,
      gamesPlayed: input.gameCompletion ? { increment: 1 } : undefined,
    },
  });
  if (input.xp > 0) await tx.xpTransaction.create({ data: { userId: input.userId, amount: input.xp, reason: input.source, sourceId: input.sourceId } });
  for (const achievement of achievementAwards) {
    if (achievement.xpReward > 0) await tx.xpTransaction.create({ data: { userId: input.userId, amount: achievement.xpReward, reason: "ACHIEVEMENT", sourceId: achievement.slug } });
  }
  if (input.coins > 0) await applyAdventureCoinChange(tx, {
    userId: input.userId,
    amount: input.coins,
    reason: input.source,
    sourceId: input.sourceId,
    idempotencyKey: `progress:${input.source}:${input.sourceId}:${input.userId}`,
  });
  return { profile: updated, achievementIds: achievementAwards.map((achievement) => achievementIdForSlug(achievement.slug)).filter((item): item is PlayerAchievementId => Boolean(item)) };
}

/** Inicia una sesión que después será la única que puede recibir la recompensa. */
export async function startGameSession(userId: string, gameSlug: string) {
  const game = await prisma.game.findFirst({ where: { slug: gameSlug, status: "PUBLISHED" }, select: { id: true } });
  if (!game) throw new ProgressError("Ese juego no está disponible.", 404);
  const session = await prisma.gameSession.create({ data: { userId, gameId: game.id, metadata: { source: "web-or-pwa" } } });
  return { sessionId: session.id };
}

/**
 * Recompensa una sola sesión. Los importes provienen de Game en PostgreSQL;
 * `sessionId` y el estado ACTIVE impiden que el cliente reintente para sumar.
 */
export async function completeGameSession(userId: string, sessionId: string) {
  const result = await prisma.$transaction(async (tx) => {
    const session = await tx.gameSession.findFirst({ where: { id: sessionId, userId }, include: { game: true } });
    if (!session) throw new ProgressError("No encontramos esa partida.", 404);
    const prior = await tx.playerProgressEvent.findUnique({
      where: { userId_kind_sourceKey: { userId, kind: PlayerProgressEventKind.GAME_COMPLETION, sourceKey: session.id } },
    });
    if (prior) return { repeated: true };
    if (session.status !== SessionStatus.ACTIVE) throw new ProgressError("Esta partida ya no puede entregar una recompensa.", 409);
    const claimed = await tx.gameSession.updateMany({ where: { id: session.id, status: SessionStatus.ACTIVE }, data: { status: SessionStatus.COMPLETED, endedAt: new Date() } });
    if (claimed.count !== 1) return { repeated: true };
    const reward = gameReward(session.game);
    const event = await tx.playerProgressEvent.create({
      data: { userId, kind: PlayerProgressEventKind.GAME_COMPLETION, sourceKey: session.id, gameId: session.gameId, xpAwarded: reward.xp, pointsAwarded: reward.points, coinsAwarded: reward.coins, payload: { gameSlug: session.game.slug } },
    });
    const update = await updateProfileForReward(tx, { userId, ...reward, source: "GAME_COMPLETION", sourceId: event.id, gameCompletion: true });
    await tx.gameProgress.upsert({
      where: { userId_gameId: { userId, gameId: session.gameId } },
      create: { userId, gameId: session.gameId, data: { lastCompletedAt: new Date().toISOString() }, completed: true },
      update: { completed: true },
    });
    await tx.reward.createMany({ data: [
      { userId, type: "XP", amount: reward.xp, label: "Recompensa de juego", source: "GAME_COMPLETION", sourceId: event.id },
      { userId, type: "POINTS", amount: reward.points, label: "Puntos de juego", source: "GAME_COMPLETION", sourceId: event.id },
    ] });
    return { repeated: false, reward, achievementIds: update.achievementIds };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  return { ...result, state: await progressStateForUser(userId) };
}

/** La misión diaria se concede una única vez por fecha y cuenta. */
export async function completeDailyChallenge(userId: string, challengeId: string) {
  const current = dailyBibleChallengeFor();
  if (challengeId !== current.id) throw new ProgressError("Ese reto diario ya no está activo.", 409);
  const result = await prisma.$transaction(async (tx) => {
    const mission = await tx.mission.findUnique({ where: { slug: challengeId } });
    if (!mission || mission.status !== "ACTIVE") throw new ProgressError("El reto de hoy aún no está sincronizado con el servidor.", 409);
    const prior = await tx.playerProgressEvent.findUnique({ where: { userId_kind_sourceKey: { userId, kind: PlayerProgressEventKind.DAILY_CHALLENGE, sourceKey: challengeId } } });
    if (prior) return { repeated: true };
    const coins = Math.max(1, Math.min(30, Math.ceil(mission.xpReward / 20)));
    const event = await tx.playerProgressEvent.create({
      data: { userId, kind: PlayerProgressEventKind.DAILY_CHALLENGE, sourceKey: challengeId, gameId: mission.gameId, xpAwarded: mission.xpReward, pointsAwarded: mission.pointsReward, coinsAwarded: coins, payload: { verseReference: current.verse.reference, dateKey: current.dateKey } },
    });
    await tx.missionProgress.upsert({
      where: { missionId_userId: { missionId: mission.id, userId } },
      create: { missionId: mission.id, userId, progress: { completedQuestions: current.questions.length }, completedAt: new Date() },
      update: { progress: { completedQuestions: current.questions.length }, completedAt: new Date() },
    });
    const update = await updateProfileForReward(tx, { userId, xp: mission.xpReward, points: mission.pointsReward, coins, source: "DAILY_CHALLENGE", sourceId: event.id });
    await tx.reward.createMany({ data: [
      { userId, type: "XP", amount: mission.xpReward, label: "Reto diario", source: "DAILY_CHALLENGE", sourceId: event.id },
      { userId, type: "POINTS", amount: mission.pointsReward, label: "Puntos del reto diario", source: "DAILY_CHALLENGE", sourceId: event.id },
    ] });
    return { repeated: false, reward: { xp: mission.xpReward, points: mission.pointsReward, coins }, achievementIds: update.achievementIds };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  return { ...result, state: await progressStateForUser(userId) };
}

/** La campaña se valida frente al catálogo de siete niveles, no frente a valores enviados por el cliente. */
export async function completeCampaignLevel(userId: string, levelId: string, elapsedSeconds: number) {
  const stage = armorCampaignStages.find((candidate) => candidate.id === levelId);
  if (!stage) throw new ProgressError("Ese nivel de campaña no existe.", 404);
  const result = await prisma.$transaction(async (tx) => {
    const prior = await tx.playerProgressEvent.findUnique({ where: { userId_kind_sourceKey: { userId, kind: PlayerProgressEventKind.CAMPAIGN_LEVEL, sourceKey: levelId } } });
    if (prior) return { repeated: true };
    const reward = { xp: stage.reward.xp, points: stage.reward.points, coins: Math.max(1, Math.min(30, Math.ceil(stage.reward.xp / 20))) };
    const event = await tx.playerProgressEvent.create({
      data: {
        userId,
        kind: PlayerProgressEventKind.CAMPAIGN_LEVEL,
        sourceKey: levelId,
        xpAwarded: reward.xp,
        pointsAwarded: reward.points,
        coinsAwarded: reward.coins,
        payload: { level: stage.level, unlocksLevel: Math.min(7, stage.level + 1), faithTokens: stage.reward.faithTokens, badge: stage.reward.badge, armorPiece: stage.reward.armorPiece, elapsedSeconds: Math.max(0, Math.min(7_200, Math.round(elapsedSeconds))) },
      },
    });
    const update = await updateProfileForReward(tx, { userId, ...reward, source: "CAMPAIGN_LEVEL", sourceId: event.id, gameCompletion: true });
    return { repeated: false, reward, achievementIds: update.achievementIds };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  return { ...result, state: await progressStateForUser(userId) };
}

/** Resumen central que hidrata la web y la PWA para una cuenta autenticada. */
export async function progressStateForUser(userId: string): Promise<ServerProgressState> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      wallet: true,
      gameProgress: { include: { game: { select: { slug: true } } } },
      progressEvents: { include: { game: { select: { slug: true } } }, orderBy: { createdAt: "asc" } },
      achievements: { include: { achievement: { select: { slug: true } } } },
    },
  });
  if (!user?.profile) throw new ProgressError("Esta cuenta no tiene un perfil de jugador.", 409);
  const events = user.progressEvents;
  const campaignEvents = events.filter((event) => event.kind === PlayerProgressEventKind.CAMPAIGN_LEVEL);
  const campaign = campaignEvents.reduce<PlayerProgress["armorCampaign"]>((current, event) => {
    const payload = jsonRecord(event.payload);
    const piece = armorPiece(payload.armorPiece);
    const badge = typeof payload.badge === "string" ? payload.badge : undefined;
    const completed = current.completedLevelIds.includes(event.sourceKey) ? current.completedLevelIds : [...current.completedLevelIds, event.sourceKey];
    return {
      unlockedLevel: Math.max(current.unlockedLevel, typeof payload.unlocksLevel === "number" ? payload.unlocksLevel : 7),
      completedLevelIds: completed,
      faithTokens: current.faithTokens + (typeof payload.faithTokens === "number" ? Math.max(0, payload.faithTokens) : 0),
      badges: badge && !current.badges.includes(badge) ? [...current.badges, badge] : current.badges,
      armorPieces: piece && !current.armorPieces.includes(piece) ? [...current.armorPieces, piece] : current.armorPieces,
      adventureSeconds: current.adventureSeconds + (typeof payload.elapsedSeconds === "number" ? Math.max(0, payload.elapsedSeconds) : 0),
    };
  }, { unlockedLevel: 7, completedLevelIds: [], faithTokens: 0, badges: [], armorPieces: [], adventureSeconds: 0 });
  const learnedVerses = events.flatMap((event) => {
    const verse = jsonRecord(event.payload).verseReference;
    return typeof verse === "string" ? [verse] : [];
  }).filter((verse, index, values) => values.indexOf(verse) === index);
  const achievementIds = user.achievements.flatMap(({ achievement }) => {
    const id = achievementIdForSlug(achievement.slug);
    return id ? [id] : [];
  });
  return {
    adventureCoins: user.wallet?.adventureCoins ?? 0,
    progress: {
      points: user.profile.points,
      xp: user.profile.totalXp,
      level: user.profile.level,
      streak: user.profile.streak,
      lastPlayedOn: user.profile.lastActiveDate ?? undefined,
      gamesCompleted: user.profile.gamesPlayed,
      completedGameIds: events.filter((event) => event.kind === PlayerProgressEventKind.GAME_COMPLETION).flatMap((event) => event.game?.slug ? [event.game.slug] : []),
      learnedVerses,
      dailyChallengeIds: events.filter((event) => event.kind === PlayerProgressEventKind.DAILY_CHALLENGE).map((event) => event.sourceKey),
      achievementIds,
      gameProgress: Object.fromEntries(user.gameProgress.map((item) => [item.game.slug, jsonRecord(item.data)])),
      armorCampaign: campaign,
    },
  };
}

export function rewardResultForState(state: ServerProgressState, achievementIds: PlayerAchievementId[] = []): RewardResult {
  return {
    totalPoints: state.progress.points,
    totalXp: state.progress.xp,
    level: state.progress.level,
    streak: state.progress.streak,
    newAchievementIds: achievementIds,
  };
}
