"use client";

import Link from "next/link";
import { usePlayerProgress } from "@/components/player-progress-provider";
import { levelTitleFor, xpProgressFor } from "@/types/player-progress";

const collections = [
  { id: "first-adventure", title: "Primera aventura", icon: "🧭", description: "Termina tu primer juego.", detail: "Insignia de explorador" },
  { id: "curious-explorer", title: "Explorador curioso", icon: "🗺️", description: "Prueba 3 juegos diferentes.", detail: "Insignia de descubrimiento" },
  { id: "verse-keeper", title: "Guardián de palabras", icon: "📖", description: "Aprende tu primer versículo.", detail: "Insignia de sabiduría" },
  { id: "steady-light", title: "Luz constante", icon: "🌟", description: "Mantén una racha de 3 días.", detail: "Insignia de constancia" },
  { id: "game-master", title: "Maestro de juegos", icon: "🏆", description: "Completa 8 partidas.", detail: "Insignia de campeón" },
] as const;

const levelRewards = [
  { level: 2, title: "Explorador de senderos", icon: "🥉", description: "Alcanza el nivel 2" },
  { level: 5, title: "Aventurero valiente", icon: "🛡️", description: "Alcanza el nivel 5" },
  { level: 10, title: "Guardián de la luz", icon: "✨", description: "Alcanza el nivel 10" },
  { level: 20, title: "Héroe de la fe", icon: "👑", description: "Alcanza el nivel 20" },
];

