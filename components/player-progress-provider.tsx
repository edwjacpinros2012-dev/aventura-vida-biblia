"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  levelForXp,
  type ArmorCampaignProgress,
  type ArmorPieceId,
  type CampaignLevelReward,
  type GameReward,
  type PlayerAchievementId,
  type PlayerProgress,
  type RewardResult,
} from "@/types/player-progress";
import { isSelectableAvatarKey } from "@/lib/characters/catalog";
import { games } from "@/lib/content";
import { flushPendingProgress, queueGameProgress } from "@/lib/offline/sync-client";

const STORAGE_KEY = "aventura-vida.player-progress.v2";
const IDENTITY_STORAGE_KEY = "aventura-vida.player-identity.v1";

export type GlobalPlayerIdentity = {
  accountId?: string;
  nickname: string;
  avatarKey: string;
  authenticated: boolean;
  /** Saldo devuelto por la cuenta autenticada; nunca se modifica desde el cliente. */
  adventureCoins?: number;
};

type ProgressSyncState = "local" | "pending" | "synced" | "error";
type ServerProgressResponse = { state: { progress: PlayerProgress; adventureCoins: number }; result: RewardResult };

const guestIdentity: GlobalPlayerIdentity = {
  nickname: "AventureroLuz",
  avatarKey: "fox",
  authenticated: false,
};

const initialArmorCampaign: ArmorCampaignProgress = {
  // Los siete niveles están disponibles durante la fase de pruebas de la campaña.
  unlockedLevel: 7,
  completedLevelIds: [],
  faithTokens: 0,
  badges: [],
  armorPieces: [],
  adventureSeconds: 0,
};

const initialProgress: PlayerProgress = {
  points: 0,
  xp: 0,
  level: 1,
  streak: 0,
  gamesCompleted: 0,
  completedGameIds: [],
  learnedVerses: [],
  dailyChallengeIds: [],
  achievementIds: [],
  gameProgress: {},
  armorCampaign: initialArmorCampaign,
};

type PlayerProgressContextValue = {
  progress: PlayerProgress;
  hydrated: boolean;
  identity: GlobalPlayerIdentity;
  identityReady: boolean;
  progressSyncState: ProgressSyncState;
  completeGame: (reward: GameReward) => RewardResult;
  completeDailyChallenge: (reward: GameReward) => RewardResult | null;
  completeCampaignLevel: (reward: CampaignLevelReward) => RewardResult;
  saveGameProgress: (gameId: string, data: Record<string, unknown>) => void;
  startAuthenticatedGame: (gameId: string) => Promise<string | null>;
  confirmAuthenticatedGame: (sessionId: string) => Promise<RewardResult | null>;
  confirmDailyChallenge: (challengeId: string) => Promise<RewardResult | null>;
  confirmCampaignLevel: (levelId: string, elapsedSeconds: number) => Promise<RewardResult | null>;
  selectAvatar: (avatarKey: string) => Promise<void>;
  resetProgress: () => void;
};

const PlayerProgressContext = createContext<PlayerProgressContextValue | null>(null);

function localDay(date = new Date()) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function previousDay(date = new Date()) {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return localDay(yesterday);
}

