export type PlayerAchievementId = "first-adventure" | "curious-explorer" | "verse-keeper" | "steady-light" | "game-master";

export type ArmorPieceId =
  | "cinturon-de-verdad"
  | "coraza-de-justicia"
  | "calzado-de-paz"
  | "escudo-de-fe"
  | "yelmo-de-salvacion"
  | "espada-de-la-palabra";

export type ArmorCampaignProgress = {
  unlockedLevel: number;
  completedLevelIds: string[];
  faithTokens: number;
  badges: string[];
  armorPieces: ArmorPieceId[];
  adventureSeconds: number;
};

export type PlayerProgress = {
  points: number;
  xp: number;
  level: number;
  streak: number;
  lastPlayedOn?: string;
  gamesCompleted: number;
  completedGameIds: string[];
  learnedVerses: string[];
  achievementIds: PlayerAchievementId[];
  gameProgress: Record<string, Record<string, unknown>>;
  armorCampaign: ArmorCampaignProgress;
};

export type GameReward = {
  gameId: string;
  points: number;
  xp: number;
  verseReference?: string;
};

export type RewardResult = {
  totalPoints: number;
  totalXp: number;
  level: number;
  streak: number;
  newAchievementIds: PlayerAchievementId[];
};

export type CampaignLevelReward = {
  levelId: string;
  unlocksLevel: number;
  points: number;
  xp: number;
  faithTokens: number;
  badge?: string;
  armorPiece?: ArmorPieceId;
  elapsedSeconds: number;
};

export const achievementDetails: Record<PlayerAchievementId, { title: string; icon: string; description: string }> = {
  "first-adventure": { title: "Primera aventura", icon: "🧭", description: "Completaste tu primer juego." },
  "curious-explorer": { title: "Explorador curioso", icon: "✦", description: "Probaste 3 juegos diferentes." },
  "verse-keeper": { title: "Guardián de palabras", icon: "📖", description: "Aprendiste tu primer versículo." },
  "steady-light": { title: "Luz constante", icon: "🌟", description: "Mantuviste una racha de 3 días." },
  "game-master": { title: "Maestro de juegos", icon: "🏆", description: "Completaste 8 partidas." },
};

export const levelTitles = [
  { level: 1, title: "Explorador", minimumXp: 0 },
  { level: 5, title: "Aventurero", minimumXp: 500 },
  { level: 10, title: "Guardián", minimumXp: 1500 },
  { level: 20, title: "Héroe de la Fe", minimumXp: 4000 },
];

export function levelForXp(xp: number) {
  return Math.max(1, Math.floor(xp / 125) + 1);
}

export function levelTitleFor(level: number) {
  return [...levelTitles].reverse().find((item) => level >= item.level)?.title ?? "Explorador";
}

export function xpProgressFor(level: number, xp: number) {
  const currentFloor = Math.max(0, (level - 1) * 125);
  return { current: xp - currentFloor, needed: 125 };
}
