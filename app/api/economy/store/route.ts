import { NextResponse } from "next/server";
import { z } from "zod";
import { accountFromRequest } from "@/lib/auth/server";
import { economyErrorResponse, purchaseStoreItem, walletForPlayer } from "@/lib/economy/service";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const purchaseSchema = z.object({
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/),
  idempotencyKey: z.string().uuid(),
});

export async function GET(request: Request) {
  const account = await accountFromRequest(request);
  const [profile, wallet, items, inventory] = await Promise.all([
    account ? prisma.profile.findUnique({ where: { userId: account.id }, select: { level: true } }) : null,
    account ? walletForPlayer(account.id) : null,
    prisma.storeItem.findMany({
      where: { active: true },
      orderBy: [{ coinPrice: "asc" }, { name: "asc" }],
      include: { owners: account ? { where: { userId: account.id }, select: { id: true } } : false },
    }),
    account ? prisma.playerInventoryItem.findMany({
      where: { userId: account.id },
      include: { item: { select: { slug: true, name: true, description: true, type: true, rarity: true } } },
      orderBy: { acquiredAt: "desc" },
    }) : [],
  ]);

  return NextResponse.json({
    authenticated: Boolean(account),
    level: profile?.level ?? 1,
    adventureCoins: wallet?.adventureCoins ?? 0,
    items: items.map((item) => {
      const criteria = item.criteria && typeof item.criteria === "object" && !Array.isArray(item.criteria)
        ? item.criteria as { minLevel?: number }
        : {};
      const minLevel = typeof criteria.minLevel === "number" && Number.isSafeInteger(criteria.minLevel) ? Math.max(1, criteria.minLevel) : 1;
      return {
        slug: item.slug, name: item.name, description: item.description, type: item.type,
        rarity: item.rarity, coinPrice: item.coinPrice, minLevel,
        owned: account ? item.owners.length > 0 : false,
        unlocked: Boolean(account && (profile?.level ?? 0) >= minLevel),
      };
    }),
    inventory: inventory.map(({ id, item, acquiredAt }) => ({ id, item, acquiredAt })),
  }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  const account = await accountFromRequest(request);
  if (!account) return NextResponse.json({ error: "Inicia sesión para comprar con tus Monedas de Aventura." }, { status: 401 });
  const parsed = purchaseSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Los datos de compra no son válidos." }, { status: 400 });

  try {
    const result = await purchaseStoreItem({ userId: account.id, slug: parsed.data.slug, idempotencyKey: parsed.data.idempotencyKey });
    const wallet = await walletForPlayer(account.id);
    return NextResponse.json({
      success: true,
      alreadyOwned: result.alreadyOwned,
      item: { slug: result.item.slug, name: result.item.name },
      adventureCoins: wallet.adventureCoins,
    });
  } catch (error) {
    const result = economyErrorResponse(error);
    return NextResponse.json({ error: result.message }, { status: result.status });
  }
}
