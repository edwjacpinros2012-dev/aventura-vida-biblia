/**
 * Configuración compacta y validada del avatar creado por un jugador.
 *
 * La configuración se codifica en `Profile.avatarKey`, por lo que usa la
 * misma fuente de identidad que los avatares oficiales. No contiene URL,
 * texto libre, fotos ni datos personales.
 */
export const CUSTOM_AVATAR_PREFIX = "custom-v1";

export type CustomAvatarConfig = {
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  outfit: string;
  outfitColor: string;
  accessory: string;
};

type CustomAvatarOption = { id: string; label: string; code: string; color?: string };

export const customAvatarOptions: Record<keyof CustomAvatarConfig, readonly CustomAvatarOption[]> = {
  skinTone: [
    { id: "claro", label: "Claro", color: "#f7c9a6", code: "0" },
    { id: "medio", label: "Medio", color: "#d9956b", code: "1" },
    { id: "oliva", label: "Oliva", color: "#b97750", code: "2" },
    { id: "oscuro", label: "Oscuro", color: "#7a4b35", code: "3" },
  ],
  hairStyle: [
    { id: "corto", label: "Corto", code: "0" },
    { id: "ondas", label: "Con ondas", code: "1" },
    { id: "rizado", label: "Rizado", code: "2" },
    { id: "largo", label: "Largo", code: "3" },
  ],
  hairColor: [
    { id: "castano", label: "Castaño", color: "#6e4632", code: "0" },
    { id: "negro", label: "Negro", color: "#25232a", code: "1" },
    { id: "rubio", label: "Rubio", color: "#c9903d", code: "2" },
    { id: "rojo", label: "Cobrizo", color: "#a34e35", code: "3" },
  ],
  eyeColor: [
    { id: "marron", label: "Marrones", color: "#563525", code: "0" },
    { id: "verde", label: "Verdes", color: "#37735b", code: "1" },
    { id: "azul", label: "Azules", color: "#3979b9", code: "2" },
  ],
  outfit: [
    { id: "camiseta", label: "Camiseta", code: "0" },
    { id: "sudadera", label: "Sudadera", code: "1" },
    { id: "vestido", label: "Vestido", code: "2" },
  ],
  outfitColor: [
    { id: "azul", label: "Azul", color: "#3f86d7", code: "0" },
    { id: "verde", label: "Verde", color: "#3e9c6d", code: "1" },
    { id: "rosa", label: "Rosa", color: "#dc6e9a", code: "2" },
    { id: "morado", label: "Morado", color: "#7b5bc6", code: "3" },
    { id: "naranja", label: "Naranja", color: "#df8641", code: "4" },
  ],
  accessory: [
    { id: "ninguno", label: "Sin accesorio", code: "0" },
    { id: "gafas", label: "Gafas", code: "1" },
    { id: "estrella", label: "Estrella de esperanza", code: "2" },
    { id: "paloma", label: "Paloma de paz", code: "3" },
  ],
};

export const defaultCustomAvatar: CustomAvatarConfig = {
  skinTone: "medio",
  hairStyle: "corto",
  hairColor: "castano",
  eyeColor: "marron",
  outfit: "camiseta",
  outfitColor: "azul",
  accessory: "ninguno",
};

const optionKeys = ["skinTone", "hairStyle", "hairColor", "eyeColor", "outfit", "outfitColor", "accessory"] as const;

function optionForId(key: keyof CustomAvatarConfig, id: string) {
  return customAvatarOptions[key].find((option) => option.id === id);
}

function optionForCode(key: keyof CustomAvatarConfig, code: string) {
  return customAvatarOptions[key].find((option) => option.code === code);
}

export function normalizeCustomAvatar(value: Partial<CustomAvatarConfig> | null | undefined): CustomAvatarConfig {
  const next: Record<string, string> = { ...defaultCustomAvatar };
  for (const key of optionKeys) {
    const candidate = value?.[key];
    if (typeof candidate === "string" && optionForId(key, candidate)) {
      next[key] = candidate;
    }
  }
  return next as CustomAvatarConfig;
}

export function customAvatarKeyFor(value: Partial<CustomAvatarConfig> | null | undefined) {
  const config = normalizeCustomAvatar(value);
  const codes = optionKeys.map((key) => optionForId(key, config[key])?.code ?? "0").join("");
  return `${CUSTOM_AVATAR_PREFIX}-${codes}`;
}

export function customAvatarConfigFromKey(avatarKey: string): CustomAvatarConfig | null {
  const prefix = `${CUSTOM_AVATAR_PREFIX}-`;
  if (!avatarKey.startsWith(prefix)) return null;
  const codes = avatarKey.slice(prefix.length);
  if (codes.length !== optionKeys.length) return null;
  const parsed: Record<string, string> = {};
  for (const [index, key] of optionKeys.entries()) {
    const option = optionForCode(key, codes[index]);
    if (!option) return null;
    parsed[key] = option.id;
  }
  return parsed as CustomAvatarConfig;
}

export function isCustomAvatarKey(avatarKey: string) {
  return customAvatarConfigFromKey(avatarKey) !== null;
}

export function customAvatarOption(key: keyof CustomAvatarConfig, id: string) {
  return optionForId(key, id) ?? customAvatarOptions[key][0];
}
