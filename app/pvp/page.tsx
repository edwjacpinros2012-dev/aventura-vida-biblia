import type { Metadata } from "next";
import { PvpHub } from "@/components/pvp-hub";

export const metadata: Metadata = { title: "PvP | Aventura Vida Biblia", description: "Duelos de preguntas con resultados validados por el servidor." };

export default function PvpPage() { return <PvpHub />; }
