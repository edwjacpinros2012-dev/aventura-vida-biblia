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
  "word-search": { key: "word-search", version: "1.0.0", supportedEvents: ["score", "progress", "finish"], trusted: true },
  coloring: { key: "coloring", version: "1.0.0", supportedEvents: ["progress", "finish"], trusted: true },
  quiz: { key: "quiz", version: "1.0.0", supportedEvents: ["score", "objective", "progress", "finish"], trusted: true },
  story: { key: "story", version: "1.0.0", supportedEvents: ["objective", "progress", "finish"], trusted: true },
  memory: { key: "memory", version: "1.0.0", supportedEvents: ["score", "objective", "progress", "finish"], trusted: true },
  iq: { key: "iq", version: "1.0.0", supportedEvents: ["score", "objective", "progress", "finish"], trusted: true },
  verse: { key: "verse", version: "1.0.0", supportedEvents: ["objective", "progress", "finish"], trusted: true },
  puzzle: { key: "puzzle", version: "1.0.0", supportedEvents: ["score", "objective", "progress", "finish"], trusted: true },
};
