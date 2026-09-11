export type GameCategory = "Memoria" | "Preguntas" | "Arcade" | "Aventuras" | "Valores" | "Palabras" | "Creatividad" | "Historias" | "Lógica" | "Versículos" | "Rompecabezas";
export type Difficulty = "Inicial" | "Explorador" | "Aventurero";
export type CoverTheme = "forest" | "sky" | "sunset" | "night" | "river" | "garden";

export type Game = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  category: GameCategory;
  difficulty: Difficulty;
  suggestedAge: string;
  maxPoints: number;
  xp: number;
  playMinutes: number;
  coverTheme: CoverTheme;
  isNew?: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
  isPlayable?: boolean;
  gameKey?: BiblicalGameKey;
  lesson: string;
  objectives: string[];
};

export type BiblicalGameKey = "word-search" | "coloring" | "quiz" | "story" | "memory" | "iq" | "verse" | "puzzle" | "light-collector" | "garden-helpers" | "river-path" | "star-map";

export type Adventure = {
  slug: string;
  title: string;
  summary: string;
  chapters: number;
  progress?: number;
  coverTheme: CoverTheme;
  badge: string;
};

export type Player = {
  nickname: string;
  avatar: string;
  points: number;
  trend: "up" | "same" | "new";
};
