-- Fase 1 multijugador: salas, participantes y eventos sincronizados.
CREATE TYPE "MultiplayerRoomStatus" AS ENUM ('LOBBY', 'PLAYING', 'FINISHED', 'CLOSED');
CREATE TYPE "MultiplayerParticipantStatus" AS ENUM ('CONNECTED', 'DISCONNECTED', 'LEFT');

CREATE TABLE "MultiplayerRoom" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "gameKey" TEXT NOT NULL,
  "maxPlayers" INTEGER NOT NULL,
  "hostPlayerKey" TEXT NOT NULL,
  "status" "MultiplayerRoomStatus" NOT NULL DEFAULT 'LOBBY',
  "state" JSONB NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MultiplayerRoom_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MultiplayerParticipant" (
  "id" TEXT NOT NULL,
  "roomId" TEXT NOT NULL,
  "playerKey" TEXT NOT NULL,
  "nickname" TEXT NOT NULL,
  "avatarKey" TEXT NOT NULL DEFAULT 'spark',
  "status" "MultiplayerParticipantStatus" NOT NULL DEFAULT 'CONNECTED',
  "state" JSONB,
  "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP(3) NOT NULL,
  "leftAt" TIMESTAMP(3),
  CONSTRAINT "MultiplayerParticipant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MultiplayerRoomEvent" (
  "id" TEXT NOT NULL,
  "roomId" TEXT NOT NULL,
  "playerKey" TEXT,
  "type" TEXT NOT NULL,
  "revision" INTEGER NOT NULL,
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MultiplayerRoomEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MultiplayerRoom_code_key" ON "MultiplayerRoom"("code");
CREATE INDEX "MultiplayerRoom_gameKey_status_expiresAt_idx" ON "MultiplayerRoom"("gameKey", "status", "expiresAt");
CREATE UNIQUE INDEX "MultiplayerParticipant_roomId_playerKey_key" ON "MultiplayerParticipant"("roomId", "playerKey");
CREATE INDEX "MultiplayerParticipant_roomId_status_idx" ON "MultiplayerParticipant"("roomId", "status");
CREATE INDEX "MultiplayerRoomEvent_roomId_revision_idx" ON "MultiplayerRoomEvent"("roomId", "revision");
CREATE INDEX "MultiplayerRoomEvent_createdAt_idx" ON "MultiplayerRoomEvent"("createdAt");

ALTER TABLE "MultiplayerParticipant" ADD CONSTRAINT "MultiplayerParticipant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "MultiplayerRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MultiplayerRoomEvent" ADD CONSTRAINT "MultiplayerRoomEvent_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "MultiplayerRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
