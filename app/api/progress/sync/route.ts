import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { accountFromRequest } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const operationSchema = z.object({
  id: z.string().uuid(),
  type: z.literal("GAME_PROGRESS"),
  accountId: z.string().cuid(),
  gameSlug: z.string().trim().regex(/^[a-z0-9-]{2,80}$/),
  data: z.record(z.string(), z.unknown()),
  updatedAt: z.string().datetime(),
});

const syncSchema = z.object({
  operations: z.array(operationSchema).min(1).max(20),
});

function normalizeJsonObject(
  data: Record<string, unknown>,
): Prisma.InputJsonObject | null {
  try {
    const serialized = JSON.stringify(data);

    if (typeof serialized !== "string" || serialized.length > 12_000) {
      return null;
    }

    const normalized: unknown = JSON.parse(serialized);

    if (
      normalized === null ||
      typeof normalized !== "object" ||
      Array.isArray(normalized)
    ) {
      return null;
    }

    return normalized as Prisma.InputJsonObject;
  } catch {
    return null;
  }
}

/**
 * Solo sincroniza datos de avance no premiables. XP, puntos, monedas, logros
 * y recompensas continúan siendo autoridad del servidor en sus flujos propios.
 */
export async function POST(request: Request) {
  const account = await accountFromRequest(request);

  if (!account) {
    return NextResponse.json(
      { error: "Inicia sesión para sincronizar tu avance." },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = syncSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "La cola de sincronización no es válida." },
      { status: 400 },
    );
  }

  const appliedIds: string[] = [];
  const duplicateIds: string[] = [];
  const rejected: Array<{ id: string; reason: string }> = [];

  for (const operation of parsed.data.operations) {
    if (operation.accountId !== account.id) {
      rejected.push({ id: operation.id, reason: "Esta operación pertenece a otra cuenta." });
      continue;
    }
    const jsonData = normalizeJsonObject(operation.data);

    if (jsonData === null) {
      rejected.push({
        id: operation.id,
        reason: "El progreso es demasiado grande o no se puede guardar.",
      });
      continue;
    }

    const result = await prisma.$transaction(async (tx) => {
      const prior = await tx.offlineSyncOperation.findUnique({
        where: { id: operation.id },
        select: { userId: true },
      });

      if (prior) {
        return prior.userId === account.id
          ? ("duplicate" as const)
          : ("forbidden" as const);
      }

      const game = await tx.game.findUnique({
        where: { slug: operation.gameSlug },
        select: { id: true },
      });

      if (!game) {
        return "unknown-game" as const;
      }

      await tx.gameProgress.upsert({
        where: {
          userId_gameId: {
            userId: account.id,
            gameId: game.id,
          },
        },
        update: { data: jsonData },
        create: {
          userId: account.id,
          gameId: game.id,
          data: jsonData,
        },
      });

      await tx.offlineSyncOperation.create({
        data: {
          id: operation.id,
          userId: account.id,
          kind: operation.type,
          payload: {
            ...operation,
            data: jsonData,
          },
        },
      });

      return "applied" as const;
    });

    if (result === "applied") {
      appliedIds.push(operation.id);
    } else if (result === "duplicate") {
      duplicateIds.push(operation.id);
    } else {
      rejected.push({
        id: operation.id,
        reason:
          result === "forbidden"
            ? "Esta operación pertenece a otra cuenta."
            : "El juego ya no está disponible.",
      });
    }
  }

  return NextResponse.json({
    appliedIds,
    duplicateIds,
    rejected,
  });
}

