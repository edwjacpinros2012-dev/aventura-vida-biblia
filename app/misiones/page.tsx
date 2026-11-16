"use client";

import Link from "next/link";
import { useMemo } from "react";
import { DailyBibleChallenge } from "@/components/daily-bible-challenge";
import { usePlayerProgress } from "@/components/player-progress-provider";
import { dailyBibleChallengeFor } from "@/lib/daily-bible-challenge";

type MissionCard = {
  id: string;
  icon: string;
  title: string;
  description: string;
  current: number;
  target: number;
  unit: string;
  href: string;
  badgeId?: string;
};

export default function MissionsPage() {
  const { progress, identity, hydrated, progressSyncState } = usePlayerProgress();
  const daily = useMemo(() => dailyBibleChallengeFor(), []);
  const missions: MissionCard[] = [
    { id: "first-adventure", icon: "🧭", title: "Primer paso", description: "Completa tu primera partida y abre tu camino de explorador.", current: Math.min(1, progress.gamesCompleted), target: 1, unit: "partida", href: "/juegos", badgeId: "first-adventure" },
    { id: "curious-explorer", icon: "🗺️", title: "Explorador curioso", description: "Prueba tres juegos diferentes de la biblioteca.", current: Math.min(3, progress.completedGameIds.length), target: 3, unit: "juegos distintos", href: "/juegos", badgeId: "curious-explorer" },
    { id: "verse-keeper", icon: "📖", title: "Guardián de palabras", description: "Aprende y guarda al menos un versículo en tu recorrido.", current: Math.min(1, progress.learnedVerses.length), target: 1, unit: "versículo", href: "/juegos/aprende-el-versiculo/jugar", badgeId: "verse-keeper" },
    { id: "armor-collector", icon: "🛡️", title: "La Armadura del Espíritu", description: "Avanza por la campaña y reúne las seis piezas especiales.", current: Math.min(6, progress.armorCampaign.armorPieces.length), target: 6, unit: "piezas", href: "/aventuras/armadura-del-espiritu" },
    { id: "game-master", icon: "🏆", title: "Maestro de juegos", description: "Completa ocho partidas y demuestra todo lo que has aprendido.", current: Math.min(8, progress.gamesCompleted), target: 8, unit: "partidas", href: "/juegos", badgeId: "game-master" },
  ];
  const completed = missions.filter((mission) => mission.current >= mission.target).length;
  const dailyDone = progress.dailyChallengeIds.includes(daily.id);

  return (
    <main className="av-page min-h-screen overflow-hidden pb-24">
      <section className="border-b border-sun/20 bg-[radial-gradient(ellipse_at_50%_0%,rgba(103,229,224,.18),transparent_45%),linear-gradient(145deg,#124657,#082b39_55%,#061923)] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="inline-flex rounded-full border border-teal-200/25 bg-teal-300/10 px-3 py-1 text-xs font-black uppercase tracking-[.17em] text-teal-100">🧭 Centro de expediciones</p>
          <h1 className="av-title mt-5 font-display text-4xl font-black sm:text-6xl">Misiones y desafíos</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">Un solo mapa para tus retos diarios, juegos, aprendizajes y aventuras. Cada actividad cuenta para tu progreso real.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-[#061923]/70 p-4"><p className="text-xs font-bold text-white/55">Misiones de progreso</p><p className="mt-1 text-3xl font-black text-amber-200">{hydrated ? completed : "—"}/{missions.length}</p></div>
            <div className="rounded-2xl border border-white/10 bg-[#061923]/70 p-4"><p className="text-xs font-bold text-white/55">Partidas completadas</p><p className="mt-1 text-3xl font-black text-cyan-200">{hydrated ? progress.gamesCompleted : "—"}</p></div>
            <div className="rounded-2xl border border-white/10 bg-[#061923]/70 p-4"><p className="text-xs font-bold text-white/55">Sincronización</p><p className="mt-1 text-lg font-black text-emerald-200">{!identity.authenticated ? "En este dispositivo" : progressSyncState === "synced" ? "Cuenta sincronizada" : progressSyncState === "error" ? "Revisar conexión" : "Sincronizando…"}</p></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-9 sm:px-6 lg:px-8">
        <div className="mb-5"><p className="text-xs font-black uppercase tracking-[.16em] text-amber-200">Reto especial</p><h2 className="mt-1 font-display text-3xl font-black text-[#f5e5b9]">La misión de hoy</h2><p className="mt-2 text-sm text-white/55">Un desafío bíblico breve que cambia cada día. Su recompensa se registra una sola vez por fecha.</p></div>
        <DailyBibleChallenge challenge={daily} />
        {dailyDone && <p className="mt-3 text-sm font-bold text-emerald-200">✓ El reto de hoy ya está registrado en tu progreso.</p>}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.16em] text-cyan-200">Tu ruta personal</p><h2 className="mt-1 font-display text-3xl font-black text-[#f5e5b9]">Misiones de progreso</h2></div><Link href="/recompensas" className="text-sm font-bold text-amber-200 hover:text-amber-100">Ver insignias y premios →</Link></div>
        <div className="grid gap-4 md:grid-cols-2">
          {missions.map((mission) => {
            const done = mission.current >= mission.target || (mission.badgeId ? progress.achievementIds.includes(mission.badgeId as (typeof progress.achievementIds)[number]) : false);
            const percent = Math.min(100, mission.current / mission.target * 100);
            return <article key={mission.id} className={`rounded-3xl border p-5 ${done ? "border-emerald-200/30 bg-emerald-300/[.06]" : "border-white/10 bg-[#092633]/80"}`}>
              <div className="flex items-start gap-4"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/[.07] text-3xl">{mission.icon}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-display text-xl font-black text-[#f5e5b9]">{mission.title}</h3><span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${done ? "bg-emerald-300/15 text-emerald-200" : "bg-white/10 text-white/55"}`}>{done ? "Completada" : "En progreso"}</span></div><p className="mt-2 text-sm leading-6 text-white/60">{mission.description}</p></div></div>
              <div className="mt-5 flex items-center justify-between text-xs font-bold text-white/55"><span>Progreso</span><span>{mission.current}/{mission.target} {mission.unit}</span></div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-teal-300 to-amber-300 transition-all" style={{ width: `${percent}%` }} /></div>
              <div className="mt-4 flex items-center justify-between gap-3"><span className="text-xs font-semibold text-white/45">{done ? "Tu progreso ya reconoce este logro." : "Sigue jugando para avanzar."}</span><Link href={mission.href} className="rounded-xl bg-amber-300 px-4 py-2.5 text-xs font-black text-[#14252a] hover:brightness-110">{done ? "Volver a explorar" : "Continuar misión"}</Link></div>
            </article>;
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
        <Link href="/aventuras" className="av-panel-soft rounded-2xl p-5 transition hover:-translate-y-1"><span className="text-3xl">🌄</span><h3 className="mt-3 font-display text-xl font-black text-[#f5e5b9]">Explorar mundos</h3><p className="mt-1 text-sm text-white/55">Continúa las historias y campañas disponibles.</p></Link>
        <Link href="/multiplayer" className="av-panel-soft rounded-2xl p-5 transition hover:-translate-y-1"><span className="text-3xl">🤝</span><h3 className="mt-3 font-display text-xl font-black text-[#f5e5b9]">Jugar en equipo</h3><p className="mt-1 text-sm text-white/55">Coopera en el laberinto con personas conocidas.</p></Link>
        <Link href="/pvp" className="av-panel-soft rounded-2xl p-5 transition hover:-translate-y-1"><span className="text-3xl">🧠</span><h3 className="mt-3 font-display text-xl font-black text-[#f5e5b9]">Arena de preguntas</h3><p className="mt-1 text-sm text-white/55">Pon a prueba tus conocimientos y revisa tu ranking.</p></Link>
      </section>
    </main>
  );
}
