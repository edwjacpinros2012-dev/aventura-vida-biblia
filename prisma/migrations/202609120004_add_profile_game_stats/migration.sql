-- Contadores privados de progreso de cuenta. Se complementan con el progreso
-- local actual hasta que la sincronización validada de cada minijuego llegue.
ALTER TABLE "Profile" ADD COLUMN "streak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Profile" ADD COLUMN "gamesPlayed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Profile" ADD COLUMN "adventuresCompleted" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Profile" ADD COLUMN "learnedVerses" INTEGER NOT NULL DEFAULT 0;
