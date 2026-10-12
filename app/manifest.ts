import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aventura Vida Biblia",
    short_name: "Aventura Vida",
    description: "Juegos, aventuras y valores para Proyecto Vida Kids.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#061923",
    theme_color: "#061923",
    orientation: "portrait-primary",
    categories: ["education", "games", "family"],
    icons: [{ src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" }],
  };
}
