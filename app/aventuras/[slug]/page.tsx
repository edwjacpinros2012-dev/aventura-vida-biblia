import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckIcon } from "@/components/icons";
import { GameCover } from "@/components/game-cover";
import { adventures, games, getAdventureBySlug } from "@/lib/content";

export function generateStaticParams() { return adventures.map((adventure) => ({ slug: adventure.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const adventure = getAdventureBySlug(slug);
  return { title: adventure ? `${adventure.title} | Aventura Vida` : "Aventura no encontrada | Aventura Vida" };
}

export default async function AdventureDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const adventure = getAdventureBySlug(slug);
  if (!adventure) notFound();
  const chapterNames = ["La señal en el mapa", "El puente de la confianza", "La luz compartida", "Una decisión valiente", "El camino a casa", "El faro despierta"].slice(0, adventure.chapters);
  const relatedGames = games.slice(0, 3);
  return (
    <><section className="bg-[#f1eeff]"><div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-[1fr_.9fr] lg:items-center lg:px-8"><div><Link href="/aventuras" className="text-sm font-extrabold text-violet hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/25">← Volver a aventuras</Link><p className="mt-6 text-xs font-black uppercase tracking-[.2em] text-violet">{adventure.badge}</p><h1 className="mt-3 font-display text-5xl font-black tracking-tight text-ink sm:text-6xl">{adventure.title}</h1><p className="mt-4 max-w-xl text-base leading-7 text-ink/70">{adventure.summary} Esta ficha muestra cómo se organizarán los mapas, capítulos, objetivos y juegos asociados.</p><div className="mt-6 flex flex-wrap gap-2 text-sm font-bold"><span className="rounded-xl bg-white px-3 py-2">{adventure.chapters} capítulos</span><span className="rounded-xl bg-white px-3 py-2">3 juegos relacionados</span>{adventure.progress !== undefined && <span className="rounded-xl bg-violet px-3 py-2 text-white">{adventure.progress}% explorado</span>}</div></div><GameCover theme={adventure.coverTheme} large className="h-72 rounded-[2rem] shadow-lift sm:h-[370px]" /></div></section><section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8"><div><h2 className="font-display text-3xl font-black text-ink">Capítulos del mapa</h2><div className="mt-5 grid gap-3">{chapterNames.map((chapter, index) => <article key={chapter} className="flex items-center gap-4 rounded-2xl border border-ink/5 bg-white p-4 shadow-card"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl font-display font-black ${index === 0 ? "bg-leaf text-white" : "bg-sky text-ink/65"}`}>{index === 0 ? <CheckIcon className="h-5 w-5" /> : index + 1}</span><div><h3 className="font-bold text-ink">{chapter}</h3><p className="mt-0.5 text-xs font-semibold text-ink/55">{index === 0 ? "Muestra de capítulo disponible en Fase 6" : "Pendiente de desbloquear"}</p></div></article>)}</div></div><aside className="rounded-[1.7rem] bg-ink p-6 text-white"><p className="text-xs font-black uppercase tracking-[.18em] text-sun">Juegos de esta aventura</p><div className="mt-4 grid gap-3">{relatedGames.map((game) => <Link key={game.id} href={`/juegos/${game.slug}`} className="rounded-xl bg-white/10 p-4 transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun"><p className="font-display font-black">{game.name}</p><p className="mt-1 text-xs font-semibold text-white/60">+{game.xp} XP posibles</p></Link>)}</div><p className="mt-5 text-xs leading-5 text-white/55">El guardado de capítulos requiere una cuenta de jugador, previsto para Fase 2.</p><Link href="/juegos" className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-sun hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun">Explorar juegos <ArrowRight className="h-4 w-4" /></Link></aside></section></>
  );
}
