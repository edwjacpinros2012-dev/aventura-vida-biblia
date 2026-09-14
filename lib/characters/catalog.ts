/**
 * Fuente única para el arte oficial de personajes de Proyecto Vida Kids.
 *
 * No se incluyen personajes ni imágenes de sustitución: el catálogo queda
 * vacío hasta recibir el material autorizado. Los avatares emoji existentes
 * se conservan como compatibilidad para cuentas y datos de demostración.
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
 * Añadir aquí únicamente personajes autorizados por Proyecto Vida Kids.
 * Consulte public/assets/proyecto-vida-kids/characters/README.md para la
 * convención de archivos. No agregar entradas sin material oficial.
 */
export const officialCharacters: readonly OfficialCharacter[] = [];

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
