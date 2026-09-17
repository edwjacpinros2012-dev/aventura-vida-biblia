import Image from "next/image";
import type { ReactNode } from "react";
import { officialCharacterForAvatar } from "@/lib/characters/catalog";

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
  if (!character) return <span className={className} aria-hidden="true">{fallback}</span>;

  return <span className={`relative overflow-hidden ${className}`}>
    <Image src={variant === "full" ? character.asset : character.avatar} alt={alt || character.name} fill sizes={imageSizes} className={variant === "full" ? "object-contain" : "object-cover"} />
  </span>;
}
