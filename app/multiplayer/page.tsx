import type { Metadata } from "next";
import { MultiplayerHub } from "@/components/multiplayer/multiplayer-hub";

export const metadata: Metadata = { title: "Multijugador | Aventura Vida Biblia", description: "Salas cooperativas seguras para el Laberinto Bíblico." };

export default function MultiplayerPage() { return <MultiplayerHub />; }
