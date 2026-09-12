/**
 * Registro de módulos internos revisados. Los adaptadores de interfaz
 * viven en components/games y usan el shell común de progreso local. La
 * siguiente fase sustituirá la concesión local por eventos validados del SDK.
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
  "light-collector": { key: "light-collector", version: "1.0.0", supportedEvents: ["score", "objective", "progress", "finish"], trusted: true },
  "garden-helpers": { key: "garden-helpers", version: "1.0.0", supportedEvents: ["objective", "progress", "finish"], trusted: true },
  "river-path": { key: "river-path", version: "1.0.0", supportedEvents: ["objective", "progress", "finish"], trusted: true },
  "star-map": { key: "star-map", version: "1.0.0", supportedEvents: ["score", "objective", "progress", "finish"], trusted: true },
};
