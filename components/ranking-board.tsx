"use client";

import { useState } from "react";
import type { Player } from "@/types/content";

const tabs = ["Semanal", "Mensual", "Temporada"] as const;
const medalStyles = ["bg-sun text-[#755000]", "bg-slate-200 text-slate-600", "bg-[#f1bf91] text-[#8a4e24]"];

export function RankingBoard({ players }: { players: Player[] }) {
  const [period, setPeriod] = useState<(typeof tabs)[number]>("Semanal");
  return (
    <div className="overflow-hidden rounded-[1.7rem] border border-ink/5 bg-white shadow-card"><div className="border-b border-ink/5 p-4 sm:p-5"><div className="flex flex-wrap gap-2" role="tablist" aria-label="Periodo de ranking">{tabs.map((tab) => <button key={tab} type="button" role="tab" aria-selected={period === tab} onClick={() => setPeriod(tab)} className={`rounded-xl px-4 py-2.5 text-sm font-extrabold outline-none transition-colors focus-visible:ring-4 focus-visible:ring-violet/25 ${period === tab ? "bg-ink text-white" : "bg-sky text-ink/65 hover:bg-violet/10 hover:text-violet"}`}>{tab}</button>)}</div><p className="mt-4 text-xs font-semibold text-ink/55">Vista de demostración · Los puntos reales se añadirán tras validación del servidor.</p></div><ol className="divide-y divide-ink/5">{players.map((player, index) => <li key={player.nickname} className="flex items-center gap-3 p-4 sm:px-5"><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-sm font-black ${medalStyles[index] ?? "bg-sky text-ink/55"}`}>{index + 1}</span><span className="grid h-10 w-10 place-items-center rounded-full bg-sky text-xl" aria-hidden="true">{player.avatar}</span><div className="min-w-0 flex-1"><p className="truncate font-bold text-ink">{player.nickname}</p><p className="mt-0.5 text-xs font-semibold text-ink/50">{player.trend === "up" ? "↗ Subiendo" : player.trend === "new" ? "✦ Recién llegó" : "→ Se mantiene"}</p></div><span className="font-display text-xl font-black text-violet">{player.points.toLocaleString("es-ES")}</span></li>)}</ol></div>
  );
}