function safeProgress(value: unknown): PlayerProgress {
  if (!value || typeof value !== "object") return initialProgress;
  const candidate = value as Partial<PlayerProgress>;
  const storedCampaign = candidate.armorCampaign;
  const campaignCandidate = storedCampaign && typeof storedCampaign === "object" ? storedCampaign : initialArmorCampaign;
  const armorPieces = Array.isArray(campaignCandidate.armorPieces)
    ? campaignCandidate.armorPieces.filter((item): item is ArmorPieceId =>
      item === "cinturon-de-verdad" || item === "coraza-de-justicia" || item === "calzado-de-paz" || item === "escudo-de-fe" || item === "yelmo-de-salvacion" || item === "espada-de-la-palabra")
    : [];
  return {
    ...initialProgress,
    ...candidate,
    points: Number.isFinite(candidate.points) ? Math.max(0, Number(candidate.points)) : 0,
    xp: Number.isFinite(candidate.xp) ? Math.max(0, Number(candidate.xp)) : 0,
    gamesCompleted: Number.isFinite(candidate.gamesCompleted) ? Math.max(0, Number(candidate.gamesCompleted)) : 0,
    streak: Number.isFinite(candidate.streak) ? Math.max(0, Number(candidate.streak)) : 0,
    completedGameIds: Array.isArray(candidate.completedGameIds) ? candidate.completedGameIds.filter((item): item is string => typeof item === "string") : [],
    learnedVerses: Array.isArray(candidate.learnedVerses) ? candidate.learnedVerses.filter((item): item is string => typeof item === "string") : [],
    dailyChallengeIds: Array.isArray(candidate.dailyChallengeIds) ? candidate.dailyChallengeIds.filter((item): item is string => /^nivel-diario-\d{4}-\d{2}-\d{2}$/.test(item)) : [],
    achievementIds: Array.isArray(candidate.achievementIds) ? candidate.achievementIds.filter((item): item is PlayerAchievementId => typeof item === "string") : [],
    gameProgress: candidate.gameProgress && typeof candidate.gameProgress === "object" ? candidate.gameProgress : {},
    level: Number.isFinite(candidate.level) ? Math.max(1, Number(candidate.level)) : 1,
    armorCampaign: {
      unlockedLevel: Number.isFinite(campaignCandidate.unlockedLevel) ? Math.max(7, Number(campaignCandidate.unlockedLevel)) : 7,
      completedLevelIds: Array.isArray(campaignCandidate.completedLevelIds)
        ? campaignCandidate.completedLevelIds.filter((item): item is string => typeof item === "string")
        : [],
      faithTokens: Number.isFinite(campaignCandidate.faithTokens) ? Math.max(0, Number(campaignCandidate.faithTokens)) : 0,
      badges: Array.isArray(campaignCandidate.badges) ? campaignCandidate.badges.filter((item): item is string => typeof item === "string") : [],
      armorPieces,
      adventureSeconds: Number.isFinite(campaignCandidate.adventureSeconds) ? Math.max(0, Math.round(Number(campaignCandidate.adventureSeconds))) : 0,
    },
  };
}

function safeGuestIdentity(value: unknown): GlobalPlayerIdentity {
  if (!value || typeof value !== "object") return guestIdentity;
  const candidate = value as Partial<GlobalPlayerIdentity>;
  return {
    nickname: typeof candidate.nickname === "string" && candidate.nickname.trim() ? candidate.nickname.slice(0, 20) : guestIdentity.nickname,
    avatarKey: typeof candidate.avatarKey === "string" && isSelectableAvatarKey(candidate.avatarKey) ? candidate.avatarKey : guestIdentity.avatarKey,
    authenticated: false,
  };
}

function calculateNewAchievements(progress: PlayerProgress): PlayerAchievementId[] {
  const eligible: PlayerAchievementId[] = [];
  if (progress.gamesCompleted >= 1) eligible.push("first-adventure");
  if (progress.completedGameIds.length >= 3) eligible.push("curious-explorer");
  if (progress.learnedVerses.length >= 1) eligible.push("verse-keeper");
  if (progress.streak >= 3) eligible.push("steady-light");
  if (progress.gamesCompleted >= 8) eligible.push("game-master");
  return eligible.filter((id) => !progress.achievementIds.includes(id));
}

