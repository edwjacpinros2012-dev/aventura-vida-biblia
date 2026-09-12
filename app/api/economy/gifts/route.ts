import { NextResponse } from "next/server";
import { z } from "zod";
import { accountFromRequest } from "@/lib/auth/server";
import { nicknameSchema } from "@/lib/auth/contracts";
import { POSITIVE_MESSAGES } from "@/lib/community/safe-chat";
import { economyErrorResponse, giftAdventureCoins } from "@/lib/economy/service";

const giftSchema = z.object({
  recipientNickname: nicknameSchema,
  coins: z.number().int().min(1).max(100),
  encouragement: z.enum(["great_job", "keep_going", "good_game", "you_can_do_it", "bless_you"]).optional(),
  idempotencyKey: z.string().uuid(),
});

export async function POST(request: Request) {
  const account = await accountFromRequest(request);
  if (!account) return NextResponse.json({ error: "Inicia sesión para enviar un regalo." }, { status: 401 });
  const body = giftSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Revisa el regalo." }, { status: 400 });
  try {
    const response = await giftAdventureCoins({
      senderId: account.id,
      recipientNickname: body.data.recipientNickname,
      coins: body.data.coins,
      encouragement: body.data.encouragement ? POSITIVE_MESSAGES[body.data.encouragement] : undefined,
      idempotencyKey: body.data.idempotencyKey,
    });
    return NextResponse.json(response);
  } catch (error) {
    const result = economyErrorResponse(error);
    return NextResponse.json({ error: result.message }, { status: result.status });
  }
}
