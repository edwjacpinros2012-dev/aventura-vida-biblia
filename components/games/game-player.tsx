"use client";

import type { Game } from "@/types/content";
import { BibleMazeGame } from "@/components/games/bible-maze-game";
import { ColoringGame } from "@/components/games/coloring-game";
import { GardenHelpersGame, LightCollectorGame, RiverPathGame, StarMapGame } from "@/components/games/catalog-adventure-games";
import { GameLoading, GameShell, useReadyGame } from "@/components/games/game-shell";
import { IqGame } from "@/components/games/iq-game";
import { MemoryGame } from "@/components/games/memory-game";
import { PuzzleGame } from "@/components/games/puzzle-game";
import { QuizGame } from "@/components/games/quiz-game";
import { StoryGame } from "@/components/games/story-game";
import { VerseGame } from "@/components/games/verse-game";
import { BabyAbcGame } from "@/components/games/baby-abc-game";
import { WordSearchGame } from "@/components/games/word-search-game";
import { LittleBigHeroesGame } from "@/components/games/little-big-heroes-game";
import ThreeKidsPortalsWorld from "@/components/three-kids-portals-world";

export function GamePlayer({ game }: { game: Game }) {
  const ready = useReadyGame();
  if (!ready) return <GameShell game={game}><GameLoading /></GameShell>;
  const content = {
    "word-search": <WordSearchGame />,
    coloring: <ColoringGame />,
    quiz: <QuizGame gameSlug={game.slug} />,
    story: <StoryGame />,
    memory: <MemoryGame />,
    iq: <IqGame />,
    verse: <VerseGame />,
    puzzle: <PuzzleGame />,
    "light-collector": <LightCollectorGame />,
    "garden-helpers": <GardenHelpersGame />,
    "river-path": <RiverPathGame />,
    "star-map": <StarMapGame />,
    "bible-maze": <BibleMazeGame />,
    vowels: <BabyAbcGame />,
    "little-big-heroes": <LittleBigHeroesGame />,
    "portales-poderosos": <ThreeKidsPortalsWorld />,
  }[game.gameKey ?? "word-search"];
  return <GameShell game={game}>{content}</GameShell>;
}