export function PlayerProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<PlayerProgress>(initialProgress);
  const [hydrated, setHydrated] = useState(false);
  const [identity, setIdentity] = useState<GlobalPlayerIdentity>(guestIdentity);
  const [identityReady, setIdentityReady] = useState(false);
  const [progressSyncState, setProgressSyncState] = useState<ProgressSyncState>("local");

  const applyServerState = useCallback((state: ServerProgressResponse["state"]) => {
    setProgress(safeProgress(state.progress));
    setIdentity((current) => current.authenticated ? { ...current, adventureCoins: Math.max(0, Number(state.adventureCoins) || 0) } : current);
    setProgressSyncState("synced");
  }, []);

  const fetchServerState = useCallback(async () => {
    const response = await fetch("/api/progress/state", { cache: "no-store" });
    if (!response.ok) throw new Error("No pudimos recuperar el progreso de tu cuenta.");
    const state = await response.json() as ServerProgressResponse["state"];
    applyServerState(state);
    return state;
  }, [applyServerState]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setProgress(safeProgress(JSON.parse(stored)));
      const storedIdentity = window.localStorage.getItem(IDENTITY_STORAGE_KEY);
      if (storedIdentity) setIdentity(safeGuestIdentity(JSON.parse(storedIdentity)));
    } catch {
      setProgress(initialProgress);
    } finally {
      setHydrated(true);
    }
    void fetch("/api/auth/me")
      .then((response) => response.ok ? response.json() as Promise<{ account: { nickname: string; avatarKey: string; adventureCoins: number } | null }> : null)
      .then(async (result) => {
        if (result?.account && result.account.avatarKey.trim()) {
          setIdentity({
            accountId: result.account.id,
            nickname: result.account.nickname,
            avatarKey: result.account.avatarKey,
            authenticated: true,
            adventureCoins: Math.max(0, Number(result.account.adventureCoins) || 0),
          });
          setProgressSyncState("pending");
          await fetchServerState().catch(() => setProgressSyncState("error"));
        }
      })
      .catch(() => undefined)
      .finally(() => setIdentityReady(true));
  }, [fetchServerState]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [hydrated, progress]);

  useEffect(() => {
    if (!identityReady || identity.authenticated) return;
    window.localStorage.setItem(IDENTITY_STORAGE_KEY, JSON.stringify(identity));
  }, [identity, identityReady]);

  const completeGame = useCallback((reward: GameReward): RewardResult => {
    // Las cuentas autenticadas muestran una vista previa hasta que GameShell
    // confirma la sesión con el servidor. No se modifica el saldo local.
    if (identity.authenticated) {
      setProgressSyncState("pending");
      return { totalPoints: progress.points, totalXp: progress.xp, level: progress.level, streak: progress.streak, newAchievementIds: [] };
    }
    const today = localDay();
    const streak = progress.lastPlayedOn === today ? progress.streak : progress.lastPlayedOn === previousDay() ? progress.streak + 1 : 1;
    const learnedVerses = reward.verseReference && !progress.learnedVerses.includes(reward.verseReference) ? [...progress.learnedVerses, reward.verseReference] : progress.learnedVerses;
    const partial: PlayerProgress = {
      ...progress,
      points: progress.points + Math.max(0, Math.round(reward.points)),
      xp: progress.xp + Math.max(0, Math.round(reward.xp)),
      streak,
      lastPlayedOn: today,
      gamesCompleted: progress.gamesCompleted + 1,
      completedGameIds: progress.completedGameIds.includes(reward.gameId) ? progress.completedGameIds : [...progress.completedGameIds, reward.gameId],
      learnedVerses,
    };
    const newAchievementIds = calculateNewAchievements(partial);
    const withAchievements = { ...partial, xp: partial.xp + newAchievementIds.length * 25, achievementIds: [...partial.achievementIds, ...newAchievementIds] };
    const completed = { ...withAchievements, level: levelForXp(withAchievements.xp) };
    setProgress(completed);
    return { totalPoints: completed.points, totalXp: completed.xp, level: completed.level, streak: completed.streak, newAchievementIds };
  }, [identity.authenticated, progress]);

  const completeCampaignLevel = useCallback((reward: CampaignLevelReward): RewardResult => {
    if (identity.authenticated) {
      setProgressSyncState("pending");
      return { totalPoints: progress.points, totalXp: progress.xp, level: progress.level, streak: progress.streak, newAchievementIds: [] };
    }
    const alreadyCompleted = progress.armorCampaign.completedLevelIds.includes(reward.levelId);
    if (alreadyCompleted) {
      return {
        totalPoints: progress.points,
        totalXp: progress.xp,
        level: progress.level,
        streak: progress.streak,
        newAchievementIds: [],
      };
    }

    const today = localDay();
    const streak = progress.lastPlayedOn === today ? progress.streak : progress.lastPlayedOn === previousDay() ? progress.streak + 1 : 1;
    const campaign: ArmorCampaignProgress = {
      ...progress.armorCampaign,
      unlockedLevel: Math.max(progress.armorCampaign.unlockedLevel, reward.unlocksLevel),
      completedLevelIds: [...progress.armorCampaign.completedLevelIds, reward.levelId],
      faithTokens: progress.armorCampaign.faithTokens + Math.max(0, Math.round(reward.faithTokens)),
      badges: reward.badge && !progress.armorCampaign.badges.includes(reward.badge) ? [...progress.armorCampaign.badges, reward.badge] : progress.armorCampaign.badges,
      armorPieces: reward.armorPiece && !progress.armorCampaign.armorPieces.includes(reward.armorPiece)
        ? [...progress.armorCampaign.armorPieces, reward.armorPiece]
        : progress.armorCampaign.armorPieces,
      adventureSeconds: progress.armorCampaign.adventureSeconds + Math.max(0, Math.round(reward.elapsedSeconds)),
    };
    const partial: PlayerProgress = {
      ...progress,
      points: progress.points + Math.max(0, Math.round(reward.points)),
      xp: progress.xp + Math.max(0, Math.round(reward.xp)),
      streak,
      lastPlayedOn: today,
      gamesCompleted: progress.gamesCompleted + 1,
      completedGameIds: [...progress.completedGameIds, reward.levelId],
      armorCampaign: campaign,
    };
    const newAchievementIds = calculateNewAchievements(partial);
    const withAchievements = { ...partial, xp: partial.xp + newAchievementIds.length * 25, achievementIds: [...partial.achievementIds, ...newAchievementIds] };
    const completed = { ...withAchievements, level: levelForXp(withAchievements.xp) };
    setProgress(completed);
    return { totalPoints: completed.points, totalXp: completed.xp, level: completed.level, streak: completed.streak, newAchievementIds };
  }, [identity.authenticated, progress]);

  // Los niveles diarios del modo visitante se guardan junto al mismo progreso
  // local. Un mismo id de fecha solo puede otorgar la recompensa una vez.
  const completeDailyChallenge = useCallback((reward: GameReward): RewardResult | null => {
    if (identity.authenticated) {
      setProgressSyncState("pending");
      return progress.dailyChallengeIds.includes(reward.gameId)
        ? null
        : { totalPoints: progress.points, totalXp: progress.xp, level: progress.level, streak: progress.streak, newAchievementIds: [] };
    }
    if (!/^nivel-diario-\d{4}-\d{2}-\d{2}$/.test(reward.gameId) || progress.dailyChallengeIds.includes(reward.gameId)) return null;
    const today = localDay();
    const streak = progress.lastPlayedOn === today ? progress.streak : progress.lastPlayedOn === previousDay() ? progress.streak + 1 : 1;
    const learnedVerses = reward.verseReference && !progress.learnedVerses.includes(reward.verseReference) ? [...progress.learnedVerses, reward.verseReference] : progress.learnedVerses;
    const partial: PlayerProgress = {
      ...progress,
      points: progress.points + Math.max(0, Math.round(reward.points)),
      xp: progress.xp + Math.max(0, Math.round(reward.xp)),
      streak,
      lastPlayedOn: today,
      gamesCompleted: progress.gamesCompleted + 1,
      completedGameIds: progress.completedGameIds.includes(reward.gameId) ? progress.completedGameIds : [...progress.completedGameIds, reward.gameId],
      dailyChallengeIds: [...progress.dailyChallengeIds, reward.gameId],
      learnedVerses,
    };
    const newAchievementIds = calculateNewAchievements(partial);
    const withAchievements = { ...partial, xp: partial.xp + newAchievementIds.length * 25, achievementIds: [...partial.achievementIds, ...newAchievementIds] };
    const completed = { ...withAchievements, level: levelForXp(withAchievements.xp) };
    setProgress(completed);
    return { totalPoints: completed.points, totalXp: completed.xp, level: completed.level, streak: completed.streak, newAchievementIds };
  }, [identity.authenticated, progress]);

  const saveGameProgress = useCallback((gameId: string, data: Record<string, unknown>) => {
    setProgress((current) => ({ ...current, gameProgress: { ...current.gameProgress, [gameId]: { ...current.gameProgress[gameId], ...data } } }));
    // Para cuentas solo sincronizamos estado no premiable. XP, puntos,
    // monedas y recompensas siguen siendo decisiones del servidor.
    const game = games.find((candidate) => candidate.id === gameId);
    if (!identity.authenticated || !game) return;
    if (!identity.accountId) return;
    void queueGameProgress(game.slug, data, identity.accountId).then(() => flushPendingProgress()).catch(() => undefined);
  }, [identity.accountId, identity.authenticated]);

  const completeServerActivity = useCallback(async (body: Record<string, unknown>) => {
    if (!identity.authenticated) return null;
    setProgressSyncState("pending");
    const response = await fetch("/api/progress/complete", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json().catch(() => null) as ServerProgressResponse | { error?: string } | null;
    if (!response.ok || !result || !("state" in result) || !("result" in result)) {
      setProgressSyncState("error");
      throw new Error(result && "error" in result && result.error ? result.error : "No pudimos confirmar la recompensa.");
    }
    applyServerState(result.state);
    return result.result;
  }, [applyServerState, identity.authenticated]);

  const startAuthenticatedGame = useCallback(async (gameId: string) => {
    if (!identity.authenticated) return null;
    const game = games.find((candidate) => candidate.id === gameId);
    if (!game) return null;
    const response = await fetch("/api/progress/game-session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ gameSlug: game.slug }),
    });
    const result = await response.json().catch(() => null) as { sessionId?: string; error?: string } | null;
    if (!response.ok || !result?.sessionId) {
      setProgressSyncState("error");
      throw new Error(result?.error ?? "No pudimos iniciar la partida sincronizada.");
    }
    return result.sessionId;
  }, [identity.authenticated]);

  const confirmAuthenticatedGame = useCallback((sessionId: string) => completeServerActivity({ kind: "GAME_SESSION", sessionId }), [completeServerActivity]);
  const confirmDailyChallenge = useCallback((challengeId: string) => completeServerActivity({ kind: "DAILY_CHALLENGE", challengeId }), [completeServerActivity]);
  const confirmCampaignLevel = useCallback((levelId: string, elapsedSeconds: number) => completeServerActivity({ kind: "CAMPAIGN_LEVEL", levelId, elapsedSeconds }), [completeServerActivity]);

  const selectAvatar = useCallback(async (avatarKey: string) => {
    if (!isSelectableAvatarKey(avatarKey)) throw new Error("Ese avatar no está disponible.");
    if (identity.authenticated) {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ avatarKey }),
      });
      const result = await response.json() as { profile?: { nickname: string; avatarKey: string }; error?: string };
      const profile = result.profile;
      if (!response.ok || !profile) throw new Error(result.error ?? "No pudimos guardar tu avatar.");
      setIdentity((current) => ({
        nickname: profile.nickname,
        avatarKey: profile.avatarKey,
        authenticated: true,
        adventureCoins: current.adventureCoins,
      }));
      return;
    }
    setIdentity((current) => ({ ...current, avatarKey, authenticated: false }));
  }, [identity.authenticated]);

  const resetProgress = useCallback(() => setProgress(initialProgress), []);

  const value = useMemo(
    () => ({ progress, hydrated, identity, identityReady, progressSyncState, completeGame, completeDailyChallenge, completeCampaignLevel, saveGameProgress, startAuthenticatedGame, confirmAuthenticatedGame, confirmDailyChallenge, confirmCampaignLevel, selectAvatar, resetProgress }),
    [completeCampaignLevel, completeDailyChallenge, completeGame, confirmAuthenticatedGame, confirmCampaignLevel, confirmDailyChallenge, hydrated, identity, identityReady, progress, progressSyncState, resetProgress, saveGameProgress, selectAvatar, startAuthenticatedGame],
  );
  return <PlayerProgressContext.Provider value={value}>{children}</PlayerProgressContext.Provider>;
}

export function usePlayerProgress() {
  const context = useContext(PlayerProgressContext);
  if (!context) throw new Error("usePlayerProgress debe utilizarse dentro de PlayerProgressProvider.");
  return context;
}
