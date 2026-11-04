import { NextResponse } from "next/server";
import { z } from "zod";
import { accountFromRequest } from "@/lib/auth/server";
import { centralBrainAdminStatus, setCentralBrainAutomationEnabled } from "@/lib/central-brain/automation-service";
import { communityErrorResponse, requireModerator } from "@/lib/community/service";

const controlSchema = z.object({ enabled: z.boolean() });

async function moderatorFrom(request: Request) {
  const account = await accountFromRequest(request);
  if (!account) return null;
  await requireModerator(account.id);
  return account;
}

export async function GET(request: Request) {
  try {
    if (!await moderatorFrom(request)) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });
    return NextResponse.json(await centralBrainAdminStatus());
  } catch (error) {
    const result = communityErrorResponse(error);
    return NextResponse.json({ error: result.message }, { status: result.status });
  }
}

export async function PATCH(request: Request) {
  try {
    const account = await moderatorFrom(request);
    if (!account) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });
    const parsed = controlSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Configuración de automatización no válida." }, { status: 400 });
    await setCentralBrainAutomationEnabled(parsed.data.enabled);
    return NextResponse.json(await centralBrainAdminStatus());
  } catch (error) {
    const result = communityErrorResponse(error);
    return NextResponse.json({ error: result.message }, { status: result.status });
  }
}
