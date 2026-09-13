import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function rankFor(rating: number) {
  if (rating >= 1400) return "Campeón de la Luz";
  if (rating >= 1250) return "Guardián";
  if (rating >= 1125) return "Guerrero de la Fe";
  if (rating >= 1050) return "Explorador";
  if (rating >= 1000) return "Caminante";
  return "Semilla";
}

export async function GET() {
  const players = await prisma.pvpProfile.findMany({
    include: { user: { select: { profile: { select: { nickname: true, avatarKey: true } } } } },
    orderBy: [{ rating: "desc" }, { wins: "desc" }, { updatedAt: "asc" }],
    take: 50,
  });
  return NextResponse.json({ ranking: players.flatMap((player, index) => player.user.profile ? [{ position: index + 1, nickname: player.user.profile.nickname, avatar: player.user.profile.avatarKey, rating: player.rating, wins: player.wins, losses: player.losses, draws: player.draws, rank: rankFor(player.rating) }] : []) });
}
