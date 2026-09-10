import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GamePlayer } from "@/components/games/game-player";
import { games, getGameBySlug } from "@/lib/content";

export function generateStaticParams() {
  return games.filter((game) => game.isPlayable && game.gameKey).map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const game = getGameBySlug(slug);
  return { title: game?.isPlayable ? `Jugar ${game.name} | Aventura Vida` : "Juego no disponible | Aventura Vida" };
}

export default async function PlayGamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = getGameBySlug(slug);
  if (!game?.isPlayable || !game.gameKey) notFound();
  return <GamePlayer game={game} />;
}
