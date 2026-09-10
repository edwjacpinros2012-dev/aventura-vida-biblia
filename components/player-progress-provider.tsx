"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { levelForXp, type GameReward, type PlayerAchievementId, type PlayerProgress, type RewardResult } from "@/types/player-progress";

const STORAGE_KEY = "aventura-vida.player-progress.v2";

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
};

type PlayerProgressContextValue = {
  progress: PlayerProgress;
  hydrated: boolean;
  completeGame: (reward: GameReward) => RewardResult;
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
    let result: RewardResult = { totalPoints: progress.points, totalXp: progress.xp, level: progress.level, streak: progress.streak, newAchievementIds: [] };
    setProgress((current) => {
      const today = localDay();
      const streak = current.lastPlayedOn === today ? current.streak : current.lastPlayedOn === previousDay() ? current.streak + 1 : 1;
      const learnedVerses = reward.verseReference && !current.learnedVerses.includes(reward.verseReference) ? [...current.learnedVerses, reward.verseReference] : current.learnedVerses;
      const partial: PlayerProgress = {
        ...current,
        points: current.points + Math.max(0, Math.round(reward.points)),
        xp: current.xp + Math.max(0, Math.round(reward.xp)),
        streak,
        lastPlayedOn: today,
        gamesCompleted: current.gamesCompleted + 1,
        completedGameIds: current.completedGameIds.includes(reward.gameId) ? current.completedGameIds : [...current.completedGameIds, reward.gameId],
        learnedVerses,
      };
      const newAchievementIds = calculateNewAchievements(partial);
      const withAchievements = {
        ...partial,
        xp: partial.xp + newAchievementIds.length * 25,
        achievementIds: [...partial.achievementIds, ...newAchievementIds],
      };
      const completed = { ...withAchievements, level: levelForXp(withAchievements.xp) };
      result = { totalPoints: completed.points, totalXp: completed.xp, level: completed.level, streak: completed.streak, newAchievementIds };
      return completed;
    });
    return result;
  }, [progress.level, progress.points, progress.streak, progress.xp]);

  const saveGameProgress = useCallback((gameId: string, data: Record<string, unknown>) => {
    setProgress((current) => ({ ...current, gameProgress: { ...current.gameProgress, [gameId]: { ...current.gameProgress[gameId], ...data } } }));
  }, []);

  const resetProgress = useCallback(() => setProgress(initialProgress), []);

  const value = useMemo(() => ({ progress, hydrated, completeGame, saveGameProgress, resetProgress }), [completeGame, hydrated, progress, resetProgress, saveGameProgress]);
  return <PlayerProgressContext.Provider value={value}>{children}</PlayerProgressContext.Provider>;
}

export function usePlayerProgress() {
  const context = useContext(PlayerProgressContext);
  if (!context) throw new Error("usePlayerProgress debe utilizarse dentro de PlayerProgressProvider.");
  return context;
}
