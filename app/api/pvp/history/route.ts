import { NextResponse } from "next/server";
import { accountFromRequest } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const account = await accountFromRequest(request);
  if (!account) return NextResponse.json({ error: "Inicia sesión para ver tu historial PvP." }, { status: 401 });
  const rows = await prisma.matchPlayer.findMany({
    where: { userId: account.id, match: { mode: "PVP", status: "FINISHED" } },
    include: {
      match: {
        include: {
          players: {
            include: {
              user: {
                select: {
                  profile: { select: { nickname: true, avatarKey: true } },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ history: rows.map((row) => {
    const opponent = row.match.players.find((player) => player.id !== row.id)?.user?.profile;
    const result = row.match.result && typeof row.match.result === "object" ? row.match.result as { winnerId?: string } : {};
    const ownWinner = result.winnerId === row.playerKey;
    return { id: row.match.id, playedAt: row.match.endedAt ?? row.joinedAt, score: row.score, opponent: opponent ? { nickname: opponent.nickname, avatar: opponent.avatarKey } : { nickname: "Explorador", avatar: "✦" }, result: result.winnerId ? ownWinner ? "WIN" : "LOSS" : "DRAW" };
  }) });
}
