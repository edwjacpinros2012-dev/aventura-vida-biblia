import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { dailyContentAutomation, ensureDailyBibleContent } from "@/lib/content-automation/daily-content-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function secretsMatch(value: string | null, expected: string | undefined) {
  if (!value || !expected) return false;
  const received = Buffer.from(value);
  const configured = Buffer.from(expected);
  return received.length === configured.length && timingSafeEqual(received, configured);
}

function isAuthorized(request: Request) {
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
  return secretsMatch(bearer, process.env.CRON_SECRET);
}

async function run(request: Request) {
  if (!process.env.CRON_SECRET) return NextResponse.json({ error: "La automatización no está configurada en este entorno." }, { status: 503 });
  if (!isAuthorized(request)) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  try {
    const result = await ensureDailyBibleContent();
    return NextResponse.json({ ...result, source: "template", aiProviderConfigured: dailyContentAutomation.aiProviderConfigured });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo preparar el contenido diario.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Vercel Cron invoca la ruta con GET y el encabezado Authorization.
export async function GET(request: Request) { return run(request); }
// POST permite una reejecución manual protegida desde operaciones, sin exponer
// una consola de generación al navegador público.
export async function POST(request: Request) { return run(request); }
