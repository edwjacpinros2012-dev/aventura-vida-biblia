import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { accountFromRequest } from "@/lib/auth/server";
import { createSession, revokeAllSessions, sessionCookie } from "@/lib/auth/service";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const schema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(12).max(128),
}).refine((value) => value.currentPassword !== value.newPassword, {
  message: "La nueva contraseña debe ser diferente.",
  path: ["newPassword"],
});

export async function PATCH(request: Request) {
  const account = await accountFromRequest(request);
  if (!account) return NextResponse.json({ error: "Inicia sesión para cambiar tu contraseña." }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Revisa los datos." }, { status: 400 });
  }

  const credential = await prisma.userCredential.findUnique({ where: { userId: account.id } });
  if (!credential || !(await bcrypt.compare(parsed.data.currentPassword, credential.passwordHash))) {
    return NextResponse.json({ error: "La contraseña actual no es correcta." }, { status: 403 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.$transaction([
    prisma.userCredential.update({
      where: { userId: account.id },
      data: { passwordHash, passwordUpdatedAt: new Date() },
    }),
    prisma.userSession.updateMany({
      where: { userId: account.id, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  const token = await createSession(account.id);
  const response = NextResponse.json({ success: true, message: "Contraseña actualizada. Las demás sesiones se cerraron." });
  response.cookies.set(sessionCookie.name, token, sessionCookie.options);
  return response;
}
