import { NextResponse } from "next/server";
import { z } from "zod";
import { accountFromRequest } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const slotSchema = z.enum(["HEAD", "CHEST", "BACK", "HAND", "COMPANION", "EFFECT"]);
const equipSchema = z.object({ slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/) });
const removeSchema = z.object({ slot: slotSchema });

export async function GET(request: Request) {
  const account = await accountFromRequest(request);
  if (!account) return NextResponse.json({ authenticated: false, equipped: [] }, { headers: { "Cache-Control": "private, no-store" } });

  const equipped = await prisma.playerEquippedItem.findMany({
    where: { userId: account.id },
    include: { item: { select: { slug: true, name: true, type: true, equipmentSlot: true } } },
    orderBy: { equippedAt: "desc" },
  });
  return NextResponse.json({
    authenticated: true,
    equipped: equipped.map(({ item, slot }) => ({ ...item, slot })),
  }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  const account = await accountFromRequest(request);
  if (!account) return NextResponse.json({ error: "Inicia sesión para equipar objetos." }, { status: 401 });
  const parsed = equipSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "El objeto solicitado no es válido." }, { status: 400 });

  const owned = await prisma.playerInventoryItem.findFirst({
    where: { userId: account.id, item: { slug: parsed.data.slug, active: true } },
    include: { item: { select: { id: true, slug: true, name: true, type: true, equipmentSlot: true } } },
  });
  if (!owned) return NextResponse.json({ error: "Primero debes conseguir ese objeto en la tienda." }, { status: 403 });
  if (!owned.item.equipmentSlot) return NextResponse.json({ error: "Este objeto es de colección y todavía no tiene una ranura visual." }, { status: 422 });

  const equipped = await prisma.playerEquippedItem.upsert({
    where: { userId_slot: { userId: account.id, slot: owned.item.equipmentSlot } },
    update: { itemId: owned.item.id, equippedAt: new Date() },
    create: { userId: account.id, itemId: owned.item.id, slot: owned.item.equipmentSlot },
    include: { item: { select: { slug: true, name: true, type: true, equipmentSlot: true } } },
  });
  return NextResponse.json({ success: true, equipped: { ...equipped.item, slot: equipped.slot } });
}

export async function DELETE(request: Request) {
  const account = await accountFromRequest(request);
  if (!account) return NextResponse.json({ error: "Inicia sesión para cambiar tu equipamiento." }, { status: 401 });
  const parsed = removeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "La ranura solicitada no es válida." }, { status: 400 });
  await prisma.playerEquippedItem.deleteMany({ where: { userId: account.id, slot: parsed.data.slot } });
  return NextResponse.json({ success: true, removed: parsed.data.slot });
}
