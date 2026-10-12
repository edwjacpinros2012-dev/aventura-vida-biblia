import type { DailyBibleChallenge } from "@/lib/daily-bible-challenge";

export type OfflineCatalogGame = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  suggestedAge: string;
  gameKey: string;
  isPlayable: boolean;
};

export type OfflineContentSnapshot = {
  schemaVersion: 1;
  generatedAt: string;
  dailyChallenge: DailyBibleChallenge;
  games: OfflineCatalogGame[];
};

export type PendingGameProgressOperation = {
  id: string;
  type: "GAME_PROGRESS";
  gameSlug: string;
  data: Record<string, unknown>;
  updatedAt: string;
};
