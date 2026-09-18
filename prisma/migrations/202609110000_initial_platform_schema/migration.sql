-- Esquema fundacional de Aventura Vida Biblia.
-- Esta migración debe ir antes de las migraciones de salas, cuentas, PvP y
-- economía. Así `prisma migrate deploy` puede inicializar una base PostgreSQL
-- vacía de producción sin depender de tablas que todavía no existen.

CREATE TYPE "UserRole" AS ENUM ('PLAYER', 'ADMIN', 'MODERATOR', 'TEACHER', 'FAMILY');
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED');
CREATE TYPE "GameType" AS ENUM ('INTERNAL', 'TRUSTED_EMBED');
CREATE TYPE "Difficulty" AS ENUM ('INITIAL', 'EXPLORER', 'ADVENTURER');
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ABANDONED');
CREATE TYPE "ScorePeriod" AS ENUM ('WEEKLY', 'MONTHLY', 'SEASON');
CREATE TYPE "MissionStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'ENDED', 'ARCHIVED');
CREATE TYPE "RewardType" AS ENUM ('XP', 'POINTS', 'ACHIEVEMENT', 'ITEM');
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'READ');
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'UNPUBLISH', 'ARCHIVE', 'LOGIN');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT,
  "role" "UserRole" NOT NULL DEFAULT 'PLAYER',
  "emailVerified" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Profile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "nickname" TEXT NOT NULL,
  "avatarKey" TEXT NOT NULL DEFAULT 'fox',
  "level" INTEGER NOT NULL DEFAULT 1,
  "totalXp" INTEGER NOT NULL DEFAULT 0,
  "points" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GameCategory" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "icon" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GameCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Game" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "shortDescription" TEXT NOT NULL,
  "description" TEXT,
  "coverImageUrl" TEXT,
  "categoryId" TEXT,
  "suggestedAgeMin" INTEGER,
  "suggestedAgeMax" INTEGER,
  "difficulty" "Difficulty" NOT NULL DEFAULT 'INITIAL',
  "maxPoints" INTEGER NOT NULL DEFAULT 0,
  "xpReward" INTEGER NOT NULL DEFAULT 0,
  "gameType" "GameType" NOT NULL DEFAULT 'INTERNAL',
  "moduleKey" TEXT,
  "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
  "publishedAt" TIMESTAMP(3),
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GameSession" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "gameId" TEXT NOT NULL,
  "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endedAt" TIMESTAMP(3),
  "metadata" JSONB,
  CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GameProgress" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "gameId" TEXT NOT NULL,
  "data" JSONB NOT NULL,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GameProgress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Score" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "gameId" TEXT,
  "points" INTEGER NOT NULL,
  "period" "ScorePeriod" NOT NULL,
  "periodKey" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "XpTransaction" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "reason" TEXT NOT NULL,
  "sourceId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "XpTransaction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Mission" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3),
  "objective" JSONB NOT NULL,
  "xpReward" INTEGER NOT NULL DEFAULT 0,
  "pointsReward" INTEGER NOT NULL DEFAULT 0,
  "status" "MissionStatus" NOT NULL DEFAULT 'DRAFT',
  "gameId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Mission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MissionProgress" (
  "id" TEXT NOT NULL,
  "missionId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "progress" JSONB NOT NULL,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "MissionProgress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Achievement" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "icon" TEXT,
  "criteria" JSONB NOT NULL,
  "xpReward" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserAchievement" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "achievementId" TEXT NOT NULL,
  "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "metadata" JSONB,
  CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Adventure" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "description" TEXT,
  "coverImageUrl" TEXT,
  "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Adventure_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdventureChapter" (
  "id" TEXT NOT NULL,
  "adventureId" TEXT NOT NULL,
  "chapterNumber" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT,
  "objectives" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AdventureChapter_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdventureGame" (
  "adventureId" TEXT NOT NULL,
  "gameId" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "AdventureGame_pkey" PRIMARY KEY ("adventureId", "gameId")
);

CREATE TABLE "Reward" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "RewardType" NOT NULL,
  "amount" INTEGER,
  "label" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "sourceId" TEXT,
  "metadata" JSONB,
  "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "readAt" TIMESTAMP(3),
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SiteSetting" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value" JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "actorId" TEXT,
  "action" "AuditAction" NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
CREATE UNIQUE INDEX "Profile_nickname_key" ON "Profile"("nickname");
CREATE INDEX "Profile_points_idx" ON "Profile"("points" DESC);
CREATE UNIQUE INDEX "GameCategory_name_key" ON "GameCategory"("name");
CREATE UNIQUE INDEX "GameCategory_slug_key" ON "GameCategory"("slug");
CREATE UNIQUE INDEX "Game_slug_key" ON "Game"("slug");
CREATE UNIQUE INDEX "Game_moduleKey_key" ON "Game"("moduleKey");
CREATE INDEX "Game_status_publishedAt_idx" ON "Game"("status", "publishedAt");
CREATE INDEX "Game_categoryId_status_idx" ON "Game"("categoryId", "status");
CREATE INDEX "Game_featured_status_idx" ON "Game"("featured", "status");
CREATE INDEX "GameSession_userId_gameId_startedAt_idx" ON "GameSession"("userId", "gameId", "startedAt" DESC);
CREATE INDEX "GameSession_gameId_status_idx" ON "GameSession"("gameId", "status");
CREATE UNIQUE INDEX "GameProgress_userId_gameId_key" ON "GameProgress"("userId", "gameId");
CREATE INDEX "GameProgress_gameId_completed_idx" ON "GameProgress"("gameId", "completed");
CREATE INDEX "Score_period_periodKey_points_idx" ON "Score"("period", "periodKey", "points" DESC);
CREATE INDEX "Score_userId_createdAt_idx" ON "Score"("userId", "createdAt" DESC);
CREATE INDEX "XpTransaction_userId_createdAt_idx" ON "XpTransaction"("userId", "createdAt" DESC);
CREATE UNIQUE INDEX "Mission_slug_key" ON "Mission"("slug");
CREATE INDEX "Mission_status_startsAt_idx" ON "Mission"("status", "startsAt");
CREATE UNIQUE INDEX "MissionProgress_missionId_userId_key" ON "MissionProgress"("missionId", "userId");
CREATE INDEX "MissionProgress_userId_completedAt_idx" ON "MissionProgress"("userId", "completedAt");
CREATE UNIQUE INDEX "Achievement_slug_key" ON "Achievement"("slug");
CREATE INDEX "Achievement_active_idx" ON "Achievement"("active");
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");
CREATE INDEX "UserAchievement_userId_unlockedAt_idx" ON "UserAchievement"("userId", "unlockedAt" DESC);
CREATE UNIQUE INDEX "Adventure_slug_key" ON "Adventure"("slug");
CREATE INDEX "Adventure_status_featured_idx" ON "Adventure"("status", "featured");
CREATE UNIQUE INDEX "AdventureChapter_adventureId_chapterNumber_key" ON "AdventureChapter"("adventureId", "chapterNumber");
CREATE INDEX "AdventureGame_gameId_idx" ON "AdventureGame"("gameId");
CREATE INDEX "Reward_userId_awardedAt_idx" ON "Reward"("userId", "awardedAt" DESC);
CREATE INDEX "Notification_userId_status_createdAt_idx" ON "Notification"("userId", "status", "createdAt" DESC);
CREATE UNIQUE INDEX "SiteSetting_key_key" ON "SiteSetting"("key");
CREATE INDEX "AuditLog_entity_entityId_createdAt_idx" ON "AuditLog"("entity", "entityId", "createdAt" DESC);
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt" DESC);

ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Game" ADD CONSTRAINT "Game_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "GameCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GameProgress" ADD CONSTRAINT "GameProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GameProgress" ADD CONSTRAINT "GameProgress_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Score" ADD CONSTRAINT "Score_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Score" ADD CONSTRAINT "Score_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "XpTransaction" ADD CONSTRAINT "XpTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MissionProgress" ADD CONSTRAINT "MissionProgress_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MissionProgress" ADD CONSTRAINT "MissionProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdventureChapter" ADD CONSTRAINT "AdventureChapter_adventureId_fkey" FOREIGN KEY ("adventureId") REFERENCES "Adventure"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdventureGame" ADD CONSTRAINT "AdventureGame_adventureId_fkey" FOREIGN KEY ("adventureId") REFERENCES "Adventure"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdventureGame" ADD CONSTRAINT "AdventureGame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
