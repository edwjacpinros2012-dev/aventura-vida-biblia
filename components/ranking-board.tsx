"use client";

import { useMemo, useState } from "react";
import { CharacterAvatar } from "@/components/character-avatar";
import { usePlayerProgress } from "@/components/player-progress-provider";
import { avatarFallbackFor } from "@/lib/characters/catalog";
import type { Player } from "@/types/content";

const tabs = ["Semanal", "Mensual", "Temporada"] as const;
const medalStyles = ["bg-[#f5bd4d] text-[#5c3605]", "bg-slate-200 text-slate-600", "bg-[#d99d70] text-[#633417]"];

export function RankingBoard({ players }: { players: Player[] }) {
  const [period, setPeriod] = useState<(typeof tabs)[number]>("Semanal");
  const { progress, hydrated, identity } = usePlayerProgress();
  const rankedPlayers = useMemo(() => {
    const localPlayer: Player | null = hydrated && progress.points > 0 ? { nickname: identity.nickname, avatar: identity.avatarKey, points: progress.points, trend: "new" } : null;
    return [...(localPlayer ? [localPlayer] : []), ...players].sort((a, b) => b.points - a.points);
  }, [hydrated, identity.avatarKey, identity.nickname, players, progress.points]);

  return <div className="av-panel overflow-hidden rounded-[1.7rem] shadow-card"><div className="border-b border-[#f5bd4d]/15 p-4 sm:p-5"><div className="flex flex-wrap gap-2" role="tablist" aria-label="Periodo de ranking">{tabs.map((tab) => <button key={tab} type="button" role="tab" aria-selected={period === tab} onClick={() => setPeriod(tab)} className={`rounded-xl px-4 py-2.5 text-sm font-extrabold outline-none transition-colors focus-visible:ring-4 focus-visible:ring-teal-100/25 ${period === tab ? "bg-[#f5bd4d] text-[#061923]" : "bg-white/10 text-white/70 hover:bg-teal-300/15 hover:text-teal-100"}`}>{tab}</button>)}</div><p className="mt-4 text-xs font-semibold text-white/55">Tu puntuación local aparece al completar una partida. Las posiciones de referencia solo muestran apodos y avatares seguros.</p></div><ol className="divide-y divide-white/10">{rankedPlayers.map((player, index) => <li key={player.nickname} className="flex items-center gap-3 p-4 sm:px-5"><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-sm font-black ${medalStyles[index] ?? "bg-white/10 text-white/65"}`}>{index + 1}</span><CharacterAvatar avatarKey={player.avatar} fallback={avatarFallbackFor(player.avatar)} alt={`Avatar de ${player.nickname}`} imageSizes="40px" className="grid h-10 w-10 place-items-center rounded-full border border-teal-100/20 bg-[#0d5d70] text-xl" /><div className="min-w-0 flex-1"><p className="truncate font-bold text-[#f5e5b9]">{player.nickname}{player.nickname === identity.nickname && <span className="ml-2 text-xs text-[#67e5e0]">Tú</span>}</p><p className="mt-0.5 text-xs font-semibold text-white/50">{player.trend === "up" ? "↗ Subiendo" : player.trend === "new" ? "✦ Recién llegó" : "→ Se mantiene"}</p></div><span className="font-display text-xl font-black text-[#f5cf74]">{player.points.toLocaleString("es-ES")}</span></li>)}</ol></div>;
}
