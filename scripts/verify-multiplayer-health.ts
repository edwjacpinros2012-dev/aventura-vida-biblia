import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const route = readFileSync(join(process.cwd(), "app", "api", "multiplayer", "health", "route.ts"), "utf8");
const hub = readFileSync(join(process.cwd(), "components", "multiplayer", "multiplayer-hub.tsx"), "utf8");
assert.ok(route.includes("MULTIPLAYER_SERVER_URL"), "El health check debe usar la URL del entorno.");
assert.ok(route.includes('healthUrl.pathname = "/health"'), "El health check debe consultar la ruta de salud fija.");
assert.ok(route.includes("AbortSignal.timeout(3500)"), "La consulta debe tener timeout.");
assert.ok(route.includes('payload?.service === "aventura-vida-multiplayer"'), "Debe validar la identidad de servicio.");
assert.ok(route.includes('"unconfigured"'), "Debe distinguir la falta de configuración.");
assert.ok(!route.includes("request.url"), "No debe aceptar un destino arbitrario del usuario.");
assert.ok(hub.includes("/api/multiplayer/health"), "El centro online debe mostrar el estado del servicio.");
assert.ok(hub.includes('href="/pvp"'), "El centro online debe enlazar el modo duelo.");
console.log("Multiplayer health endpoint and hub integration verified.");
