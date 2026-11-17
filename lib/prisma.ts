import { PrismaClient } from "@prisma/client";

// Vercel's Postgres integration exposes namespaced variables. A blank
// DATABASE_URL configured in the project must not shadow those real values.
export const databaseUrl =
  process.env.DATABASE_URL?.trim() ||
  process.env.database_PRISMA_DATABASE_URL?.trim() ||
  process.env.database_DATABASE_URL?.trim() ||
  process.env.database_POSTGRES_URL?.trim() ||
  "";

export const hasDatabaseUrl = databaseUrl.length > 0;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient(
  databaseUrl
    ? { datasources: { db: { url: databaseUrl } } }
    : undefined,
);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
