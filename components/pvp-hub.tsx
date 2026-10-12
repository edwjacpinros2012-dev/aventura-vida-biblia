"use client";

import { useEffect, useState } from "react";
import { CharacterAvatar } from "@/components/character-avatar";
import { PvpQuizDuel } from "@/components/games/pvp-quiz-duel";
import { usePlayerProgress } from "@/components/player-progress-provider";
import { avatarFallbackFor } from "@/lib/characters/catalog";

type RankingRow = {
  position: number;
  nickname: string;
  avatar: string;
  rating: number;
  wins: number;
  losses: number;
  draws: number;
  rank: string;
};

type HistoryRow = {
  id: string;
  playedAt: string;
  score: number;
  opponent: { nickname: string; avatar: string };
  result: "WIN" | "LOSS" | "DRAW";
};

export function PvpHub() {
  const { identity } = usePlayerProgress();
  const [showDuel, setShowDuel] = useState(false);
  const [ranking, setRanking] = useState<RankingRow[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [rankingError, setRankingError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/pvp/ranking")
      .then(async (response) => {
        if (!response.ok) throw new Error("No pudimos cargar el ranking todavía.");
        return response.json() as Promise<{ ranking: RankingRow[] }>;
      })
      .then((data) => setRanking(data.ranking))
      .catch((error: unknown) => setRankingError(error instanceof Error ? error.message : "No pudimos cargar el ranking todavía."));
  }, []);

  useEffect(() => {
    if (!identity.authenticated) return;
    void fetch("/api/pvp/history")
      .then((response) => response.ok ? response.json() as Promise<{ history: HistoryRow[] }> : { history: [] })
      .then((data) => setHistory(data.history))
      .catch(() => setHistory([]));
  }, [identity.authenticated]);

  if (showDuel) return <section className="av-page"><div className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8"><button type="button" onClick={() => setShowDuel(false)} className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-extrabold text-white/80 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-100/25">← Volver al centro PvP</button><PvpQuizDuel onBack={() => setShowDuel(false)} /></div></section>;

  return <section className="av-page"><div className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8"><section className="av-panel relative overflow-hidden rounded-[2rem] p-6 shadow-lift sm:p-9"><div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#f5bd4d]/10 blur-3xl" /><div className="relative grid gap-7 lg:grid-cols-[1fr_250px] lg:items-center"><div><p className="av-kicker text-xs font-black uppercase tracking-[.2em]">Arena de sabiduría</p><h1 className="av-title mt-3 font-display text-4xl font-black sm:text-5xl">Duelo PvP de preguntas</h1><p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-white/70">Una partida amable 1 contra 1: ambos jugadores responden las mismas rondas. El servidor controla preguntas, puntaje, resultado y recompensas para evitar resultados falsos.</p><div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={() => setShowDuel(true)} className="av-gold-button rounded-xl px-5 py-3 text-sm font-extrabold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f5bd4d]/30">Buscar rival</button><span className="rounded-xl border border-teal-100/15 bg-[#061923]/55 px-4 py-3 text-sm font-bold text-[#67e5e0]">1 vs 1 · 3 rondas</span></div></div><div className="rounded-[1.6rem] border border-[#f5bd4d]/30 bg-[#061923]/65 p-5 text-center"><CharacterAvatar avatarKey={identity.avatarKey} fallback={avatarFallbackFor(identity.avatarKey)} alt={`Avatar de ${identity.nickname}`} imageSizes="112px" variant="full" className="mx-auto grid h-28 w-28 place-items-center rounded-[1.5rem] bg-[#0d5d70] text-5xl" /><p className="mt-3 font-display text-xl font-black text-[#f5e5b9]">{identity.nickname}</p><p className="mt-1 text-xs font-bold text-white/55">Tu identidad global para el duelo</p></div></div></section><div className="mt-8 grid gap-7 lg:grid-cols-[1.15fr_.85fr]"><section className="av-panel-soft rounded-[1.8rem] p-5 sm:p-6"><div className="flex items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.17em] text-[#67e5e0]">Ranking PvP</p><h2 className="mt-2 font-display text-3xl font-black text-[#f5e5b9]">Exploradores destacados</h2></div><span className="text-xs font-black text-white/45">Apodos y avatares</span></div>{rankingError ? <p role="status" className="mt-5 rounded-xl bg-white/5 p-4 text-sm font-bold text-white/65">{rankingError}</p> : ranking.length === 0 ? <p className="mt-5 rounded-xl bg-white/5 p-4 text-sm font-bold text-white/65">Aún no hay partidas clasificadas. ¡Puedes inaugurar la arena!</p> : <ol className="mt-5 grid gap-2">{ranking.slice(0, 8).map((player) => <li key={`${player.position}-${player.nickname}`} className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#061923]/55 p-3"><span className="w-6 text-center font-display text-lg font-black text-[#f5cf74]">{player.position}</span><CharacterAvatar avatarKey={player.avatar} fallback={avatarFallbackFor(player.avatar)} alt={`Avatar de ${player.nickname}`} imageSizes="40px" className="grid h-10 w-10 place-items-center rounded-xl bg-[#0d5d70]" /><div className="min-w-0 flex-1"><p className="truncate font-bold text-white">{player.nickname}</p><p className="text-xs font-semibold text-white/50">{player.rank} · {player.wins} V / {player.losses} D / {player.draws} E</p></div><strong className="font-display text-lg text-[#f5e5b9]">{player.rating}</strong></li>)}</ol>}</section><aside className="av-panel-soft rounded-[1.8rem] p-5 sm:p-6"><p className="text-xs font-black uppercase tracking-[.17em] text-[#f5bd4d]">Mi historial</p><h2 className="mt-2 font-display text-3xl font-black text-[#f5e5b9]">Partidas válidas</h2>{!identity.authenticated ? <p className="mt-5 rounded-xl bg-white/5 p-4 text-sm font-bold leading-6 text-white/65">Inicia sesión para conservar tu historial, estadísticas y Monedas de Aventura después de cada duelo.</p> : history.length === 0 ? <p className="mt-5 rounded-xl bg-white/5 p-4 text-sm font-bold text-white/65">Todavía no tienes duelos terminados.</p> : <div className="mt-5 grid gap-2">{history.slice(0, 6).map((match) => <div key={match.id} className="rounded-xl border border-white/10 bg-[#061923]/55 p-3"><div className="flex items-center justify-between gap-2"><span className={`rounded-full px-2 py-1 text-[10px] font-black ${match.result === "WIN" ? "bg-[#74e2b0]/15 text-[#a6f0c9]" : match.result === "LOSS" ? "bg-coral/15 text-coral" : "bg-[#f5bd4d]/15 text-[#f5cf74]"}`}>{match.result === "WIN" ? "VICTORIA" : match.result === "LOSS" ? "PARTIDA CERRADA" : "EMPATE"}</span><span className="text-xs font-bold text-white/45">{match.score} pts</span></div><p className="mt-2 flex items-center gap-2 text-sm font-bold text-white"><CharacterAvatar avatarKey={match.opponent.avatar} fallback={avatarFallbackFor(match.opponent.avatar)} alt="" imageSizes="24px" className="grid h-6 w-6 place-items-center rounded-lg bg-[#0d5d70]" />{match.opponent.nickname}</p></div>)}</div>}</aside></div></div></section>;
}
