/**
 * Fuente única para el arte oficial de personajes de Proyecto Vida Kids.
 *
 * Las entradas se añaden únicamente cuando Proyecto Vida Kids entrega el
 * material autorizado. Los avatares emoji existentes se conservan como
 * compatibilidad para cuentas y datos de demostración.
 */

export const OFFICIAL_CHARACTER_ASSET_DIRECTORY = "/assets/proyecto-vida-kids/characters";

export type OfficialCharacterStatus = "awaiting-art" | "active" | "hidden";

export type OfficialCharacter = {
  /** Identificador estable: también será el valor de Profile.avatarKey. */
  id: string;
  name: string;
  description: string;
  /** Ilustración completa para fichas, colección o aventuras. */
  asset: string;
  /** Recorte cuadrado para perfil, ranking, salas y PvP. */
  avatar: string;
  /** Imagen compacta para tienda e inventario. */
  thumbnail: string;
  status: OfficialCharacterStatus;
  metadata: {
    version: 1;
    tags?: string[];
  };
};

/**
 * Estas seis variantes proceden de las láminas oficiales entregadas por
 * Proyecto Vida Kids. No se asignan nombres de personajes: las claves y
 * etiquetas descriptivas son neutrales hasta recibir nombres oficiales.
 */
export const officialCharacters: readonly OfficialCharacter[] = [
  {
    id: "vida-kids-01-rosa-morado",
    name: "Avatar oficial · rosa y morado",
    description: "Variante oficial con camiseta rosada y falda morada.",
    asset: `${OFFICIAL_CHARACTER_ASSET_DIRECTORY}/vida-kids-01-rosa-morado/full.png`,
    avatar: `${OFFICIAL_CHARACTER_ASSET_DIRECTORY}/vida-kids-01-rosa-morado/avatar.png`,
    thumbnail: `${OFFICIAL_CHARACTER_ASSET_DIRECTORY}/vida-kids-01-rosa-morado/thumbnail.png`,
    status: "active",
    metadata: { version: 1, tags: ["oficial", "rosa", "morado"] },
  },
  {
    id: "vida-kids-02-blanco",
    name: "Avatar oficial · camiseta blanca",
    description: "Variante oficial con camiseta blanca y pantalón corto.",
    asset: `${OFFICIAL_CHARACTER_ASSET_DIRECTORY}/vida-kids-02-blanco/full.png`,
    avatar: `${OFFICIAL_CHARACTER_ASSET_DIRECTORY}/vida-kids-02-blanco/avatar.png`,
    thumbnail: `${OFFICIAL_CHARACTER_ASSET_DIRECTORY}/vida-kids-02-blanco/thumbnail.png`,
    status: "active",
    metadata: { version: 1, tags: ["oficial", "blanco"] },
  },
  {
    id: "vida-kids-03-azul",
    name: "Avatar oficial · sudadera azul",
    description: "Variante oficial con sudadera azul.",
    asset: `${OFFICIAL_CHARACTER_ASSET_DIRECTORY}/vida-kids-03-azul/full.png`,
    avatar: `${OFFICIAL_CHARACTER_ASSET_DIRECTORY}/vida-kids-03-azul/avatar.png`,
    thumbnail: `${OFFICIAL_CHARACTER_ASSET_DIRECTORY}/vida-kids-03-azul/thumbnail.png`,
    status: "active",
    metadata: { version: 1, tags: ["oficial", "azul"] },
  },
  {
    id: "vida-kids-04-beige",
    name: "Avatar oficial · camiseta beige",
    description: "Variante oficial con camiseta beige.",
    asset: `${OFFICIAL_CHARACTER_ASSET_DIRECTORY}/vida-kids-04-beige/full.png`,
    avatar: `${OFFICIAL_CHARACTER_ASSET_DIRECTORY}/vida-kids-04-beige/avatar.png`,
    thumbnail: `${OFFICIAL_CHARACTER_ASSET_DIRECTORY}/vida-kids-04-beige/thumbnail.png`,
    status: "active",
    metadata: { version: 1, tags: ["oficial", "beige"] },
  },
  {
    id: "vida-kids-05-verde",
    name: "Avatar oficial · camiseta verde",
    description: "Variante oficial con camiseta verde.",
    asset: `${OFFICIAL_CHARACTER_ASSET_DIRECTORY}/vida-kids-05-verde/full.png`,
    avatar: `${OFFICIAL_CHARACTER_ASSET_DIRECTORY}/vida-kids-05-verde/avatar.png`,
    thumbnail: `${OFFICIAL_CHARACTER_ASSET_DIRECTORY}/vida-kids-05-verde/thumbnail.png`,
    status: "active",
    metadata: { version: 1, tags: ["oficial", "verde"] },
  },
  {
    id: "vida-kids-06-rojo",
    name: "Avatar oficial · camiseta roja",
    description: "Variante oficial con camiseta roja.",
    asset: `${OFFICIAL_CHARACTER_ASSET_DIRECTORY}/vida-kids-06-rojo/full.png`,
    avatar: `${OFFICIAL_CHARACTER_ASSET_DIRECTORY}/vida-kids-06-rojo/avatar.png`,
    thumbnail: `${OFFICIAL_CHARACTER_ASSET_DIRECTORY}/vida-kids-06-rojo/thumbnail.png`,
    status: "active",
    metadata: { version: 1, tags: ["oficial", "rojo"] },
  },
];

export type LegacyAvatarOption = {
  id: string;
  label: string;
  symbol: string;
};

// Avatares ya existentes: no representan personajes oficiales.
export const legacyAvatarOptions: readonly LegacyAvatarOption[] = [
  { id: "fox", label: "Zorro explorador", symbol: "🦊" },
  { id: "spark", label: "Destello", symbol: "✦" },
  { id: "dove", label: "Paloma", symbol: "🕊️" },
  { id: "leaf", label: "Hoja", symbol: "🌿" },
];

export function officialCharacterForAvatar(avatarKey: string) {
  return officialCharacters.find((character) => character.id === avatarKey && character.status === "active");
}

/** Opciones de registro: los personajes oficiales activos aparecerán aquí. */
export function selectableAvatarOptions() {
  return [
    ...legacyAvatarOptions,
    ...officialCharacters
      .filter((character) => character.status === "active")
      .map((character) => ({ id: character.id, label: character.name, symbol: "✦" })),
  ];
}

export function isSelectableAvatarKey(avatarKey: string) {
  return isCustomAvatarKey(avatarKey) || selectableAvatarOptions().some((avatar) => avatar.id === avatarKey);
}

export function avatarFallbackFor(avatarKey: string) {
  if (isCustomAvatarKey(avatarKey)) return "🧑";
  return legacyAvatarOptions.find((avatar) => avatar.id === avatarKey)?.symbol
    ?? (avatarKey.length <= 8 ? avatarKey : "✦");
}
import { isCustomAvatarKey } from "@/lib/characters/custom-avatar";
