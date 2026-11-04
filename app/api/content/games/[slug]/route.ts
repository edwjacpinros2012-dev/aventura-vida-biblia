import { NextResponse } from "next/server";
import { getGameBySlug } from "@/lib/content";
import { publishedQuizPacksForGame } from "@/lib/central-brain/published-content-service";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = getGameBySlug(slug);
  if (!game?.isPlayable || !game.gameKey) return NextResponse.json({ error: "Juego no disponible." }, { status: 404 });

  const packs = await publishedQuizPacksForGame(slug);
  return NextResponse.json({
    gameSlug: slug,
    packs,
    source: packs.length ? "published-editorial-content" : "built-in-content",
  }, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}
