import { NextResponse } from "next/server";
import { z } from "zod";
import { accountFromRequest } from "@/lib/auth/server";
import { nicknameSchema } from "@/lib/auth/contracts";
import { communityErrorResponse, issueSanction, liftSanction, requireModerator } from "@/lib/community/service";

export async function POST(request: Request) {
  const account = await accountFromRequest(request);
  if (!account) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });
  const body = z.object({ nickname: nicknameSchema, type: z.enum(["WARNING", "SHORT_SUSPENSION", "LONG_SUSPENSION", "BAN"]), reason: z.string().trim().min(3).max(500), durationHours: z.number().int().positive().optional() }).safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Revisa los datos de la sanción." }, { status: 400 });
  try { await requireModerator(account.id); return NextResponse.json({ sanction: await issueSanction({ adminId: account.id, ...body.data }) }, { status: 201 }); }
  catch (error) { const result = communityErrorResponse(error); return NextResponse.json({ error: result.message }, { status: result.status }); }
}

export async function PATCH(request: Request) {
  const account = await accountFromRequest(request);
  if (!account) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });
  const body = z.object({ sanctionId: z.string().cuid() }).safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Revisa la sanción." }, { status: 400 });
  try { await requireModerator(account.id); return NextResponse.json({ sanction: await liftSanction(account.id, body.data.sanctionId) }); }
  catch (error) { const result = communityErrorResponse(error); return NextResponse.json({ error: result.message }, { status: result.status }); }
}
