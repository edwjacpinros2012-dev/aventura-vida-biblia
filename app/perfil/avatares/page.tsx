import type { Metadata } from "next";
import { AvatarCatalog } from "@/components/avatar-catalog";

export const metadata: Metadata = {
  title: "Avatares | Aventura Vida",
  description: "Elige el avatar global de tu perfil de aventura.",
};

export default function AvatarCatalogPage() {
  return <AvatarCatalog />;
}
