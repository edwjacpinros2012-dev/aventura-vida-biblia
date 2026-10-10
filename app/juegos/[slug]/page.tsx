import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckIcon } from "@/components/icons";
import { GameCard } from "@/components/game-card";
import { GameCover } from "@/components/game-cover";
import { games, getGameBySlug } from "@/lib/content";

export function generateStaticParams() { return games.map((game) => ({ slug: game.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const game = getGameBySlug(slug);
  return { title: game ? `${game.name} | Aventura Vida` : "Juego no encontrado | Aventura Vida" };
}

export default async function GameDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = getGameBySlug(slug);
  if (!game) notFound();
  const related = games.filter((item) => item.slug !== game.slug && (item.category === game.category || item.difficulty === game.difficulty)).slice(0, 3);

  return (
    <main className="av-page"><section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-[1fr_.9fr] lg:items-center lg:px-8"><div><Link href="/juegos" className="text-sm font-extrabold text-[#67e5e0] outline-none hover:underline focus-visible:ring-4 focus-visible:ring-teal-100/25">← Volver al catálogo</Link><div className="mt-5 flex flex-wrap gap-2"><span className="av-chip rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-wide">{game.category}</span><span className="av-chip rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-wide">{game.difficulty}</span></div><h1 className="av-title mt-4 font-display text-5xl font-black tracking-tight sm:text-6xl">{game.name}</h1><p className="mt-3 font-display text-xl font-black text-[#67e5e0]">{game.tagline}</p><p className="mt-5 max-w-xl text-base leading-7 text-white/70">{game.longDescription}</p><div className="mt-6 flex flex-wrap gap-3 text-sm font-bold"><span className="av-chip rounded-xl px-3 py-2">{game.suggestedAge}</span><span className="av-chip rounded-xl px-3 py-2">~{game.playMinutes} min</span><span className="rounded-xl bg-[#f5bd4d]/20 px-3 py-2 text-[#f5dc9a]">Hasta {game.maxPoints} puntos</span><span className="rounded-xl bg-[#74e2b0]/15 px-3 py-2 text-[#74e2b0]">+{game.xp} XP</span></div></div><GameCover theme={game.coverTheme} large className="h-72 rounded-[2rem] shadow-lift sm:h-[370px]" /></section>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:px-8"><div><h2 className="av-title font-display text-3xl font-black">Tu objetivo</h2><div className="mt-5 grid gap-3">{game.objectives.map((objective, index) => <div key={objective} className="av-card flex items-center gap-4 rounded-2xl p-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#0d8795] text-sm font-black text-white">{index + 1}</span><p className="font-bold text-white/90">{objective}</p><CheckIcon className="ml-auto h-5 w-5 text-[#74e2b0]" /></div>)}</div><div className="av-panel-soft mt-7 rounded-[1.5rem] p-5"><p className="text-xs font-black uppercase tracking-[.18em] text-[#f5bd4d]">Al terminar descubrirás</p><p className="mt-2 font-display text-xl font-black leading-7 text-[#f5e5b9]">“{game.lesson}”</p></div></div><aside className="av-panel h-fit rounded-[1.7rem] p-6 text-white"><p className="text-xs font-black uppercase tracking-[.18em] text-[#f5bd4d]">Estado del juego</p>{game.isPlayable ? <><h2 className="mt-3 font-display text-2xl font-black text-[#f5e5b9]">¡Listo para jugar!</h2><p className="mt-3 text-sm leading-6 text-white/70">Completa el reto para sumar puntos, XP, progreso y logros en este dispositivo.</p><div className="mt-5 rounded-xl bg-white/10 p-4 text-sm font-bold text-white/80">La partida reutiliza el mismo perfil y avatar global que ves en toda la plataforma.</div><Link href={`/juegos/${game.slug}/jugar`} className="av-gold-button mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold outline-none focus-visible:ring-4 focus-visible:ring-[#f5bd4d]/30">Jugar ahora <ArrowRight className="h-4 w-4" /></Link></> : <><h2 className="mt-3 font-display text-2xl font-black">Contenido en preparación</h2><p className="mt-3 text-sm leading-6 text-white/70">Esta ficha conserva contenido editorial que todavía no puede iniciarse.</p><Link href="/juegos" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-ink transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun">Explorar otros juegos <ArrowRight className="h-4 w-4" /></Link></>}</aside></section>
      {related.length > 0 && <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8"><h2 className="av-title font-display text-3xl font-black">También puede gustarte</h2><div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{related.map((item) => <GameCard key={item.id} game={item} />)}</div></section>}
    </main>
  );
}
