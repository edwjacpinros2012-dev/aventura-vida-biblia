import { NextResponse } from "next/server";
import { z } from "zod";
import { accountFromRequest } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const equipmentType = z.enum(["AVATAR", "CHARACTER_STYLE", "EFFECT", "SCENERY", "COSMETIC", "SPECIAL_CONTENT"]);
const equipSchema = z.object({ slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/) });
const unequipSchema = z.object({ type: equipmentType });

export async function POST(request: Request) {
  const account = await accountFromRequest(request);
  if (!account) return NextResponse.json({ error: "Inicia sesión para equipar objetos." }, { status: 401 });
  const parsed = equipSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "El objeto solicitado no es válido." }, { status: 400 });

  const owned = await prisma.playerInventoryItem.findFirst({
    where: { userId: account.id, item: { slug: parsed.data.slug, active: true } },
    include: { item: { select: { id: true, slug: true, name: true, type: true } } },
  });
  if (!owned) return NextResponse.json({ error: "Primero debes conseguir ese objeto en la tienda." }, { status: 403 });

  const equipped = await prisma.playerEquippedItem.upsert({
    where: { userId_type: { userId: account.id, type: owned.item.type } },
    update: { itemId: owned.item.id, equippedAt: new Date() },
    create: { userId: account.id, itemId: owned.item.id, type: owned.item.type },
    include: { item: { select: { slug: true, name: true, type: true } } },
  });
  return NextResponse.json({ success: true, equipped: equipped.item });
}

export async function DELETE(request: Request) {
  const account = await accountFromRequest(request);
  if (!account) return NextResponse.json({ error: "Inicia sesión para cambiar tu equipamiento." }, { status: 401 });
  const parsed = unequipSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "La categoría de equipamiento no es válida." }, { status: 400 });

  await prisma.playerEquippedItem.deleteMany({ where: { userId: account.id, type: parsed.data.type } });
  return NextResponse.json({ success: true, unequipped: parsed.data.type });
}
