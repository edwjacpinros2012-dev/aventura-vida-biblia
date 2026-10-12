import { NextResponse } from "next/server";
import { z } from "zod";
import { accountFromRequest } from "@/lib/auth/server";
import { completeCampaignLevel, completeDailyChallenge, completeGameSession, ProgressError, rewardResultForState } from "@/lib/progress/service";

const schema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("GAME_SESSION"), sessionId: z.string().cuid() }),
  z.object({ kind: z.literal("DAILY_CHALLENGE"), challengeId: z.string().regex(/^nivel-diario-\d{4}-\d{2}-\d{2}$/) }),
  z.object({ kind: z.literal("CAMPAIGN_LEVEL"), levelId: z.string().regex(/^armadura-level-[1-7]$/), elapsedSeconds: z.number().finite().min(0).max(7_200) }),
]);

export async function POST(request: Request) {
  const account = await accountFromRequest(request);
  if (!account) return NextResponse.json({ error: "Inicia sesión para confirmar la recompensa." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "La recompensa solicitada no es válida." }, { status: 400 });
  try {
    const result = parsed.data.kind === "GAME_SESSION"
      ? await completeGameSession(account.id, parsed.data.sessionId)
      : parsed.data.kind === "DAILY_CHALLENGE"
        ? await completeDailyChallenge(account.id, parsed.data.challengeId)
        : await completeCampaignLevel(account.id, parsed.data.levelId, parsed.data.elapsedSeconds);
    return NextResponse.json({ repeated: result.repeated, reward: "reward" in result ? result.reward : undefined, result: rewardResultForState(result.state, "achievementIds" in result ? result.achievementIds : []), state: result.state }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof ProgressError ? error.message : "No pudimos confirmar la recompensa." }, { status: error instanceof ProgressError ? error.status : 503 });
  }
}
