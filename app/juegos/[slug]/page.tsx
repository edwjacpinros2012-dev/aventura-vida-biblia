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
    <>
      <section className="bg-[#edfaff]"><div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-[1fr_.9fr] lg:items-center lg:px-8"><div><Link href="/juegos" className="text-sm font-extrabold text-violet outline-none hover:underline focus-visible:ring-4 focus-visible:ring-violet/25">← Volver al catálogo</Link><div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full bg-white px-3 py-1.5 text-xs font-black uppercase tracking-wide text-ink/70">{game.category}</span><span className="rounded-full bg-white px-3 py-1.5 text-xs font-black uppercase tracking-wide text-ink/70">{game.difficulty}</span></div><h1 className="mt-4 font-display text-5xl font-black tracking-tight text-ink sm:text-6xl">{game.name}</h1><p className="mt-3 font-display text-xl font-black text-violet">{game.tagline}</p><p className="mt-5 max-w-xl text-base leading-7 text-ink/70">{game.longDescription}</p><div className="mt-6 flex flex-wrap gap-3 text-sm font-bold"><span className="rounded-xl bg-white px-3 py-2">{game.suggestedAge}</span><span className="rounded-xl bg-white px-3 py-2">~{game.playMinutes} min</span><span className="rounded-xl bg-sun/35 px-3 py-2">Hasta {game.maxPoints} puntos</span><span className="rounded-xl bg-leaf/15 px-3 py-2 text-[#147558]">+{game.xp} XP</span></div></div><GameCover theme={game.coverTheme} large className="h-72 rounded-[2rem] shadow-lift sm:h-[370px]" /></div></section>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:px-8"><div><h2 className="font-display text-3xl font-black text-ink">Tu objetivo</h2><div className="mt-5 grid gap-3">{game.objectives.map((objective, index) => <div key={objective} className="flex items-center gap-4 rounded-2xl border border-ink/5 bg-white p-4 shadow-card"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet text-sm font-black text-white">{index + 1}</span><p className="font-bold text-ink">{objective}</p><CheckIcon className="ml-auto h-5 w-5 text-leaf" /></div>)}</div><div className="mt-7 rounded-[1.5rem] bg-[#fff5cf] p-5"><p className="text-xs font-black uppercase tracking-[.18em] text-[#a66d00]">Al terminar descubrirás</p><p className="mt-2 font-display text-xl font-black leading-7 text-ink">“{game.lesson}”</p></div></div><aside className="h-fit rounded-[1.7rem] bg-ink p-6 text-white"><p className="text-xs font-black uppercase tracking-[.18em] text-sun">Estado del juego</p>{game.isPlayable ? <><h2 className="mt-3 font-display text-2xl font-black">¡Listo para jugar!</h2><p className="mt-3 text-sm leading-6 text-white/70">Completa el reto para sumar puntos, XP, progreso y logros en este navegador.</p><div className="mt-5 rounded-xl bg-white/10 p-4 text-sm font-bold text-white/80">Las recompensas de esta demostración se guardan localmente hasta que lleguen las cuentas de jugador.</div><Link href={`/juegos/${game.slug}/jugar`} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sun px-4 py-3 text-sm font-extrabold text-ink transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun">Jugar ahora <ArrowRight className="h-4 w-4" /></Link></> : <><h2 className="mt-3 font-display text-2xl font-black">Próximamente jugable</h2><p className="mt-3 text-sm leading-6 text-white/70">Esta ficha conserva un contenido planificado para una próxima aventura. Se publicará cuando su módulo esté listo.</p><div className="mt-5 rounded-xl bg-white/10 p-4 text-sm font-bold text-white/80">La plataforma no simula puntos ni progreso para contenido que aún no está disponible.</div><Link href="/juegos" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-ink transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun">Explorar otros juegos <ArrowRight className="h-4 w-4" /></Link></>}</aside></section>
      {related.length > 0 && <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8"><h2 className="font-display text-3xl font-black text-ink">También puede gustarte</h2><div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{related.map((item) => <GameCard key={item.id} game={item} />)}</div></section>}
    </>
  );
}
