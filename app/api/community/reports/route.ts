import { NextResponse } from "next/server";
import { z } from "zod";
import { accountFromRequest } from "@/lib/auth/server";
import { nicknameSchema } from "@/lib/auth/contracts";
import { assertCommunityAccess, communityErrorResponse, createReport } from "@/lib/community/service";

const reportSchema = z.object({
  reportedNickname: nicknameSchema.optional(),
  roomCode: z.string().trim().toUpperCase().regex(/^[A-HJ-NP-Z2-9]{6}$/).optional(),
  messageId: z.string().cuid().optional(),
  reason: z.enum(["INAPPROPRIATE_LANGUAGE", "HARASSMENT", "INSULT", "SEXUAL_CONTENT", "THREAT", "SPAM", "PERSONAL_INFORMATION", "INAPPROPRIATE_BEHAVIOR", "OTHER"]),
  details: z.string().trim().max(400).optional(),
});

export async function POST(request: Request) {
  const account = await accountFromRequest(request);
  if (!account) return NextResponse.json({ error: "Inicia sesión para enviar un reporte." }, { status: 401 });
  const body = reportSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Revisa el reporte." }, { status: 400 });
  try {
    await assertCommunityAccess(account.id);
    const report = await createReport({ reporterId: account.id, ...body.data });
    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    const result = communityErrorResponse(error);
    return NextResponse.json({ error: result.message }, { status: result.status });
  }
}
