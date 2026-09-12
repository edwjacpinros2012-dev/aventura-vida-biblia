-- Cuentas sin datos personales obligatorios, seguridad comunitaria y economía.
CREATE TYPE "ChatMessageStatus" AS ENUM ('VISIBLE', 'FILTERED', 'HIDDEN', 'REMOVED');
CREATE TYPE "ReportReason" AS ENUM ('INAPPROPRIATE_LANGUAGE', 'HARASSMENT', 'INSULT', 'SEXUAL_CONTENT', 'THREAT', 'SPAM', 'PERSONAL_INFORMATION', 'INAPPROPRIATE_BEHAVIOR', 'OTHER');
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED');
CREATE TYPE "SanctionType" AS ENUM ('WARNING', 'SHORT_SUSPENSION', 'LONG_SUSPENSION', 'BAN');
CREATE TYPE "SanctionStatus" AS ENUM ('ACTIVE', 'LIFTED', 'EXPIRED');
CREATE TYPE "InventoryItemType" AS ENUM ('AVATAR', 'CHARACTER_STYLE', 'EFFECT', 'SCENERY', 'COSMETIC', 'SPECIAL_CONTENT');
CREATE TYPE "ItemRarity" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'EPIC');
CREATE TYPE "GiftStatus" AS ENUM ('SENT', 'RECEIVED', 'REJECTED', 'CANCELLED');
CREATE TYPE "MatchMode" AS ENUM ('COOPERATIVE', 'PVP_FUTURE');
CREATE TYPE "MatchStatus" AS ENUM ('WAITING', 'ACTIVE', 'FINISHED', 'ABANDONED');
CREATE TYPE "MatchPlayerStatus" AS ENUM ('ACTIVE', 'DISCONNECTED', 'LEFT', 'WON', 'LOST', 'DRAW');

