import { Prisma, ReportReason, ReportStatus, SanctionStatus, SanctionType, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class CommunityError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

export async function assertCommunityAccess(userId: string, scope: "chat" | "multiplayer" | "account" = "account") {
  const now = new Date();
  await prisma.moderationSanction.updateMany({
    where: { userId, status: SanctionStatus.ACTIVE, endsAt: { lte: now } },
    data: { status: SanctionStatus.EXPIRED },
  });
  const sanctions = await prisma.moderationSanction.findMany({
    where: { userId, status: SanctionStatus.ACTIVE, OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
    select: { type: true, reason: true, endsAt: true },
  });
  const ban = sanctions.find((sanction) => sanction.type === SanctionType.BAN);
  if (ban) throw new CommunityError("Esta cuenta no tiene acceso comunitario en este momento.", 403);
  if (scope !== "account" && sanctions.some((sanction) => sanction.type === SanctionType.SHORT_SUSPENSION || sanction.type === SanctionType.LONG_SUSPENSION)) {
    throw new CommunityError("Esta cuenta está suspendida temporalmente de las funciones comunitarias.", 403);
  }
}

export async function blockPlayer(blockerId: string, blockedNickname: string) {
  const target = await prisma.profile.findUnique({ where: { nickname: blockedNickname }, select: { userId: true, nickname: true, avatarKey: true } });
  if (!target) throw new CommunityError("No encontramos a ese jugador.", 404);
  if (target.userId === blockerId) throw new CommunityError("No puedes bloquearte a ti mismo.");
  await prisma.playerBlock.upsert({
    where: { blockerId_blockedId: { blockerId, blockedId: target.userId } },
    create: { blockerId, blockedId: target.userId },
    update: {},
  });
  return { nickname: target.nickname, avatarKey: target.avatarKey };
}

export async function unblockPlayer(blockerId: string, blockedNickname: string) {
  const target = await prisma.profile.findUnique({ where: { nickname: blockedNickname }, select: { userId: true } });
  if (!target) return;
  await prisma.playerBlock.deleteMany({ where: { blockerId, blockedId: target.userId } });
}

export async function blockedPlayers(userId: string) {
  return prisma.playerBlock.findMany({
    where: { blockerId: userId },
    select: { blocked: { select: { profile: { select: { nickname: true, avatarKey: true } } } } },
    orderBy: { createdAt: "desc" },
  }).then((rows) => rows.flatMap((row) => row.blocked.profile ? [row.blocked.profile] : []));
}

export async function isBlocked(blockerId: string, blockedId: string) {
  return Boolean(await prisma.playerBlock.findUnique({ where: { blockerId_blockedId: { blockerId, blockedId } }, select: { id: true } }));
}

export async function createReport(input: {
  reporterId: string;
  reportedNickname?: string;
  roomCode?: string;
  messageId?: string;
  reason: ReportReason;
  details?: string;
}) {
  const target = input.reportedNickname
    ? await prisma.profile.findUnique({ where: { nickname: input.reportedNickname }, select: { userId: true } })
    : null;
  if (target?.userId === input.reporterId) throw new CommunityError("No puedes reportarte a ti mismo.");
  const room = input.roomCode ? await prisma.multiplayerRoom.findUnique({ where: { code: input.roomCode }, select: { id: true } }) : null;
  const message = input.messageId
    ? await prisma.safeChatMessage.findUnique({ where: { id: input.messageId }, select: { id: true, authorId: true } })
    : null;
  if (input.messageId && !message) throw new CommunityError("No encontramos el mensaje a reportar.", 404);
  return prisma.communityReport.create({
    data: {
      reporterId: input.reporterId,
      reportedUserId: target?.userId ?? message?.authorId,
      roomId: room?.id,
      messageId: message?.id,
      reason: input.reason,
      details: input.details,
    },
    select: { id: true, status: true, createdAt: true },
  });
}

export async function requireModerator(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.MODERATOR)) {
    throw new CommunityError("No tienes permiso para administrar la comunidad.", 403);
  }
}

export async function listReports() {
  return prisma.communityReport.findMany({
    include: {
      reporter: { select: { profile: { select: { nickname: true, avatarKey: true } } } },
      reportedUser: { select: { profile: { select: { nickname: true, avatarKey: true } } } },
      room: { select: { code: true, gameKey: true } },
      message: { select: { id: true, text: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function resolveReport(adminId: string, reportId: string, status: Extract<ReportStatus, "RESOLVED" | "DISMISSED">, resolution?: string) {
  const report = await prisma.communityReport.update({
    where: { id: reportId },
    data: { status, resolution, resolvedById: adminId, resolvedAt: new Date() },
  });
  await prisma.auditLog.create({ data: { actorId: adminId, action: "UPDATE", entity: "CommunityReport", entityId: report.id, metadata: { status } } });
  return report;
}

export async function issueSanction(input: { adminId: string; nickname: string; type: SanctionType; reason: string; durationHours?: number }) {
  const player = await prisma.profile.findUnique({ where: { nickname: input.nickname }, select: { userId: true } });
  if (!player) throw new CommunityError("No encontramos a ese jugador.", 404);
  const duration = input.type === SanctionType.SHORT_SUSPENSION ? Math.min(Math.max(input.durationHours ?? 24, 1), 7 * 24)
    : input.type === SanctionType.LONG_SUSPENSION ? Math.min(Math.max(input.durationHours ?? 7 * 24, 24), 90 * 24)
      : undefined;
  const sanction = await prisma.moderationSanction.create({
    data: { userId: player.userId, issuedById: input.adminId, type: input.type, reason: input.reason, endsAt: duration ? new Date(Date.now() + duration * 3_600_000) : null },
  });
  await prisma.auditLog.create({ data: { actorId: input.adminId, action: "UPDATE", entity: "ModerationSanction", entityId: sanction.id, metadata: { type: input.type } } });
  return sanction;
}

export async function liftSanction(adminId: string, sanctionId: string) {
  const sanction = await prisma.moderationSanction.update({
    where: { id: sanctionId },
    data: { status: SanctionStatus.LIFTED, liftedAt: new Date(), liftedById: adminId },
  });
  await prisma.auditLog.create({ data: { actorId: adminId, action: "UPDATE", entity: "ModerationSanction", entityId: sanction.id, metadata: { status: "LIFTED" } } });
  return sanction;
}

export function communityErrorResponse(error: unknown) {
  if (error instanceof CommunityError) return { status: error.status, message: error.message };
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return { status: 404, message: "No encontramos ese registro." };
  return { status: 500, message: "No pudimos completar esta operación." };
}
