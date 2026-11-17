import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type HealthResult = {
  configured: boolean;
  status: "online" | "offline" | "unconfigured";
  latencyMs?: number;
  message: string;
};

export async function GET() {
  const configuredUrl = process.env.MULTIPLAYER_SERVER_URL?.trim();
  if (!configuredUrl) {
    const result: HealthResult = {
      configured: false,
      status: "unconfigured",
      message: "El servidor persistente todavía no tiene URL configurada en este entorno.",
    };
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  }

  let healthUrl: URL;
  try {
    healthUrl = new URL(configuredUrl);
    if (healthUrl.protocol !== "https:" && healthUrl.protocol !== "http:") throw new Error("Unsupported protocol");
    healthUrl.pathname = "/health";
    healthUrl.search = "";
    healthUrl.hash = "";
  } catch {
    const result: HealthResult = {
      configured: true,
      status: "offline",
      message: "La configuración del servidor no es una URL HTTP válida.",
    };
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  }

  const startedAt = Date.now();
  try {
    const response = await fetch(healthUrl, { cache: "no-store", signal: AbortSignal.timeout(3500) });
    const payload = await response.json().catch(() => null) as { status?: unknown; service?: unknown } | null;
    const online = response.ok && payload?.status === "ok" && payload?.service === "aventura-vida-multiplayer";
    const result: HealthResult = {
      configured: true,
      status: online ? "online" : "offline",
      latencyMs: Date.now() - startedAt,
      message: online ? "Servidor de salas responde correctamente." : "El servidor configurado no respondió con el estado de salud esperado.",
    };
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch {
    const result: HealthResult = {
      configured: true,
      status: "offline",
      latencyMs: Date.now() - startedAt,
      message: "No se pudo contactar con el servidor multijugador.",
    };
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  }
}
