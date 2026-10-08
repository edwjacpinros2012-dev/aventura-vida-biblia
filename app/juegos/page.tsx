import type { Metadata } from "next";
import { GamesCatalog } from "@/components/games-catalog";
import { games } from "@/lib/content";

export const metadata: Metadata = { title: "Juegos | Aventura Vida Biblia", description: "Explora los juegos y retos de Aventura Vida Biblia." };

export default async function GamesPage({ searchParams }: { searchParams: Promise<{ category?: string; filter?: string }> }) {
  const params = await searchParams;
  return <section className="av-page"><div className="mx-auto max-w-[1500px] px-4 pb-10 pt-12 sm:px-6 sm:pt-16 lg:px-8"><div className="av-panel overflow-hidden rounded-[2rem] p-6 sm:p-10"><p className="av-kicker text-xs font-black uppercase tracking-[.2em]">Biblioteca de desafíos</p><h1 className="av-title mt-3 font-display text-5xl font-black tracking-tight sm:text-6xl">Juegos bíblicos</h1><p className="mt-4 max-w-2xl text-base leading-7 text-white/70">Elige entre los 13 juegos reales de Aventura Vida. Cada tarjeta mantiene sus objetivos, ruta y recompensas conectadas al progreso del jugador.</p><div className="mt-6 flex flex-wrap gap-2 text-xs font-bold"><span className="av-chip rounded-lg px-3 py-2">13 juegos disponibles</span><span className="av-chip rounded-lg px-3 py-2">XP y puntos al completar</span><span className="av-chip rounded-lg px-3 py-2">Rejugables</span></div></div><div className="mt-8"><GamesCatalog initialGames={games} initialCategory={params.category} initialFilter={params.filter} /></div></div></section>;
}
