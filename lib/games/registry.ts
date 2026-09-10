/**
 * Registro de módulos internos. En la Fase 1 sólo describe juegos; no ejecuta
 * código del navegador ni concede recompensas. La Fase 6 conectará cada clave
 * con un módulo revisado que use el Game SDK del servidor.
 */
export type InternalGameManifest = {
  key: string;
  version: string;
  supportedEvents: readonly ("score" | "objective" | "progress" | "finish")[];
  trusted: true;
};

export const internalGameRegistry: Record<string, InternalGameManifest> = {
  "memory-bible": { key: "memory-bible", version: "0.1.0", supportedEvents: ["progress", "finish"], trusted: true },
  "quiz-adventure": { key: "quiz-adventure", version: "0.1.0", supportedEvents: ["score", "objective", "progress", "finish"], trusted: true },
  "light-collector": { key: "light-collector", version: "0.1.0", supportedEvents: ["score", "objective", "finish"], trusted: true },
};