CREATE TABLE "UserCredential" (
  "userId" TEXT NOT NULL, "passwordHash" TEXT NOT NULL, "passwordUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserCredential_pkey" PRIMARY KEY ("userId")
);
CREATE TABLE "UserSession" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "tokenHash" TEXT NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL, "revokedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "lastSeenAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "PlayerWallet" (
  "userId" TEXT NOT NULL, "adventureCoins" INTEGER NOT NULL DEFAULT 0, "version" INTEGER NOT NULL DEFAULT 0, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PlayerWallet_pkey" PRIMARY KEY ("userId")
);
CREATE TABLE "AdventureCoinTransaction" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "amount" INTEGER NOT NULL, "balanceAfter" INTEGER NOT NULL, "reason" TEXT NOT NULL, "sourceId" TEXT, "idempotencyKey" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdventureCoinTransaction_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "StoreItem" (
  "id" TEXT NOT NULL, "slug" TEXT NOT NULL, "name" TEXT NOT NULL, "description" TEXT NOT NULL, "type" "InventoryItemType" NOT NULL, "rarity" "ItemRarity" NOT NULL DEFAULT 'COMMON', "coinPrice" INTEGER NOT NULL DEFAULT 0, "criteria" JSONB, "active" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StoreItem_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "PlayerInventoryItem" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "itemId" TEXT NOT NULL, "source" TEXT NOT NULL, "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PlayerInventoryItem_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AdventureGift" (
  "id" TEXT NOT NULL, "senderId" TEXT NOT NULL, "recipientId" TEXT NOT NULL, "coins" INTEGER NOT NULL DEFAULT 0, "encouragement" TEXT, "idempotencyKey" TEXT NOT NULL, "status" "GiftStatus" NOT NULL DEFAULT 'SENT', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "receivedAt" TIMESTAMP(3),
  CONSTRAINT "AdventureGift_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "PlayerBlock" (
  "id" TEXT NOT NULL, "blockerId" TEXT NOT NULL, "blockedId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PlayerBlock_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "SafeChatMessage" (
  "id" TEXT NOT NULL, "roomId" TEXT, "authorId" TEXT, "authorPlayerKey" TEXT NOT NULL, "text" TEXT NOT NULL, "presetKey" TEXT, "status" "ChatMessageStatus" NOT NULL DEFAULT 'VISIBLE', "moderationNotes" JSONB, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SafeChatMessage_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "CommunityReport" (
  "id" TEXT NOT NULL, "reporterId" TEXT NOT NULL, "reportedUserId" TEXT, "roomId" TEXT, "messageId" TEXT, "reason" "ReportReason" NOT NULL, "details" TEXT, "status" "ReportStatus" NOT NULL DEFAULT 'OPEN', "resolution" TEXT, "resolvedById" TEXT, "resolvedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CommunityReport_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ModerationSanction" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "issuedById" TEXT, "type" "SanctionType" NOT NULL, "status" "SanctionStatus" NOT NULL DEFAULT 'ACTIVE', "reason" TEXT NOT NULL, "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "endsAt" TIMESTAMP(3), "liftedAt" TIMESTAMP(3), "liftedById" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ModerationSanction_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Match" (
  "id" TEXT NOT NULL, "roomId" TEXT, "gameKey" TEXT NOT NULL, "mode" "MatchMode" NOT NULL DEFAULT 'COOPERATIVE', "status" "MatchStatus" NOT NULL DEFAULT 'WAITING', "state" JSONB NOT NULL, "result" JSONB, "startedAt" TIMESTAMP(3), "endedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "MatchPlayer" (
  "id" TEXT NOT NULL, "matchId" TEXT NOT NULL, "userId" TEXT, "playerKey" TEXT NOT NULL, "team" INTEGER, "status" "MatchPlayerStatus" NOT NULL DEFAULT 'ACTIVE', "score" INTEGER NOT NULL DEFAULT 0, "state" JSONB, "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "leftAt" TIMESTAMP(3),
  CONSTRAINT "MatchPlayer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserSession_tokenHash_key" ON "UserSession"("tokenHash");
CREATE INDEX "UserSession_userId_expiresAt_idx" ON "UserSession"("userId", "expiresAt");
CREATE UNIQUE INDEX "AdventureCoinTransaction_idempotencyKey_key" ON "AdventureCoinTransaction"("idempotencyKey");
CREATE INDEX "AdventureCoinTransaction_userId_createdAt_idx" ON "AdventureCoinTransaction"("userId", "createdAt" DESC);
CREATE UNIQUE INDEX "StoreItem_slug_key" ON "StoreItem"("slug");
CREATE INDEX "StoreItem_type_active_idx" ON "StoreItem"("type", "active");
CREATE UNIQUE INDEX "PlayerInventoryItem_userId_itemId_key" ON "PlayerInventoryItem"("userId", "itemId");
CREATE INDEX "PlayerInventoryItem_userId_acquiredAt_idx" ON "PlayerInventoryItem"("userId", "acquiredAt" DESC);
CREATE UNIQUE INDEX "AdventureGift_idempotencyKey_key" ON "AdventureGift"("idempotencyKey");
CREATE INDEX "AdventureGift_senderId_createdAt_idx" ON "AdventureGift"("senderId", "createdAt" DESC);
CREATE INDEX "AdventureGift_recipientId_status_idx" ON "AdventureGift"("recipientId", "status");
CREATE UNIQUE INDEX "PlayerBlock_blockerId_blockedId_key" ON "PlayerBlock"("blockerId", "blockedId");
CREATE INDEX "PlayerBlock_blockedId_idx" ON "PlayerBlock"("blockedId");
CREATE INDEX "SafeChatMessage_roomId_createdAt_idx" ON "SafeChatMessage"("roomId", "createdAt");
CREATE INDEX "SafeChatMessage_authorId_createdAt_idx" ON "SafeChatMessage"("authorId", "createdAt");
CREATE INDEX "CommunityReport_status_createdAt_idx" ON "CommunityReport"("status", "createdAt");
CREATE INDEX "CommunityReport_reportedUserId_createdAt_idx" ON "CommunityReport"("reportedUserId", "createdAt");
CREATE INDEX "ModerationSanction_userId_status_endsAt_idx" ON "ModerationSanction"("userId", "status", "endsAt");
CREATE UNIQUE INDEX "Match_roomId_key" ON "Match"("roomId");
CREATE INDEX "Match_gameKey_mode_status_idx" ON "Match"("gameKey", "mode", "status");
CREATE UNIQUE INDEX "MatchPlayer_matchId_playerKey_key" ON "MatchPlayer"("matchId", "playerKey");
CREATE INDEX "MatchPlayer_userId_joinedAt_idx" ON "MatchPlayer"("userId", "joinedAt" DESC);

ALTER TABLE "UserCredential" ADD CONSTRAINT "UserCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerWallet" ADD CONSTRAINT "PlayerWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdventureCoinTransaction" ADD CONSTRAINT "AdventureCoinTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerInventoryItem" ADD CONSTRAINT "PlayerInventoryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerInventoryItem" ADD CONSTRAINT "PlayerInventoryItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "StoreItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdventureGift" ADD CONSTRAINT "AdventureGift_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdventureGift" ADD CONSTRAINT "AdventureGift_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerBlock" ADD CONSTRAINT "PlayerBlock_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerBlock" ADD CONSTRAINT "PlayerBlock_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SafeChatMessage" ADD CONSTRAINT "SafeChatMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "MultiplayerRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SafeChatMessage" ADD CONSTRAINT "SafeChatMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CommunityReport" ADD CONSTRAINT "CommunityReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityReport" ADD CONSTRAINT "CommunityReport_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CommunityReport" ADD CONSTRAINT "CommunityReport_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "MultiplayerRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CommunityReport" ADD CONSTRAINT "CommunityReport_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "SafeChatMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CommunityReport" ADD CONSTRAINT "CommunityReport_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ModerationSanction" ADD CONSTRAINT "ModerationSanction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ModerationSanction" ADD CONSTRAINT "ModerationSanction_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ModerationSanction" ADD CONSTRAINT "ModerationSanction_liftedById_fkey" FOREIGN KEY ("liftedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "MultiplayerRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MatchPlayer" ADD CONSTRAINT "MatchPlayer_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MatchPlayer" ADD CONSTRAINT "MatchPlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
