import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const prisma = readFileSync(join(process.cwd(), "lib", "prisma.ts"), "utf8");
const multiplayer = readFileSync(join(process.cwd(), "server", "multiplayer-server.ts"), "utf8");
const rooms = readFileSync(join(process.cwd(), "server", "multiplayer", "room-service.ts"), "utf8");

assert.ok(prisma.includes("process.env.DATABASE_URL?.trim()"), "Debe priorizar DATABASE_URL cuando está configurada.");
assert.ok(prisma.includes("process.env.database_PRISMA_DATABASE_URL?.trim()"), "Debe admitir la URL Prisma de la integración de Vercel.");
assert.ok(prisma.includes("process.env.database_DATABASE_URL?.trim()"), "Debe admitir la URL general de la integración de Vercel.");
assert.ok(prisma.includes("datasources: { db: { url: databaseUrl } }"), "Prisma debe recibir explícitamente la URL resuelta.");
assert.ok(prisma.includes("export const hasDatabaseUrl"), "Debe exponer si existe una conexión utilizable.");
assert.ok(multiplayer.includes("if (!hasDatabaseUrl) return next();"), "El servidor Socket.IO debe usar la misma detección de conexión.");
assert.ok(rooms.includes("private readonly enabled = hasDatabaseUrl;"), "Las salas deben persistir usando la URL resuelta de la integración.");
console.log("Database environment configuration verified (no secrets read).");
