import { NextResponse } from "next/server";
import { accountFromRequest } from "@/lib/auth/server";
import { communityErrorResponse, requireModerator } from "@/lib/community/service";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const account = await accountFromRequest(request);
  if (!account) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });
  try {
    await requireModerator(account.id);
    const [players, reports, rooms, matches, sanctions, audit] = await Promise.all([
      prisma.profile.findMany({ select: { nickname: true, avatarKey: true, level: true, points: true, createdAt: true }, take: 100, orderBy: { createdAt: "desc" } }),
      prisma.communityReport.findMany({ select: { id: true, reason: true, status: true, createdAt: true }, take: 100, orderBy: { createdAt: "desc" } }),
      prisma.multiplayerRoom.findMany({ select: { code: true, gameKey: true, status: true, maxPlayers: true, expiresAt: true }, take: 50, orderBy: { updatedAt: "desc" } }),
      prisma.match.findMany({ select: { id: true, gameKey: true, mode: true, status: true, startedAt: true, endedAt: true }, take: 50, orderBy: { updatedAt: "desc" } }),
      prisma.moderationSanction.findMany({ select: { id: true, type: true, status: true, reason: true, startsAt: true, endsAt: true, user: { select: { profile: { select: { nickname: true, avatarKey: true } } } } }, take: 100, orderBy: { createdAt: "desc" } }),
      prisma.auditLog.findMany({ select: { action: true, entity: true, createdAt: true }, take: 100, orderBy: { createdAt: "desc" } }),
    ]);
    return NextResponse.json({ players, reports, rooms, matches, sanctions, audit });
  } catch (error) { const result = communityErrorResponse(error); return NextResponse.json({ error: result.message }, { status: result.status }); }
}
