type RateWindow = { startedAt: number; count: number };

const windows = new Map<string, RateWindow>();

// Límite de proceso para rutas públicas. En producción multi-instancia se debe
// sustituir por Redis/KV, sin cambiar los contratos de las rutas.
export function withinRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = windows.get(key);
  if (!current || now - current.startedAt >= windowMs) {
    windows.set(key, { startedAt: now, count: 1 });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export function requestRateKey(request: Request, scope: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return `${scope}:${forwarded}`;
}
