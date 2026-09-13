import { NextRequest, NextResponse } from "next/server";
import { revokeSession, sessionCookie } from "@/lib/auth/service";

export async function POST(request: NextRequest) {
  await revokeSession(request.cookies.get(sessionCookie.name)?.value);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookie.name, "", { ...sessionCookie.options, maxAge: 0 });
  return response;
}
