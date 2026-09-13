import { NextResponse } from "next/server";
import { accountFromRequest } from "@/lib/auth/server";
import { revokeAllSessions, sessionCookie } from "@/lib/auth/service";

// Cierra las sesiones conocidas de una cuenta. Útil si un jugador cree que su
// contraseña pudo verse comprometida; no revela ninguna lista de dispositivos.
export async function DELETE(request: Request) {
  const account = await accountFromRequest(request);
  if (!account) return NextResponse.json({ error: "Inicia sesión para administrar tus sesiones." }, { status: 401 });
  await revokeAllSessions(account.id);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookie.name, "", { ...sessionCookie.options, maxAge: 0 });
  return response;
}
