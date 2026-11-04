import { GeneratedContentStatus, ScheduledJobStatus } from "@prisma/client";
import { z } from "zod";
import { aiProviderStatus } from "@/lib/content-automation/ai-provider";
import { prisma } from "@/lib/prisma";

const SETTING_KEY = "central-brain-automation";

const automationConfigSchema = z.object({
  enabled: z.boolean(),
  /** La publicación automática de IA queda desactivada de forma intencional. */
  autoPublishAi: z.literal(false),
  maxProposalsPerDay: z.literal(1),
});

export type CentralBrainAutomationConfig = z.infer<typeof automationConfigSchema>;

const defaultConfig: CentralBrainAutomationConfig = {
  enabled: true,
  autoPublishAi: false,
  maxProposalsPerDay: 1,
};

export async function centralBrainAutomationConfig() {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: SETTING_KEY }, select: { value: true } });
    return automationConfigSchema.safeParse(setting?.value).data ?? defaultConfig;
  } catch {
    return defaultConfig;
  }
}

export async function setCentralBrainAutomationEnabled(enabled: boolean) {
  const value = { ...defaultConfig, enabled } satisfies CentralBrainAutomationConfig;
  return prisma.siteSetting.upsert({
    where: { key: SETTING_KEY },
    create: { key: SETTING_KEY, value },
    update: { value },
    select: { value: true, updatedAt: true },
  });
}

/** Panel privado: no devuelve credenciales, prompts ni información de menores. */
export async function centralBrainAdminStatus() {
  const config = await centralBrainAutomationConfig();
  const provider = aiProviderStatus();
  const [latestRun, draftCount, publishedCount, failedCount] = await Promise.all([
    prisma.contentGenerationRun.findFirst({
      where: { jobKey: "daily-bible-ai-proposal" },
      select: { dateKey: true, status: true, attempt: true, error: true, startedAt: true, finishedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.generatedContent.count({ where: { source: "AI", status: GeneratedContentStatus.DRAFT } }),
    prisma.generatedContent.count({ where: { source: "AI", status: GeneratedContentStatus.PUBLISHED } }),
    prisma.contentGenerationRun.count({ where: { jobKey: "daily-bible-ai-proposal", status: ScheduledJobStatus.FAILED } }),
  ]);
  return {
    config,
    provider: provider.configured ? { configured: true, provider: provider.provider, model: provider.model } : provider,
    latestRun,
    content: { drafts: draftCount, published: publishedCount, failedRuns: failedCount },
    schedule: "Vercel Cron: 0 10 * * * (requiere configuración de producción)",
  };
}
