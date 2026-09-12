import { ChatMessageStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { checkSafeChatMessage } from "./safe-chat";

export class ChatError extends Error {
  constructor(message: string, readonly code: "INVALID_INPUT" | "NOT_ALLOWED" = "INVALID_INPUT") { super(message); }
}

export async function createRoomChatMessage(input: {
  roomCode: string;
  authorId: string;
  authorPlayerKey: string;
  text?: string;
  presetKey?: string;
}) {
  const checked = checkSafeChatMessage({ text: input.text, presetKey: input.presetKey });
  const room = await prisma.multiplayerRoom.findUnique({ where: { code: input.roomCode }, select: { id: true } });
  if (!room) throw new ChatError("Esta sala ya no está disponible.", "INVALID_INPUT");
  if (!checked.ok) {
    await prisma.safeChatMessage.create({
      data: { roomId: room.id, authorId: input.authorId, authorPlayerKey: input.authorPlayerKey, text: checked.text.slice(0, 120), status: ChatMessageStatus.FILTERED, moderationNotes: { reason: checked.reason } as Prisma.InputJsonValue },
    });
    const message = checked.reason === "PERSONAL_DATA"
      ? "Para protegerte, no compartas datos personales en el chat."
      : "Ese mensaje no cumple las normas del chat seguro.";
    throw new ChatError(message, "NOT_ALLOWED");
  }
  return prisma.safeChatMessage.create({
    data: { roomId: room.id, authorId: input.authorId, authorPlayerKey: input.authorPlayerKey, text: checked.text, presetKey: checked.presetKey, status: ChatMessageStatus.VISIBLE },
    select: { id: true, text: true, presetKey: true, createdAt: true },
  });
}

export async function roomChatHistory(roomCode: string, viewerId: string) {
  const room = await prisma.multiplayerRoom.findUnique({ where: { code: roomCode }, select: { id: true } });
  if (!room) return [];
  const blocked = await prisma.playerBlock.findMany({ where: { blockerId: viewerId }, select: { blockedId: true } });
  const blockedIds = blocked.map((row) => row.blockedId);
  return prisma.safeChatMessage.findMany({
    where: { roomId: room.id, status: ChatMessageStatus.VISIBLE, NOT: { authorId: { in: blockedIds } } },
    include: { author: { select: { profile: { select: { nickname: true, avatarKey: true } } } } },
    orderBy: { createdAt: "asc" },
    take: 50,
  });
}
