import { NextResponse } from "next/server";
import { registerAccountSchema } from "@/lib/auth/contracts";
import { AccountError, registerAccount, sessionCookie } from "@/lib/auth/service";
import { requestRateKey, withinRateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  if (!withinRateLimit(requestRateKey(request, "register"), 5, 60_000)) {
    return NextResponse.json({ error: "Espera un momento antes de crear otra cuenta." }, { status: 429 });
  }
  const body = registerAccountSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: body.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  try {
    const { account, token } = await registerAccount(body.data);
    const response = NextResponse.json({ account }, { status: 201 });
    response.cookies.set(sessionCookie.name, token, sessionCookie.options);
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof AccountError ? error.message : "No pudimos crear la cuenta." }, { status: error instanceof AccountError ? error.status : 500 });
  }
}
