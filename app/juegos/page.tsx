import type { Metadata } from "next";
import { GamesCatalog } from "@/components/games-catalog";
import { games } from "@/lib/content";

export const metadata: Metadata = { title: "Juegos | Aventura Vida", description: "Explora los juegos y retos de Aventura Vida." };

export default async function GamesPage({ searchParams }: { searchParams: Promise<{ category?: string; filter?: string }> }) {
  const params = await searchParams;
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pt-16 lg:px-8">
      <div className="max-w-2xl"><p className="text-xs font-black uppercase tracking-[.2em] text-violet">Elige tu próximo reto</p><h1 className="mt-3 font-display text-5xl font-black tracking-tight text-ink sm:text-6xl">Juegos para descubrir</h1><p className="mt-4 text-base leading-7 text-ink/65">Cada juego abre una aventura diferente. Elige una ruta según lo que te gusta, tu edad o el nivel de desafío.</p></div>
      <div className="mt-9"><GamesCatalog initialGames={games} initialCategory={params.category} initialFilter={params.filter} /></div>
      <p className="mt-10 rounded-2xl bg-sky px-5 py-4 text-sm leading-6 text-ink/70"><span className="font-extrabold text-ink">12 juegos listos para jugar:</span> completa retos para guardar puntos, XP, racha, logros, juegos terminados y versículos aprendidos en este navegador. Las cuentas y la validación de servidor llegarán en una fase posterior.</p>
    </section>
  );
}
