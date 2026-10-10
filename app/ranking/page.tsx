import type { Metadata } from "next";
import Link from "next/link";
import { RankingBoard } from "@/components/ranking-board";
import { leaderboard } from "@/lib/content";

export const metadata: Metadata = { title: "Ranking | Aventura Vida", description: "Los exploradores que han sumado más puntos." };

export default function RankingPage() {
  return (
    <section className="av-page"><div className="mx-auto max-w-5xl px-4 pb-12 pt-12 sm:px-6 sm:pt-16"><div className="text-center"><p className="av-kicker text-xs font-black uppercase tracking-[.2em]">Celebremos el esfuerzo</p><h1 className="av-title mt-3 font-display text-5xl font-black tracking-tight sm:text-6xl">Ranking de exploradores</h1><p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/65">Aquí aparecen únicamente apodos y avatares. Nunca mostramos nombres completos ni información privada.</p></div><div className="mt-10 grid gap-6 lg:grid-cols-[.85fr_1.15fr]"><aside className="av-panel-soft rounded-[1.7rem] p-6"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#f5bd4d] text-3xl">🏆</span><h2 className="mt-5 font-display text-3xl font-black text-[#f5e5b9]">Jugar con alegría</h2><p className="mt-3 text-sm leading-6 text-white/65">El ranking reconoce la constancia, pero cada aventura vale por lo que aprendes y compartes.</p><div className="mt-5 rounded-xl border border-teal-100/15 bg-[#061923]/60 p-4 text-sm font-bold text-white/70">Los rankings compartidos usan apodos. Las recompensas competitivas se validan por el servidor cuando una partida PvP concluye.</div><Link href="/juegos" className="av-gold-button mt-6 inline-flex rounded-xl px-4 py-3 text-sm font-extrabold outline-none focus-visible:ring-4 focus-visible:ring-[#f5bd4d]/30">Explorar juegos</Link></aside><RankingBoard players={leaderboard} /></div></div></section>
  );
}
