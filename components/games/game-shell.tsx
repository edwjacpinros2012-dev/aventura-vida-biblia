"use client";

import Link from "next/link";
import { Component, type ReactNode, useEffect, useState } from "react";
import { usePlayerProgress } from "@/components/player-progress-provider";
import { achievementDetails, levelTitleFor, xpProgressFor, type GameReward, type RewardResult } from "@/types/player-progress";
import type { Game } from "@/types/content";

export function GameShell({ game, children }: { game: Game; children: ReactNode }) {
  const { progress, hydrated } = usePlayerProgress();
  const xpProgress = xpProgressFor(progress.level, progress.xp);
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <Link href={`/juegos/${game.slug}`} className="text-sm font-extrabold text-violet outline-none hover:underline focus-visible:ring-4 focus-visible:ring-violet/25">← Volver a la ficha</Link>
      <div className="mt-5 grid gap-5 rounded-[1.7rem] bg-ink p-5 text-white shadow-lift sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div><p className="text-xs font-black uppercase tracking-[.2em] text-sun">Jugando ahora</p><h1 className="mt-2 font-display text-3xl font-black sm:text-4xl">{game.name}</h1><p className="mt-2 text-sm text-white/70">{game.tagline}</p></div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold sm:min-w-72"><div className="rounded-xl bg-white/10 p-3"><p className="font-display text-xl text-sun">{hydrated ? progress.level : "—"}</p><p className="mt-1 text-white/55">{hydrated ? levelTitleFor(progress.level) : "Cargando"}</p></div><div className="rounded-xl bg-white/10 p-3"><p className="font-display text-xl text-sun">{hydrated ? progress.points : "—"}</p><p className="mt-1 text-white/55">Puntos</p></div><div className="rounded-xl bg-white/10 p-3"><p className="font-display text-xl text-sun">{hydrated ? progress.streak : "—"}</p><p className="mt-1 text-white/55">Racha</p></div><div className="col-span-3 rounded-xl bg-white/10 px-3 py-2 text-left"><div className="flex justify-between text-[11px] text-white/65"><span>Próximo nivel</span><span>{xpProgress.current}/{xpProgress.needed} XP</span></div><div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-sun" style={{ width: `${Math.min(100, (xpProgress.current / xpProgress.needed) * 100)}%` }} /></div></div></div>
      </div>
      <GameErrorBoundary>{children}</GameErrorBoundary>
    </section>
  );
}

export function useGameCompletion(gameId: string) {
  const { completeGame, saveGameProgress } = usePlayerProgress();
  const [result, setResult] = useState<RewardResult | null>(null);
  const finish = (reward: Omit<GameReward, "gameId">) => {
    if (result) return result;
    const next = completeGame({ gameId, ...reward });
    setResult(next);
    saveGameProgress(gameId, { completedAt: new Date().toISOString(), lastReward: reward });
    return next;
  };
  const resetCompletion = () => setResult(null);
  return { result, finish, saveGameProgress, resetCompletion };
}

export function VictoryPanel({ title = "¡Aventura completada!", description, result, points, xp, onPlayAgain }: { title?: string; description: string; result: RewardResult | null; points: number; xp: number; onPlayAgain: () => void }) {
  return <div className="mx-auto mt-6 max-w-2xl overflow-hidden rounded-[1.7rem] bg-[#fff5cf] p-6 text-center shadow-card sm:p-8"><span className="mx-auto grid h-16 w-16 place-items-center rounded-[1.5rem] bg-sun text-4xl shadow-card">🏆</span><p className="mt-5 text-xs font-black uppercase tracking-[.2em] text-[#a66d00]">Nivel completado</p><h2 className="mt-2 font-display text-3xl font-black text-ink">{title}</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-ink/70">{description}</p><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-white p-4"><p className="font-display text-2xl font-black text-violet">+{points}</p><p className="mt-1 text-xs font-bold text-ink/55">Puntos</p></div><div className="rounded-xl bg-white p-4"><p className="font-display text-2xl font-black text-leaf">+{xp}</p><p className="mt-1 text-xs font-bold text-ink/55">XP</p></div></div>{result && result.newAchievementIds.length > 0 && <div className="mt-4 rounded-xl bg-white/80 p-4 text-left"><p className="text-xs font-black uppercase tracking-[.16em] text-violet">Nuevo logro</p>{result.newAchievementIds.map((id) => <p className="mt-2 text-sm font-bold text-ink" key={id}>{achievementDetails[id].icon} {achievementDetails[id].title}</p>)}</div>}<button type="button" onClick={onPlayAgain} className="mt-6 rounded-xl bg-ink px-5 py-3 text-sm font-extrabold text-white outline-none transition-colors hover:bg-violet focus-visible:ring-4 focus-visible:ring-violet/25">Jugar otra vez</button></div>;
}

export function GameLoading() {
  return <div className="mt-6 grid min-h-80 place-items-center rounded-[1.7rem] bg-white shadow-card"><div className="text-center"><span className="mx-auto grid h-12 w-12 animate-pulse place-items-center rounded-2xl bg-violet text-xl text-white">✦</span><p className="mt-4 text-sm font-bold text-ink/65">Preparando la aventura…</p></div></div>;
}

type BoundaryProps = { children: ReactNode };
type BoundaryState = { hasError: boolean };

class GameErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch() {}
  render() {
    if (!this.state.hasError) return this.props.children;
    return <div className="mt-6 rounded-[1.7rem] border border-coral/20 bg-white p-8 text-center shadow-card"><span className="text-4xl">🧭</span><h2 className="mt-3 font-display text-2xl font-black text-ink">Esta aventura necesita reiniciarse</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/65">No se perdió ningún dato. Actualiza la página para volver a intentarlo.</p><button type="button" onClick={() => window.location.reload()} className="mt-5 rounded-xl bg-violet px-4 py-3 text-sm font-extrabold text-white">Reintentar</button></div>;
  }
}

export function useReadyGame() {
  const [ready, setReady] = useState(false);
  useEffect(() => { const timer = window.setTimeout(() => setReady(true), 140); return () => window.clearTimeout(timer); }, []);
  return ready;
}
