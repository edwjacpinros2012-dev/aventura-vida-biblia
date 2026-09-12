import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.storeItem.findMany({
    where: { active: true },
    select: { slug: true, name: true, description: true, type: true, rarity: true, coinPrice: true, criteria: true },
    orderBy: [{ coinPrice: "asc" }, { name: "asc" }],
  });
  return NextResponse.json({ items });
}
