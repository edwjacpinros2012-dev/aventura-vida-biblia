import { GeneratedContentStatus } from "@prisma/client";
import { parsePlayableGamePack, type PlayableQuizPack } from "@/lib/central-brain/game-content";
import { prisma } from "@/lib/prisma";

/**
 * Obtiene contenido editorial ya publicado para un módulo existente. Si la
 * base no está disponible, el juego mantiene su banco de preguntas local.
 */
export async function publishedQuizPacksForGame(gameSlug: string): Promise<PlayableQuizPack[]> {
  if (gameSlug !== "preguntas-de-aventura") return [];
  try {
    const records = await prisma.generatedContent.findMany({
      where: { source: "AI", status: GeneratedContentStatus.PUBLISHED, kind: "AI_BIBLE_CONTENT_PROPOSAL" },
      select: { id: true, payload: true, publishedAt: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 30,
    });
    return records
      .map((record) => parsePlayableGamePack(record.payload))
      .filter((pack): pack is PlayableQuizPack => Boolean(pack && pack.targetGameSlug === gameSlug));
  } catch {
    return [];
  }
}
