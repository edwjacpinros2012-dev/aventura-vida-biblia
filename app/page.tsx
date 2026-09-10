import Link from "next/link";
import { ArrowRight, CheckIcon, Sparkle } from "@/components/icons";
import { GameCard } from "@/components/game-card";
import { GameCover } from "@/components/game-cover";
import { SectionHeading } from "@/components/section-heading";
import { adventures, categories, games, latestNews, missionOfTheDay } from "@/lib/content";

export default function HomePage() {
  const newGames = games.filter((game) => game.isNew).slice(0, 3);
  const popularGames = games.filter((game) => game.isPopular).slice(0, 3);
  const featuredAdventure = adventures[0];

  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#edfaff]">
        <div className="hero-grid absolute inset-0 opacity-70" aria-hidden="true" />
        <div className="absolute -left-28 top-8 h-72 w-72 rounded-full bg-[#fff1a2]/70 blur-3xl" aria-hidden="true" />
        <div className="absolute -right-20 bottom-[-6rem] h-80 w-80 rounded-full bg-[#cabfff]/70 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-12 sm:px-6 md:pb-20 md:pt-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-violet/15 bg-white/80 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-violet shadow-sm"><Sparkle className="h-3.5 w-3.5" /> Proyecto Vida Kids</p>
            <h1 className="mt-5 font-display text-5xl font-black leading-[.96] tracking-[-.045em] text-ink sm:text-6xl lg:text-7xl">TU AVENTURA<br /><span className="text-violet">COMIENZA AQUÍ</span></h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-ink/70 sm:text-lg">Juegos, retos y aventuras para descubrir grandes principios mientras te diviertes en familia.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/juegos" className="inline-flex items-center gap-2 rounded-2xl bg-ink px-6 py-3.5 text-sm font-extrabold text-white shadow-card transition-all hover:-translate-y-0.5 hover:bg-violet focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/25">Empezar a jugar <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/aventuras" className="inline-flex items-center gap-2 rounded-2xl border border-ink/10 bg-white/85 px-6 py-3.5 text-sm font-extrabold text-ink transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/25">Explorar el mundo</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold text-ink/70">
              <span className="inline-flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-leaf text-white"><CheckIcon className="h-4 w-4" /></span> Aventuras seguras</span>
              <span className="inline-flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-sun text-ink"><CheckIcon className="h-4 w-4" /></span> Para jugar en familia</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-lg py-6 lg:py-0">
            <div className="absolute inset-x-7 bottom-0 top-5 rotate-3 rounded-[2.5rem] bg-violet/15" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-[2.5rem] border-[7px] border-white bg-white p-3 shadow-lift">
              <GameCover theme="sunset" large className="h-[280px] rounded-[1.9rem] sm:h-[340px]" />
              <div className="absolute bottom-7 left-7 right-7 rounded-2xl bg-white/92 p-4 shadow-card backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div><p className="text-[11px] font-black uppercase tracking-[.16em] text-violet">Aventura destacada</p><p className="mt-1 font-display text-xl font-black text-ink">El valle de los destellos</p></div>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sun text-lg">✦</span>
                </div>
              </div>
            </div>
            <div className="absolute -right-2 top-4 rotate-[9deg] rounded-2xl border-4 border-white bg-leaf px-3 py-2 text-sm font-black text-white shadow-card sm:-right-6">¡Nueva ruta!</div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-ink p-5 text-white shadow-lift sm:p-7">
          <div className="grid gap-5 md:grid-cols-[auto_1fr_auto] md:items-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-sun text-3xl text-ink">☀</div>
            <div><p className="text-xs font-black uppercase tracking-[.18em] text-sun">Misión de hoy</p><h2 className="mt-1 font-display text-2xl font-black">{missionOfTheDay.title}</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-white/70">{missionOfTheDay.description}</p></div>
            <Link href="/mision" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-ink transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sun">Ver misión <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-5 flex flex-wrap gap-3 border-t border-white/10 pt-4 text-xs font-bold text-white/75"><span className="rounded-lg bg-white/10 px-3 py-1.5">Objetivo: {missionOfTheDay.objective}</span><span className="rounded-lg bg-white/10 px-3 py-1.5">+{missionOfTheDay.rewardXp} XP</span><span className="rounded-lg bg-white/10 px-3 py-1.5">+{missionOfTheDay.rewardPoints} puntos</span></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Recién llegó" title="Juegos nuevos" description="Encuentra una ruta, elige un reto y empieza a sumar historias." href="/juegos?filter=nuevos" />
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{newGames.map((game) => <GameCard key={game.id} game={game} />)}</div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-[2rem] bg-[#f1eeff] p-6 sm:p-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:p-10">
          <div><p className="text-xs font-black uppercase tracking-[.2em] text-violet">Continúa la historia</p><h2 className="mt-3 font-display text-4xl font-black tracking-tight text-ink">{featuredAdventure.title}</h2><p className="mt-4 max-w-md leading-7 text-ink/65">{featuredAdventure.summary} Supera retos, abre capítulos y deja el valle un poquito más brillante.</p><div className="mt-6 h-3 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-violet" style={{ width: `${featuredAdventure.progress}%` }} /></div><div className="mt-2 flex justify-between text-xs font-bold text-ink/55"><span>Capítulo 2 de {featuredAdventure.chapters}</span><span>{featuredAdventure.progress}% explorado</span></div><Link href={`/aventuras/${featuredAdventure.slug}`} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-violet px-5 py-3 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/25">Continuar aventura <ArrowRight className="h-4 w-4" /></Link></div>
          <GameCover theme="sunset" large className="h-64 rounded-[1.6rem] sm:h-80" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Favoritos de la comunidad" title="Más jugados" description="Retos que muchas familias ya están explorando." href="/juegos?filter=populares" />
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{popularGames.map((game) => <GameCard key={game.id} game={game} />)}</div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Un mundo por descubrir" title="Explora el mundo" description="Cada zona propone una forma distinta de jugar, pensar y avanzar." href="/juegos" action="Explorar juegos" />
        <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-5">
          {categories.map((category) => <Link key={category.name} href={`/juegos?category=${encodeURIComponent(category.name)}`} className="group rounded-2xl border border-ink/5 bg-white p-4 text-center shadow-card transition-all hover:-translate-y-1 hover:shadow-lift focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/25"><span className={`mx-auto grid h-12 w-12 place-items-center rounded-2xl ${category.color} text-xl ${category.name === "Preguntas" ? "text-white" : "text-ink"}`}>{category.icon}</span><h3 className="mt-3 font-display text-base font-black text-ink">{category.name}</h3><p className="mt-1 text-xs leading-4 text-ink/60">{category.description}</p></Link>)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
          <div className="rounded-[2rem] bg-[#e9fbf5] p-6 sm:p-8"><p className="text-xs font-black uppercase tracking-[.2em] text-leaf">Tus avances</p><div className="mt-4 flex flex-wrap items-center gap-5"><div className="grid h-20 w-20 place-items-center rounded-[1.5rem] bg-sun text-4xl shadow-card">🦊</div><div><h2 className="font-display text-3xl font-black">¡Vas genial, Aventurero!</h2><p className="mt-1 text-sm text-ink/65">Nivel 4 · 680 XP de 900 XP para el próximo nivel</p><div className="mt-4 h-3 w-full max-w-md overflow-hidden rounded-full bg-white"><div className="h-full w-3/4 rounded-full bg-leaf" /></div></div></div><div className="mt-7 grid grid-cols-3 gap-3"><div className="rounded-xl bg-white p-3"><p className="font-display text-2xl font-black text-violet">7</p><p className="mt-1 text-xs font-bold text-ink/60">Juegos vistos</p></div><div className="rounded-xl bg-white p-3"><p className="font-display text-2xl font-black text-coral">3</p><p className="mt-1 text-xs font-bold text-ink/60">Logros cerca</p></div><div className="rounded-xl bg-white p-3"><p className="font-display text-2xl font-black text-leaf">4</p><p className="mt-1 text-xs font-bold text-ink/60">Días activos</p></div></div></div>
          <div className="rounded-[2rem] bg-ink p-6 text-white sm:p-8"><p className="text-xs font-black uppercase tracking-[.2em] text-sun">Novedades</p><div className="mt-4 divide-y divide-white/10">{latestNews.map((news) => <article key={news.title} className="py-4 first:pt-0"><span className={`inline-block rounded-md ${news.color} px-2 py-1 text-[10px] font-black tracking-wide text-white`}>{news.tag}</span><h3 className="mt-2 font-display text-lg font-black leading-5">{news.title}</h3><p className="mt-2 text-xs font-bold text-white/55">{news.date}</p></article>)}</div></div>
        </div>
      </section>
    </>
  );
}
