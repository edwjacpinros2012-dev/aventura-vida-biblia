import { NextResponse } from "next/server";
import { z } from "zod";
import { accountFromRequest } from "@/lib/auth/server";
import { ProgressError, startGameSession } from "@/lib/progress/service";

const schema = z.object({ gameSlug: z.string().trim().regex(/^[a-z0-9-]{2,80}$/) });

export async function POST(request: Request) {
  const account = await accountFromRequest(request);
  if (!account) return NextResponse.json({ error: "Inicia sesión para comenzar una partida sincronizada." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "El juego solicitado no es válido." }, { status: 400 });
  try {
    return NextResponse.json(await startGameSession(account.id, parsed.data.gameSlug), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof ProgressError ? error.message : "No pudimos iniciar la partida." }, { status: error instanceof ProgressError ? error.status : 503 });
  }
}
