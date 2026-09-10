import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { GameCover } from "@/components/game-cover";
import type { Adventure } from "@/types/content";

export function AdventureCard({ adventure }: { adventure: Adventure }) {
  return (
    <article className="group overflow-hidden rounded-[1.6rem] border border-ink/5 bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-lift">
      <GameCover theme={adventure.coverTheme} className="h-48" />
      <div className="p-5"><span className="rounded-full bg-violet/10 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-violet">{adventure.badge}</span><h2 className="mt-3 font-display text-2xl font-black tracking-tight text-ink">{adventure.title}</h2><p className="mt-2 min-h-12 text-sm leading-6 text-ink/65">{adventure.summary}</p><div className="mt-4 flex items-center justify-between text-xs font-bold text-ink/60"><span>{adventure.chapters} capítulos</span>{adventure.progress ? <span>{adventure.progress}% explorado</span> : <span>Ruta nueva</span>}</div>{adventure.progress !== undefined && <div className="mt-2 h-2 overflow-hidden rounded-full bg-sky"><div className="h-full rounded-full bg-violet" style={{ width: `${adventure.progress}%` }} /></div>}<Link href={`/aventuras/${adventure.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-violet outline-none hover:underline focus-visible:ring-4 focus-visible:ring-violet/25">Ver aventura <ArrowRight className="h-4 w-4" /></Link></div>
    </article>
  );
}
