import { NextResponse } from "next/server";
import { accountFromRequest } from "@/lib/auth/server";
import { roomChatHistory } from "@/lib/community/chat-service";
import { roomCodeSchema } from "@/lib/multiplayer/contracts";

export async function GET(request: Request, context: { params: Promise<{ code: string }> }) {
  const account = await accountFromRequest(request);
  if (!account) return NextResponse.json({ error: "Inicia sesión para consultar el chat de sala." }, { status: 401 });
  const parsed = roomCodeSchema.safeParse((await context.params).code);
  if (!parsed.success) return NextResponse.json({ error: "La sala no es válida." }, { status: 400 });
  const messages = await roomChatHistory(parsed.data, account.id);
  return NextResponse.json({
    messages: messages.map((message) => ({
      id: message.id,
      text: message.text,
      presetKey: message.presetKey,
      createdAt: message.createdAt,
      author: { nickname: message.author?.profile?.nickname ?? "Explorador", avatar: message.author?.profile?.avatarKey ?? "✦" },
    })),
  });
}
