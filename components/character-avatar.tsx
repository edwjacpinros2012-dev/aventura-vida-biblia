import Image from "next/image";
import type { ReactNode } from "react";
import { officialCharacterForAvatar } from "@/lib/characters/catalog";

type CharacterAvatarProps = {
  avatarKey: string;
  fallback: ReactNode;
  alt?: string;
  className?: string;
  imageSizes?: string;
};

/**
 * Muestra arte oficial únicamente cuando existe una entrada activa autorizada.
 * Mientras el catálogo oficial esté vacío, conserva el avatar existente.
 */
export function CharacterAvatar({ avatarKey, fallback, alt = "Avatar", className = "", imageSizes = "96px" }: CharacterAvatarProps) {
  const character = officialCharacterForAvatar(avatarKey);
  if (!character) return <span className={className} aria-hidden="true">{fallback}</span>;

  return <span className={`relative overflow-hidden ${className}`}>
    <Image src={character.avatar} alt={alt || character.name} fill sizes={imageSizes} className="object-cover" />
  </span>;
}
