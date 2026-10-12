import { NextResponse } from "next/server";
import { games } from "@/lib/content";
import { publishedDailyBibleChallengeFor } from "@/lib/content-automation/daily-content-service";

export const dynamic = "force-dynamic";

/** Paquete público y descargable: nunca incluye sesiones, saldos o recompensas. */
export async function GET() {
  const challenge = await publishedDailyBibleChallengeFor();
  const response = NextResponse.json({
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    dailyChallenge: challenge,
    games: games.map(({ id, slug, name, description, category, difficulty, suggestedAge, gameKey, isPlayable }) => ({ id, slug, name, description, category, difficulty, suggestedAge, gameKey, isPlayable })),
  });
  response.headers.set("Cache-Control", "public, max-age=300, s-maxage=300, stale-while-revalidate=86400");
  return response;
}
