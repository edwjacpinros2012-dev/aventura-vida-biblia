import type { Metadata } from "next";
import Link from "next/link";
import { RankingBoard } from "@/components/ranking-board";
import { leaderboard } from "@/lib/content";

export const metadata: Metadata = { title: "Ranking | Aventura Vida", description: "Los exploradores que han sumado más puntos." };

export default function RankingPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-12 pt-12 sm:px-6 sm:pt-16"><div className="text-center"><p className="text-xs font-black uppercase tracking-[.2em] text-violet">Celebremos el esfuerzo</p><h1 className="mt-3 font-display text-5xl font-black tracking-tight text-ink sm:text-6xl">Ranking de exploradores</h1><p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-ink/65">Aquí aparecen únicamente apodos y avatares. Nunca mostramos nombres completos ni información privada.</p></div><div className="mt-10 grid gap-6 lg:grid-cols-[.85fr_1.15fr]"><aside className="rounded-[1.7rem] bg-[#fff5cf] p-6"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-sun text-3xl">🏆</span><h2 className="mt-5 font-display text-3xl font-black text-ink">Jugar con alegría</h2><p className="mt-3 text-sm leading-6 text-ink/65">El ranking reconoce la constancia, pero cada aventura vale por lo que aprendes y compartes.</p><div className="mt-5 rounded-xl bg-white/75 p-4 text-sm font-bold text-ink/75">Los puntos, las temporadas y los empates se configurarán desde administración en una fase posterior.</div><Link href="/juegos" className="mt-6 inline-flex rounded-xl bg-ink px-4 py-3 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/25">Explorar juegos</Link></aside><RankingBoard players={leaderboard} /></div></section>
  );
}
