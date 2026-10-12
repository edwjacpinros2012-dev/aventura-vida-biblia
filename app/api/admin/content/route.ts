import { GeneratedContentStatus, MissionStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { accountFromRequest } from "@/lib/auth/server";
import { communityErrorResponse, requireModerator } from "@/lib/community/service";
import { prisma } from "@/lib/prisma";

const reviewSchema = z.object({
  contentId: z.string().cuid(),
  action: z.enum(["approve", "publish", "reject"]),
  notes: z.string().trim().max(1_000).optional(),
});

async function moderatorFrom(request: Request) {
  const account = await accountFromRequest(request);
  if (!account) return null;
  await requireModerator(account.id);
  return account;
}

export async function GET(request: Request) {
  try {
    const account = await moderatorFrom(request);
    if (!account) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });
    const content = await prisma.generatedContent.findMany({
      select: { id: true, contentKey: true, kind: true, dateKey: true, version: true, source: true, status: true, validation: true, reviewNotes: true, publishedAt: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ content });
  } catch (error) { const result = communityErrorResponse(error); return NextResponse.json({ error: result.message }, { status: result.status }); }
}

export async function PATCH(request: Request) {
  try {
    const account = await moderatorFrom(request);
    if (!account) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });
    const parsed = reviewSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Revisa la decisión editorial." }, { status: 400 });
    const current = await prisma.generatedContent.findUnique({ where: { id: parsed.data.contentId }, select: { id: true, source: true, status: true, missionId: true } });
    if (!current) return NextResponse.json({ error: "No encontramos ese contenido." }, { status: 404 });
    // La IA requiere aprobación explícita antes de publicar; las plantillas ya
    // se validan por el cron y también pueden revisarse desde aquí.
    if (parsed.data.action === "publish" && current.source === "AI") {
      const approval = await prisma.generatedContent.findUnique({ where: { id: current.id }, select: { status: true } });
      if (approval?.status !== GeneratedContentStatus.APPROVED) return NextResponse.json({ error: "El contenido generado por IA debe aprobarse antes de publicarse." }, { status: 409 });
    }
    // Una revisión sobre una plantilla que ya fue publicada no la retira.
    const status = parsed.data.action === "approve"
      ? current.status === GeneratedContentStatus.PUBLISHED ? GeneratedContentStatus.PUBLISHED : GeneratedContentStatus.APPROVED
      : parsed.data.action === "publish" ? GeneratedContentStatus.PUBLISHED : GeneratedContentStatus.REJECTED;
    const content = await prisma.generatedContent.update({
      where: { id: current.id },
      data: { status, reviewNotes: parsed.data.notes, reviewerId: account.id, reviewedAt: new Date(), publishedAt: status === GeneratedContentStatus.PUBLISHED ? new Date() : undefined },
      select: { id: true, contentKey: true, status: true, missionId: true },
    });
    if (content.missionId) await prisma.mission.update({ where: { id: content.missionId }, data: { status: status === GeneratedContentStatus.PUBLISHED ? MissionStatus.ACTIVE : MissionStatus.DRAFT } });
    await prisma.auditLog.create({ data: { actorId: account.id, action: status === GeneratedContentStatus.PUBLISHED ? "PUBLISH" : "UPDATE", entity: "GeneratedContent", entityId: content.id, metadata: { status, notes: parsed.data.notes } } });
    return NextResponse.json({ content });
  } catch (error) { const result = communityErrorResponse(error); return NextResponse.json({ error: result.message }, { status: result.status }); }
}
