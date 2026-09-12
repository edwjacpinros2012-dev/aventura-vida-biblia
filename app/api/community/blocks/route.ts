import { NextResponse } from "next/server";
import { z } from "zod";
import { accountFromRequest } from "@/lib/auth/server";
import { nicknameSchema } from "@/lib/auth/contracts";
import { assertCommunityAccess, blockPlayer, blockedPlayers, communityErrorResponse, unblockPlayer } from "@/lib/community/service";

async function accountOrUnauthorized(request: Request) {
  const account = await accountFromRequest(request);
  return account;
}

export async function GET(request: Request) {
  const account = await accountOrUnauthorized(request);
  if (!account) return NextResponse.json({ error: "Inicia sesión para gestionar bloqueos." }, { status: 401 });
  return NextResponse.json({ players: await blockedPlayers(account.id) });
}

export async function POST(request: Request) {
  const account = await accountOrUnauthorized(request);
  if (!account) return NextResponse.json({ error: "Inicia sesión para bloquear jugadores." }, { status: 401 });
  const body = z.object({ nickname: nicknameSchema }).safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "El apodo no es válido." }, { status: 400 });
  try {
    await assertCommunityAccess(account.id);
    return NextResponse.json({ player: await blockPlayer(account.id, body.data.nickname) }, { status: 201 });
  } catch (error) {
    const result = communityErrorResponse(error);
    return NextResponse.json({ error: result.message }, { status: result.status });
  }
}

export async function DELETE(request: Request) {
  const account = await accountOrUnauthorized(request);
  if (!account) return NextResponse.json({ error: "Inicia sesión para gestionar bloqueos." }, { status: 401 });
  const body = z.object({ nickname: nicknameSchema }).safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "El apodo no es válido." }, { status: 400 });
  await unblockPlayer(account.id, body.data.nickname);
  return NextResponse.json({ ok: true });
}