export default function RewardsPage() {
  const { progress, identity, hydrated } = usePlayerProgress();
  const xp = xpProgressFor(progress.level, progress.xp);
  const unlockedAchievements = collections.filter((item) => progress.achievementIds.includes(item.id as (typeof progress.achievementIds)[number])).length;
  const armorCount = progress.armorCampaign.armorPieces.length;
  const tokens = progress.armorCampaign.faithTokens;

  return (
    <div className="av-page min-h-screen overflow-hidden pb-12">
      <section className="relative border-b border-sun/20 bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,189,77,.2),transparent_45%),linear-gradient(145deg,#124657,#082b39_55%,#061923)] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="inline-flex rounded-full border border-amber-200/30 bg-amber-300/10 px-3 py-1 text-xs font-black uppercase tracking-[.18em] text-amber-200">🎁 Sala de recompensas</p>
          <h1 className="av-title mt-5 font-display text-4xl font-black sm:text-6xl">Tus logros brillan aquí</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">Cada juego, versículo y aventura suma a tu colección. Desbloquea insignias y títulos jugando con curiosidad, paciencia y alegría.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-[#061923]/65 p-4"><p className="text-xs font-bold text-white/55">Puntos</p><p className="mt-1 font-display text-3xl font-black text-amber-200">{hydrated ? progress.points.toLocaleString("es-EC") : "—"}</p></div>
            <div className="rounded-2xl border border-white/10 bg-[#061923]/65 p-4"><p className="text-xs font-bold text-white/55">Experiencia XP</p><p className="mt-1 font-display text-3xl font-black text-cyan-200">{hydrated ? progress.xp.toLocaleString("es-EC") : "—"}</p></div>
            <div className="rounded-2xl border border-white/10 bg-[#061923]/65 p-4"><p className="text-xs font-bold text-white/55">Fichas de fe</p><p className="mt-1 font-display text-3xl font-black text-emerald-200">{hydrated ? tokens : "—"}</p></div>
            <div className="rounded-2xl border border-white/10 bg-[#061923]/65 p-4"><p className="text-xs font-bold text-white/55">Monedas de aventura</p><p className="mt-1 font-display text-3xl font-black text-violet-200">{identity.authenticated ? (hydrated ? (identity.adventureCoins ?? 0).toLocaleString("es-EC") : "—") : "—"}</p><p className="mt-1 text-[11px] text-white/45">{identity.authenticated ? "Saldo de tu cuenta" : "Inicia sesión para consultar tu saldo"}</p></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-9 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <div className="av-panel rounded-3xl p-6">
            <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.16em] text-cyan-200">Tu aventura</p><h2 className="mt-2 font-display text-2xl font-black text-[#f5e5b9]">{identity.nickname}</h2></div><span className="text-4xl">🧑‍🚀</span></div>
            <p className="mt-4 text-sm font-bold text-white/65">Nivel {progress.level} · {levelTitleFor(progress.level)}</p>
            <div className="mt-3 h-3 overflow-hidden rounded-full av-progress"><span style={{ width: `${Math.min(100, (xp.current / xp.needed) * 100)}%` }} /></div>
            <p className="mt-2 text-xs text-white/55">{hydrated ? `${xp.current} de ${xp.needed} XP para el siguiente nivel` : "Cargando progreso…"}</p>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center"><div className="av-chip rounded-xl p-3"><p className="text-xl font-black text-amber-200">{progress.gamesCompleted}</p><p className="text-[10px] text-white/55">Partidas</p></div><div className="av-chip rounded-xl p-3"><p className="text-xl font-black text-cyan-200">{progress.learnedVerses.length}</p><p className="text-[10px] text-white/55">Versículos</p></div><div className="av-chip rounded-xl p-3"><p className="text-xl font-black text-emerald-200">{progress.streak}</p><p className="text-[10px] text-white/55">Días de racha</p></div></div>
          </div>
          <div className="av-panel-soft rounded-3xl p-6">
            <p className="text-xs font-black uppercase tracking-[.16em] text-amber-200">Armadura del Espíritu</p>
            <h2 className="mt-2 font-display text-2xl font-black text-[#f5e5b9]">Piezas reunidas</h2>
            <p className="mt-2 text-sm leading-6 text-white/65">Completa los niveles de la campaña para reunir fichas, insignias y piezas especiales.</p>
            <div className="mt-5 flex items-center justify-between"><span className="text-3xl">🛡️</span><span className="font-display text-2xl font-black text-amber-200">{armorCount}/6</span></div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full av-progress"><span style={{ width: `${Math.min(100, armorCount / 6 * 100)}%` }} /></div>
            <p className="mt-2 text-xs text-white/50">{progress.armorCampaign.completedLevelIds.length} niveles completados · {tokens} fichas reunidas</p>
            <Link href="/aventuras/armadura-del-espiritu" className="mt-5 inline-flex rounded-xl bg-amber-300 px-4 py-3 text-sm font-black text-[#14252a] hover:brightness-110">Continuar campaña →</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.16em] text-cyan-200">Colección</p><h2 className="mt-1 font-display text-3xl font-black text-[#f5e5b9]">Insignias especiales</h2></div><p className="text-sm font-bold text-white/55">{unlockedAchievements}/{collections.length} conseguidas</p></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((item) => {
            const unlocked = progress.achievementIds.includes(item.id as (typeof progress.achievementIds)[number]);
            return <article key={item.id} className={`rounded-2xl border p-5 transition ${unlocked ? "border-amber-200/35 bg-[linear-gradient(145deg,rgba(245,189,77,.14),rgba(8,43,57,.9))]" : "border-white/10 bg-white/[.035]"}`}>
              <div className="flex items-center justify-between"><span className="text-4xl">{item.icon}</span><span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${unlocked ? "bg-emerald-300/15 text-emerald-200" : "bg-white/10 text-white/45"}`}>{unlocked ? "Desbloqueada" : "Por descubrir"}</span></div>
              <h3 className="mt-4 font-display text-xl font-black text-[#f5e5b9]">{item.title}</h3><p className="mt-1 text-sm text-white/60">{item.description}</p><p className="mt-3 text-xs font-bold text-cyan-200">{item.detail}</p>
            </article>;
          })}
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-5"><p className="text-xs font-black uppercase tracking-[.16em] text-amber-200">Progreso de nivel</p><h2 className="mt-1 font-display text-3xl font-black text-[#f5e5b9]">Títulos por desbloquear</h2></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {levelRewards.map((item) => {
            const unlocked = progress.level >= item.level;
            return <article key={item.level} className="av-panel-soft rounded-2xl p-4"><div className="flex items-center justify-between"><span className="text-3xl">{item.icon}</span><span className="text-xs font-black text-amber-200">Nivel {item.level}</span></div><h3 className="mt-3 font-display text-lg font-black text-[#f5e5b9]">{item.title}</h3><p className="mt-1 text-xs text-white/55">{item.description}</p><p className={`mt-3 text-xs font-black ${unlocked ? "text-emerald-200" : "text-white/40"}`}>{unlocked ? "✓ Título conseguido" : "🔒 Sigue jugando para conseguirlo"}</p></article>;
          })}
        </div>
        <p className="mt-4 text-xs text-white/45">Los puntos, XP, insignias y títulos reflejan el progreso registrado. Las compras con monedas y los objetos equipables aún no están habilitados en esta sala.</p>
        <div className="mt-7 flex flex-wrap gap-3"><Link href="/juegos" className="av-gold-button rounded-xl px-5 py-3 text-sm font-black">Ganar más XP jugando</Link><Link href="/perfil" className="av-teal-button rounded-xl px-5 py-3 text-sm font-black">Ver mi perfil</Link></div>
      </section>
    </div>
  );
}
