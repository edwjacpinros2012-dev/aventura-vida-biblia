import { NextResponse } from "next/server";
import { accountFromRequest } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const account = await accountFromRequest(request);
  if (!account) return NextResponse.json({ error: "Inicia sesión para ver tu inventario." }, { status: 401 });
  const items = await prisma.playerInventoryItem.findMany({
    where: { userId: account.id },
    include: { item: { select: { slug: true, name: true, description: true, type: true, rarity: true } } },
    orderBy: { acquiredAt: "desc" },
  });
  return NextResponse.json({ items: items.map(({ item, acquiredAt, source }) => ({ ...item, acquiredAt, source })) });
}
