import { GiftStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isBlocked } from "@/lib/community/service";

export class EconomyError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

const DAILY_GIFT_LIMIT = 3;
const MAX_GIFT_COINS = 100;

type CoinChange = { userId: string; amount: number; reason: string; sourceId?: string; idempotencyKey: string };

async function applyCoinChange(tx: Prisma.TransactionClient, input: CoinChange) {
  if (!Number.isSafeInteger(input.amount) || input.amount === 0) throw new EconomyError("La cantidad de monedas no es válida.");
  const alreadyApplied = await tx.adventureCoinTransaction.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
  if (alreadyApplied) return { balance: alreadyApplied.balanceAfter, repeated: true };
  const wallet = await tx.playerWallet.upsert({ where: { userId: input.userId }, create: { userId: input.userId }, update: {} });
  if (wallet.adventureCoins + input.amount < 0) throw new EconomyError("No tienes suficientes Monedas de Aventura.", 409);
  const updated = await tx.playerWallet.update({
    where: { userId: input.userId },
    data: { adventureCoins: { increment: input.amount }, version: { increment: 1 } },
  });
  await tx.adventureCoinTransaction.create({
    data: { ...input, balanceAfter: updated.adventureCoins },
  });
  return { balance: updated.adventureCoins, repeated: false };
}

/** Recompensa exclusiva de servicios de servidor (misiones, juegos, eventos). */
export async function awardAdventureCoins(input: CoinChange) {
  if (input.amount < 1) throw new EconomyError("Una recompensa debe ser positiva.");
  return prisma.$transaction((tx) => applyCoinChange(tx, input), { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function walletForPlayer(userId: string) {
  return prisma.playerWallet.upsert({ where: { userId }, create: { userId }, update: {} });
}

export async function purchaseStoreItem(input: { userId: string; slug: string; idempotencyKey: string }) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.storeItem.findUnique({ where: { slug: input.slug } });
    if (!item?.active) throw new EconomyError("Ese objeto no está disponible.", 404);
    const existing = await tx.playerInventoryItem.findUnique({ where: { userId_itemId: { userId: input.userId, itemId: item.id } } });
    if (existing) return { item, alreadyOwned: true };

    const criteria = (item.criteria ?? {}) as { minLevel?: number };
    if (criteria.minLevel) {
      const profile = await tx.profile.findUnique({ where: { userId: input.userId }, select: { level: true } });
      if (!profile || profile.level < criteria.minLevel) throw new EconomyError("Aún no has alcanzado el nivel para desbloquear este objeto.", 403);
    }
    await applyCoinChange(tx, { userId: input.userId, amount: -item.coinPrice, reason: "STORE_PURCHASE", sourceId: item.id, idempotencyKey: input.idempotencyKey });
    await tx.playerInventoryItem.create({ data: { userId: input.userId, itemId: item.id, source: "STORE" } });
    return { item, alreadyOwned: false };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function giftAdventureCoins(input: { senderId: string; recipientNickname: string; coins: number; encouragement?: string; idempotencyKey: string }) {
  if (!Number.isSafeInteger(input.coins) || input.coins < 1 || input.coins > MAX_GIFT_COINS) {
    throw new EconomyError(`Puedes regalar entre 1 y ${MAX_GIFT_COINS} monedas.`);
  }
  const recipient = await prisma.profile.findUnique({ where: { nickname: input.recipientNickname }, select: { userId: true, nickname: true } });
  if (!recipient) throw new EconomyError("No encontramos a ese jugador.", 404);
  if (recipient.userId === input.senderId) throw new EconomyError("No puedes enviarte monedas a ti mismo.");
  if (await isBlocked(recipient.userId, input.senderId)) throw new EconomyError("No puedes enviar un regalo a este jugador.", 403);

  return prisma.$transaction(async (tx) => {
    const duplicate = await tx.adventureGift.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
    if (duplicate) return { gift: duplicate, repeated: true };
    const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0);
    const sentToday = await tx.adventureGift.count({ where: { senderId: input.senderId, createdAt: { gte: dayStart }, status: { in: [GiftStatus.SENT, GiftStatus.RECEIVED] } } });
    if (sentToday >= DAILY_GIFT_LIMIT) throw new EconomyError("Ya enviaste los 3 regalos de ánimo de hoy.", 429);
    const gift = await tx.adventureGift.create({
      data: { senderId: input.senderId, recipientId: recipient.userId, coins: input.coins, encouragement: input.encouragement, idempotencyKey: input.idempotencyKey, status: GiftStatus.RECEIVED, receivedAt: new Date() },
    });
    await applyCoinChange(tx, { userId: input.senderId, amount: -input.coins, reason: "GIFT_SENT", sourceId: gift.id, idempotencyKey: `${input.idempotencyKey}:debit` });
    await applyCoinChange(tx, { userId: recipient.userId, amount: input.coins, reason: "GIFT_RECEIVED", sourceId: gift.id, idempotencyKey: `${input.idempotencyKey}:credit` });
    return { gift, repeated: false };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export function economyErrorResponse(error: unknown) {
  if (error instanceof EconomyError) return { status: error.status, message: error.message };
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return { status: 409, message: "Esta operación ya fue registrada." };
  return { status: 500, message: "No pudimos actualizar las Monedas de Aventura." };
}
