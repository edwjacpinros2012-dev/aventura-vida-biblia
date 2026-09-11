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

const STORAGE_KEY = "aventura-vida.player-progress.v2";

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
  achievementIds: [],
  gameProgress: {},
  armorCampaign: initialArmorCampaign,
};

type PlayerProgressContextValue = {
  progress: PlayerProgress;
  hydrated: boolean;
  completeGame: (reward: GameReward) => RewardResult;
  completeCampaignLevel: (reward: CampaignLevelReward) => RewardResult;
  saveGameProgress: (gameId: string, data: Record<string, unknown>) => void;
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

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setProgress(safeProgress(JSON.parse(stored)));
    } catch {
      setProgress(initialProgress);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [hydrated, progress]);

  const completeGame = useCallback((reward: GameReward): RewardResult => {
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
  }, [progress]);

  const completeCampaignLevel = useCallback((reward: CampaignLevelReward): RewardResult => {
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
  }, [progress]);

  const saveGameProgress = useCallback((gameId: string, data: Record<string, unknown>) => {
    setProgress((current) => ({ ...current, gameProgress: { ...current.gameProgress, [gameId]: { ...current.gameProgress[gameId], ...data } } }));
  }, []);

  const resetProgress = useCallback(() => setProgress(initialProgress), []);

  const value = useMemo(
    () => ({ progress, hydrated, completeGame, completeCampaignLevel, saveGameProgress, resetProgress }),
    [completeCampaignLevel, completeGame, hydrated, progress, resetProgress, saveGameProgress],
  );
  return <PlayerProgressContext.Provider value={value}>{children}</PlayerProgressContext.Provider>;
}

export function usePlayerProgress() {
  const context = useContext(PlayerProgressContext);
  if (!context) throw new Error("usePlayerProgress debe utilizarse dentro de PlayerProgressProvider.");
  return context;
}
