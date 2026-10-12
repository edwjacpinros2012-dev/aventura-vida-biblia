import { NextResponse } from "next/server";
import { accountFromRequest } from "@/lib/auth/server";
import { ProgressError, progressStateForUser } from "@/lib/progress/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const account = await accountFromRequest(request);
  if (!account) return NextResponse.json({ error: "Inicia sesión para sincronizar tu progreso." }, { status: 401 });
  try {
    return NextResponse.json(await progressStateForUser(account.id), { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof ProgressError ? error.message : "No pudimos cargar tu progreso." }, { status: error instanceof ProgressError ? error.status : 503 });
  }
}
