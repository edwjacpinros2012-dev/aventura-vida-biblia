import { NextResponse } from "next/server";
import { accountFromRequest } from "@/lib/auth/server";
import { walletForPlayer } from "@/lib/economy/service";

export async function GET(request: Request) {
  const account = await accountFromRequest(request);
  if (!account) return NextResponse.json({ error: "Inicia sesión para ver tus Monedas de Aventura." }, { status: 401 });
  const wallet = await walletForPlayer(account.id);
  return NextResponse.json({ adventureCoins: wallet.adventureCoins, version: wallet.version });
}
