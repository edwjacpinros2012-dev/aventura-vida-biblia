CREATE TABLE "PlayerWorldState" (
  "userId" TEXT NOT NULL,
  "collectedLights" INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
  "collectedWood" INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
  "collectedStone" INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
  "builds" JSONB NOT NULL DEFAULT '[]'::JSONB,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PlayerWorldState_pkey" PRIMARY KEY ("userId")
);

ALTER TABLE "PlayerWorldState"
  ADD CONSTRAINT "PlayerWorldState_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
