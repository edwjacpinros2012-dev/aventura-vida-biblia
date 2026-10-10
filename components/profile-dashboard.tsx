"use client";

import Link from "next/link";
import { CharacterAvatar } from "@/components/character-avatar";
import { ArrowRight, CheckIcon } from "@/components/icons";
import { usePlayerProgress } from "@/components/player-progress-provider";
import { avatarFallbackFor } from "@/lib/characters/catalog";
import { achievementDetails, levelTitleFor, xpProgressFor } from "@/types/player-progress";

const statLabels = ["Puntos", "Partidas", "Versículos", "Logros", "Racha"] as const;

export function ProfileDashboard() {
  const { progress, hydrated, identity } = usePlayerProgress();
  const levelProgress = xpProgressFor(progress.level, progress.xp);
  const achievements = Object.entries(achievementDetails);
  const stats = [progress.points, progress.gamesCompleted, progress.learnedVerses.length, progress.achievementIds.length, progress.streak];

  return <section className="av-page"><div className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 sm:pt-12 lg:px-8">
    <div className="av-panel relative overflow-hidden rounded-[2rem] p-6 shadow-lift sm:p-9">
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#f5bd4d]/10 blur-3xl" />
      <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center">
        <div className="flex flex-wrap items-center gap-5">
          <CharacterAvatar avatarKey={identity.avatarKey} fallback={avatarFallbackFor(identity.avatarKey)} alt={`Avatar de ${identity.nickname}`} imageSizes="112px" variant="full" className="grid h-28 w-28 place-items-center rounded-[2rem] border-2 border-[#f5bd4d]/70 bg-[#092a38] text-5xl shadow-[0_12px_26px_rgba(0,0,0,.32)]" />
          <div className="min-w-0"><p className="av-kicker text-xs font-black uppercase tracking-[.2em]">Mi perfil</p><h1 className="av-title mt-2 truncate font-display text-4xl font-black sm:text-5xl">{identity.nickname}</h1><p className="mt-2 text-sm font-bold text-white/65">{hydrated ? `Nivel ${progress.level} · ${levelTitleFor(progress.level)}` : "Preparando tu progreso…"}</p><div className="mt-4 flex flex-wrap gap-2"><Link href="/perfil/avatares" className="av-teal-button rounded-xl px-4 py-2.5 text-sm font-extrabold outline-none focus-visible:ring-4 focus-visible:ring-teal-100/30">Cambiar avatar</Link><Link href="/juegos" className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-extrabold text-white/80 outline-none hover:bg-white/10 focus-visible:ring-4 focus-visible:ring-teal-100/30">Seguir jugando</Link></div></div>
        </div>
        <div className="rounded-2xl border border-teal-100/20 bg-[#061923]/55 p-5"><div className="flex items-center justify-between text-xs font-black"><span className="text-[#67e5e0]">CAMINO AL NIVEL {progress.level + 1}</span><span className="text-white/65">{hydrated ? `${levelProgress.current}/${levelProgress.needed} XP` : "…"}</span></div><div className="av-progress mt-3 h-3 overflow-hidden rounded-full"><span style={{ width: `${Math.min(100, levelProgress.current / levelProgress.needed * 100)}%` }} /></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="av-chip rounded-xl p-3"><p className="text-[10px] font-black uppercase tracking-wide text-white/45">Monedas</p><p className="mt-1 font-display text-2xl font-black text-[#f5cf74]">{identity.authenticated ? identity.adventureCoins?.toLocaleString("es-ES") ?? "0" : "—"}</p></div><div className="av-chip rounded-xl p-3"><p className="text-[10px] font-black uppercase tracking-wide text-white/45">Estado</p><p className="mt-1 text-sm font-black text-[#f5e5b9]">{identity.authenticated ? "Cuenta activa" : "Modo visitante"}</p></div></div></div>
      </div>
    </div>

    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{stats.map((value, index) => <div key={statLabels[index]} className="av-card rounded-2xl p-4"><p className="font-display text-2xl font-black text-[#f5cf74]">{hydrated ? value : "—"}</p><p className="mt-1 text-xs font-bold text-white/55">{statLabels[index]}{statLabels[index] === "Racha" && hydrated ? (value === 1 ? " · día" : " · días") : ""}</p></div>)}</div>

    <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
      <div><div className="flex items-end justify-between gap-4"><div><p className="av-kicker text-xs font-black uppercase tracking-[.2em]">Colección</p><h2 className="av-title mt-2 font-display text-3xl font-black">Logros de aventura</h2></div><span className="text-sm font-bold text-white/55">{hydrated ? `${progress.achievementIds.length} de ${achievements.length}` : "Cargando…"}</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{achievements.map(([id, achievement]) => { const unlocked = progress.achievementIds.includes(id as keyof typeof achievementDetails); return <article key={id} className={`rounded-2xl border p-4 ${unlocked ? "border-[#f5bd4d]/35 bg-[#113849]" : "border-white/10 bg-[#071f2c]/75"}`}><div className="flex items-center gap-3"><span className={`grid h-11 w-11 place-items-center rounded-xl text-xl ${unlocked ? "bg-[#f5bd4d] text-[#061923]" : "bg-white/10 grayscale"}`}>{achievement.icon}</span><div className="min-w-0"><h3 className="font-bold text-[#f5e5b9]">{achievement.title}</h3><p className="mt-1 text-xs font-semibold text-white/55">{unlocked ? "Desbloqueado" : achievement.description}</p></div>{unlocked && <CheckIcon className="ml-auto h-5 w-5 text-[#74e2b0]" />}</div></article>; })}</div></div>
      <aside className="av-panel-soft rounded-[1.7rem] p-6"><p className="text-xs font-black uppercase tracking-[.18em] text-[#67e5e0]">Identidad protegida</p><h2 className="mt-3 font-display text-2xl font-black text-[#f5e5b9]">Un avatar para todo tu camino</h2><p className="mt-3 text-sm leading-6 text-white/65">Tu apodo y <code className="rounded bg-white/10 px-1.5 py-0.5 text-[#f5cf74]">avatarKey</code> se reutilizan en perfil, ranking, juegos, aventuras y salas. No necesitas elegir un personaje otra vez dentro de cada juego.</p><div className="mt-5 rounded-2xl border border-teal-100/15 bg-[#061923]/55 p-4"><div className="flex items-center gap-3"><CharacterAvatar avatarKey={identity.avatarKey} fallback={avatarFallbackFor(identity.avatarKey)} alt="Avatar global actual" imageSizes="52px" className="grid h-12 w-12 place-items-center rounded-xl bg-[#0d8795]" /><div><p className="text-xs font-black uppercase tracking-[.14em] text-white/45">Mi avatar</p><p className="mt-1 font-bold text-[#f5e5b9]">Avatar global seleccionado</p></div></div></div><Link href="/perfil/avatares" className="av-gold-button mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold outline-none focus-visible:ring-4 focus-visible:ring-[#f5bd4d]/35">Abrir catálogo <ArrowRight className="h-4 w-4" /></Link><Link href="/ranking" className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-[#67e5e0] hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-100/30">Ver ranking <ArrowRight className="h-4 w-4" /></Link></aside>
    </div>
  </div></section>;
}
