import Image from "next/image";
import type { ReactNode } from "react";
import { officialCharacterForAvatar } from "@/lib/characters/catalog";
import { customAvatarConfigFromKey } from "@/lib/characters/custom-avatar";
import { CustomCharacterAvatar } from "@/components/custom-character-avatar";

type CharacterAvatarProps = {
  avatarKey: string;
  fallback: ReactNode;
  alt?: string;
  className?: string;
  imageSizes?: string;
  /** La versión completa se usa para el personaje que el jugador controla. */
  variant?: "avatar" | "full";
};

/**
 * Muestra arte oficial únicamente cuando existe una entrada activa autorizada.
 * Mientras el catálogo oficial esté vacío, conserva el avatar existente.
 */
export function CharacterAvatar({ avatarKey, fallback, alt = "Avatar", className = "", imageSizes = "96px", variant = "avatar" }: CharacterAvatarProps) {
  const character = officialCharacterForAvatar(avatarKey);
  const customAvatar = customAvatarConfigFromKey(avatarKey);
  if (customAvatar) return <CustomCharacterAvatar config={customAvatar} alt={alt} className={className} variant={variant} />;
  if (!character) return <span className={className} aria-hidden="true">{fallback}</span>;

  return <span className={`relative overflow-hidden ${className}`}>
    <Image src={variant === "full" ? character.asset : character.avatar} alt={alt || character.name} fill sizes={imageSizes} className={variant === "full" ? "object-contain" : "object-cover"} />
  </span>;
}
