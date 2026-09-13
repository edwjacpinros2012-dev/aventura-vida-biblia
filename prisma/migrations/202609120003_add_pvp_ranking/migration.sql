-- Duelo de Preguntas: reutiliza Match y MatchPlayer de la infraestructura
-- existente. La información privada queda en User/Profile, no en el ranking.
ALTER TYPE "MatchMode" RENAME VALUE 'PVP_FUTURE' TO 'PVP';
ALTER TABLE "Match" ADD COLUMN "pvpCode" TEXT;
CREATE UNIQUE INDEX "Match_pvpCode_key" ON "Match"("pvpCode");

CREATE TABLE "PvpProfile" (
  "userId" TEXT NOT NULL,
  "rating" INTEGER NOT NULL DEFAULT 1000,
  "wins" INTEGER NOT NULL DEFAULT 0,
  "losses" INTEGER NOT NULL DEFAULT 0,
  "draws" INTEGER NOT NULL DEFAULT 0,
  "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PvpProfile_pkey" PRIMARY KEY ("userId")
);

CREATE INDEX "PvpProfile_rating_idx" ON "PvpProfile"("rating" DESC);
ALTER TABLE "PvpProfile" ADD CONSTRAINT "PvpProfile_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
