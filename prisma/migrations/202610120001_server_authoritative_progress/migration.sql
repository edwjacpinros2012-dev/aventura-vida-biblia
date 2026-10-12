-- Progreso de cuentas autorizado por el servidor. Esta migración solo añade
-- columnas y una bitácora nueva: no reinicia ni elimina datos existentes.

CREATE TYPE "PlayerProgressEventKind" AS ENUM ('GAME_COMPLETION', 'DAILY_CHALLENGE', 'CAMPAIGN_LEVEL');

ALTER TABLE "Profile" ADD COLUMN "lastActiveDate" TEXT;

CREATE TABLE "PlayerProgressEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "kind" "PlayerProgressEventKind" NOT NULL,
  "sourceKey" TEXT NOT NULL,
  "gameId" TEXT,
  "xpAwarded" INTEGER NOT NULL DEFAULT 0,
  "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
  "coinsAwarded" INTEGER NOT NULL DEFAULT 0,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PlayerProgressEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PlayerProgressEvent_userId_kind_sourceKey_key"
  ON "PlayerProgressEvent"("userId", "kind", "sourceKey");
CREATE INDEX "PlayerProgressEvent_userId_createdAt_idx"
  ON "PlayerProgressEvent"("userId", "createdAt" DESC);
CREATE INDEX "PlayerProgressEvent_gameId_kind_idx"
  ON "PlayerProgressEvent"("gameId", "kind");

ALTER TABLE "PlayerProgressEvent" ADD CONSTRAINT "PlayerProgressEvent_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerProgressEvent" ADD CONSTRAINT "PlayerProgressEvent_gameId_fkey"
  FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;
