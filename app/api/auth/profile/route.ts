import { NextResponse } from "next/server";
import { z } from "zod";
import { accountFromRequest } from "@/lib/auth/server";
import { isSelectableAvatarKey } from "@/lib/characters/catalog";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  avatarKey: z.string().trim().min(1).max(80).refine(isSelectableAvatarKey, "Ese avatar no está disponible."),
});

/**
 * El perfil de Prisma es la autoridad para una cuenta autenticada. Nunca se
 * acepta una URL ni imagen enviada por el cliente: solo una clave del catálogo.
 */
export async function PATCH(request: Request) {
  const account = await accountFromRequest(request);
  if (!account) return NextResponse.json({ error: "Inicia sesión para cambiar tu avatar." }, { status: 401 });
  const body = profileSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: body.error.issues[0]?.message ?? "Revisa el avatar." }, { status: 400 });

  const profile = await prisma.profile.update({
    where: { userId: account.id },
    data: { avatarKey: body.data.avatarKey },
    select: { nickname: true, avatarKey: true },
  });
  return NextResponse.json({ profile });
}
