import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { accountFromRequest } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const buildSchema = z.object({
  id: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  kind: z.enum(["cabin", "lamp"]),
}).strict();

const stateSchema = z.object({
  collectedLights: z.array(z.number().int().min(0).max(3)).max(4),
  collectedWood: z.array(z.number().int().min(0).max(2)).max(3),
  collectedStone: z.array(z.number().int().min(0).max(1)).max(2),
  builds: z.array(buildSchema).max(32),
}).strict().superRefine((value, context) => {
  const unique = (values: number[]) => new Set(values).size === values.length;
  if (!unique(value.collectedLights) || !unique(value.collectedWood) || !unique(value.collectedStone)) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "No se permiten recursos duplicados." });
  }
  if (new Set(value.builds.map((build) => build.id)).size !== value.builds.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Hay construcciones duplicadas." });
  }
  const woodCost = value.builds.reduce((total, build) => total + (build.kind === "cabin" ? 2 : 1), 0);
  const stoneCost = value.builds.filter((build) => build.kind === "cabin").length;
  if (woodCost > value.collectedWood.length || stoneCost > value.collectedStone.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Las construcciones superan los materiales reunidos." });
  }
});

const emptyState = {
  collectedLights: [] as number[],
  collectedWood: [] as number[],
  collectedStone: [] as number[],
  builds: [] as Array<{ id: number; kind: "cabin" | "lamp" }>,
};

export async function GET(request: Request) {
  const account = await accountFromRequest(request);
  if (!account) {
    return NextResponse.json({ authenticated: false, state: emptyState }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  const saved = await prisma.playerWorldState.findUnique({ where: { userId: account.id } });
  return NextResponse.json({
    authenticated: true,
    state: saved ? {
      collectedLights: saved.collectedLights,
      collectedWood: saved.collectedWood,
      collectedStone: saved.collectedStone,
      builds: Array.isArray(saved.builds) ? saved.builds : [],
    } : emptyState,
  }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function PUT(request: Request) {
  const account = await accountFromRequest(request);
  if (!account) return NextResponse.json({ error: "Inicia sesión para guardar tu mundo en tu cuenta." }, { status: 401 });

  const parsed = stateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "El progreso del mundo no es válido." }, { status: 400 });

  const state = parsed.data;
  const saved = await prisma.playerWorldState.upsert({
    where: { userId: account.id },
    create: {
      userId: account.id,
      collectedLights: state.collectedLights,
      collectedWood: state.collectedWood,
      collectedStone: state.collectedStone,
      builds: state.builds as Prisma.InputJsonValue,
    },
    update: {
      collectedLights: state.collectedLights,
      collectedWood: state.collectedWood,
      collectedStone: state.collectedStone,
      builds: state.builds as Prisma.InputJsonValue,
    },
  });

  return NextResponse.json({
    success: true,
    updatedAt: saved.updatedAt.toISOString(),
    state: {
      collectedLights: saved.collectedLights,
      collectedWood: saved.collectedWood,
      collectedStone: saved.collectedStone,
      builds: state.builds,
    },
  }, { headers: { "Cache-Control": "private, no-store" } });
}
