import { NextResponse } from "next/server";
import { z } from "zod";
import { accountFromRequest } from "@/lib/auth/server";
import { economyErrorResponse, purchaseStoreItem } from "@/lib/economy/service";

const purchaseSchema = z.object({ slug: z.string().trim().regex(/^[a-z0-9-]{2,80}$/), idempotencyKey: z.string().uuid() });

export async function POST(request: Request) {
  const account = await accountFromRequest(request);
  if (!account) return NextResponse.json({ error: "Inicia sesión para comprar." }, { status: 401 });
  const body = purchaseSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Revisa la compra." }, { status: 400 });
  try { return NextResponse.json(await purchaseStoreItem({ userId: account.id, ...body.data })); }
  catch (error) { const result = economyErrorResponse(error); return NextResponse.json({ error: result.message }, { status: result.status }); }
}
