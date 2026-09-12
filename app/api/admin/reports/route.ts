import { NextResponse } from "next/server";
import { z } from "zod";
import { accountFromRequest } from "@/lib/auth/server";
import { communityErrorResponse, listReports, requireModerator, resolveReport } from "@/lib/community/service";

export async function GET(request: Request) {
  const account = await accountFromRequest(request);
  if (!account) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });
  try { await requireModerator(account.id); return NextResponse.json({ reports: await listReports() }); }
  catch (error) { const result = communityErrorResponse(error); return NextResponse.json({ error: result.message }, { status: result.status }); }
}

export async function PATCH(request: Request) {
  const account = await accountFromRequest(request);
  if (!account) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });
  const body = z.object({ reportId: z.string().cuid(), status: z.enum(["RESOLVED", "DISMISSED"]), resolution: z.string().trim().max(500).optional() }).safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Revisa la resolución." }, { status: 400 });
  try { await requireModerator(account.id); return NextResponse.json({ report: await resolveReport(account.id, body.data.reportId, body.data.status, body.data.resolution) }); }
  catch (error) { const result = communityErrorResponse(error); return NextResponse.json({ error: result.message }, { status: result.status }); }
}
