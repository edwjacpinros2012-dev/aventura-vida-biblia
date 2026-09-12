import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/auth/contracts";
import { AccountError, loginAccount, sessionCookie } from "@/lib/auth/service";
import { requestRateKey, withinRateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  if (!withinRateLimit(requestRateKey(request, "login"), 10, 60_000)) {
    return NextResponse.json({ error: "Demasiados intentos. Espera un minuto." }, { status: 429 });
  }
  const body = loginSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Revisa tu apodo y contraseña." }, { status: 400 });
  try {
    const { account, token } = await loginAccount(body.data);
    const response = NextResponse.json({ account });
    response.cookies.set(sessionCookie.name, token, sessionCookie.options);
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof AccountError ? error.message : "No pudimos iniciar sesión." }, { status: error instanceof AccountError ? error.status : 500 });
  }
}
