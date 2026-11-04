/**
 * Contrato de seguridad para el cerebro central compartido por web y PWA.
 * El cerebro es editorial: prepara contenido revisable, pero no es una
 * autoridad para identidad, economía, moderación o resultados de partidas.
 */
export const centralBrainPermissions = {
  "catalog.read": "Puede consultar juegos internos publicados y sus capacidades.",
  "missions.read": "Puede recibir el reto bíblico curado que sirve de contexto.",
  "content.draft.create": "Puede proponer contenido versionado que empieza como borrador.",
} as const;

export type CentralBrainPermission = keyof typeof centralBrainPermissions;

export const centralBrainForbiddenOperations = [
  "profiles.read-private",
  "avatars.write",
  "progress.award",
  "economy.award",
  "inventory.write",
  "pvp.resolve",
  "multiplayer.control",
  "moderation.enforce",
  "accounts.authorize",
] as const;

export type CentralBrainForbiddenOperation = (typeof centralBrainForbiddenOperations)[number];

const granted = new Set<CentralBrainPermission>(Object.keys(centralBrainPermissions) as CentralBrainPermission[]);

export function centralBrainCan(permission: CentralBrainPermission) {
  return granted.has(permission);
}

export function assertCentralBrainPermission(permission: CentralBrainPermission) {
  if (!centralBrainCan(permission)) throw new Error(`El cerebro central no tiene permiso para ${permission}.`);
}
