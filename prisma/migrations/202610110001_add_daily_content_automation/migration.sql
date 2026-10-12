-- Contenido diario, bitácora de ejecución e idempotencia de sincronización.
-- Esta migración no modifica ni reinicia datos de jugadores existentes.

CREATE TYPE "GeneratedContentSource" AS ENUM ('TEMPLATE', 'AI');
CREATE TYPE "GeneratedContentStatus" AS ENUM ('DRAFT', 'APPROVED', 'PUBLISHED', 'REJECTED', 'FAILED');
CREATE TYPE "ScheduledJobStatus" AS ENUM ('RUNNING', 'SUCCEEDED', 'FAILED', 'SKIPPED');
CREATE TYPE "OfflineSyncOperationStatus" AS ENUM ('APPLIED', 'REJECTED');

CREATE TABLE "ContentGenerationRun" (
  "id" TEXT NOT NULL,
  "jobKey" TEXT NOT NULL,
  "dateKey" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "source" "GeneratedContentSource" NOT NULL,
  "status" "ScheduledJobStatus" NOT NULL DEFAULT 'RUNNING',
  "attempt" INTEGER NOT NULL DEFAULT 1,
  "output" JSONB,
  "error" TEXT,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ContentGenerationRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GeneratedContent" (
  "id" TEXT NOT NULL,
  "contentKey" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "dateKey" TEXT,
  "version" INTEGER NOT NULL DEFAULT 1,
  "source" "GeneratedContentSource" NOT NULL,
  "status" "GeneratedContentStatus" NOT NULL DEFAULT 'DRAFT',
  "payload" JSONB NOT NULL,
  "validation" JSONB,
  "reviewNotes" TEXT,
  "reviewerId" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "publishedAt" TIMESTAMP(3),
  "missionId" TEXT,
  "runId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GeneratedContent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OfflineSyncOperation" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "status" "OfflineSyncOperationStatus" NOT NULL DEFAULT 'APPLIED',
  "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OfflineSyncOperation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ContentGenerationRun_jobKey_dateKey_key" ON "ContentGenerationRun"("jobKey", "dateKey");
CREATE INDEX "ContentGenerationRun_status_createdAt_idx" ON "ContentGenerationRun"("status", "createdAt" DESC);
CREATE UNIQUE INDEX "GeneratedContent_contentKey_key" ON "GeneratedContent"("contentKey");
CREATE UNIQUE INDEX "GeneratedContent_kind_dateKey_version_key" ON "GeneratedContent"("kind", "dateKey", "version");
CREATE UNIQUE INDEX "GeneratedContent_missionId_key" ON "GeneratedContent"("missionId");
CREATE INDEX "GeneratedContent_status_publishedAt_idx" ON "GeneratedContent"("status", "publishedAt");
CREATE INDEX "GeneratedContent_dateKey_kind_idx" ON "GeneratedContent"("dateKey", "kind");
CREATE INDEX "OfflineSyncOperation_userId_createdAt_idx" ON "OfflineSyncOperation"("userId", "createdAt" DESC);

ALTER TABLE "GeneratedContent" ADD CONSTRAINT "GeneratedContent_missionId_fkey"
  FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GeneratedContent" ADD CONSTRAINT "GeneratedContent_runId_fkey"
  FOREIGN KEY ("runId") REFERENCES "ContentGenerationRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OfflineSyncOperation" ADD CONSTRAINT "OfflineSyncOperation_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
