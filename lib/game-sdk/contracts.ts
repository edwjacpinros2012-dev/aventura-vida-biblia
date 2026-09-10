/**
 * Contratos previstos para la Fase 4. No son una API de cliente todavía.
 * La implementación vivirá detrás de rutas autenticadas del servidor.
 */
export type GameEvent =
  | { type: "objective"; objectiveId: string }
  | { type: "progress"; data: Record<string, unknown> }
  | { type: "finish"; result: Record<string, unknown> };

export type VerifiedGameResult = {
  sessionId: string;
  accepted: boolean;
  pointsAwarded: number;
  xpAwarded: number;
  unlockedAchievementIds: string[];
};
