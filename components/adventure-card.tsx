import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { GameCover } from "@/components/game-cover";
import type { Adventure } from "@/types/content";

export function AdventureCard({ adventure }: { adventure: Adventure }) {
  return (
    <article className="group av-card overflow-hidden rounded-[1.6rem] transition-all hover:-translate-y-1 hover:brightness-110">
      <GameCover theme={adventure.coverTheme} className="h-48" />
      <div className="p-5"><span className="rounded-full border border-teal-100/25 bg-teal-300/10 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-teal-100">{adventure.badge}</span><h2 className="mt-3 font-display text-2xl font-black tracking-tight text-[#f5e5b9]">{adventure.title}</h2><p className="mt-2 min-h-12 text-sm leading-6 text-white/65">{adventure.summary}</p><div className="mt-4 flex items-center justify-between text-xs font-bold text-white/55"><span>{adventure.chapters} capítulos</span>{adventure.progress ? <span>{adventure.progress}% explorado</span> : <span>Ruta nueva</span>}</div>{adventure.progress !== undefined && <div className="av-progress mt-2 h-2 overflow-hidden rounded-full"><span style={{ width: `${adventure.progress}%` }} /></div>}<Link href={`/aventuras/${adventure.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[#67e5e0] outline-none hover:underline focus-visible:ring-4 focus-visible:ring-teal-100/25">Ver aventura <ArrowRight className="h-4 w-4" /></Link></div>
    </article>
  );
}
