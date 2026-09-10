import Link from "next/link";
import { ArrowRight, Sparkle } from "@/components/icons";
import { GameCover } from "@/components/game-cover";
import type { Game } from "@/types/content";

const difficultyStyles = { Inicial: "bg-leaf/10 text-leaf", Explorador: "bg-sun/25 text-[#9a6900]", Aventurero: "bg-coral/10 text-[#c74842]" };

export function GameCard({ game, compact = false }: { game: Game; compact?: boolean }) {
  return (
    <article className="group overflow-hidden rounded-[1.45rem] border border-ink/5 bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-lift">
      <Link href={`/juegos/${game.slug}`} className="block outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-violet/50">
        <GameCover theme={game.coverTheme} className={compact ? "h-36" : "h-44"} />
      </Link>
      <div className="p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-sky px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-ink/75">{game.category}</span>
          {game.isNew && <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wide text-coral"><Sparkle className="h-3.5 w-3.5" /> Nuevo</span>}
        </div>
        <h3 className="mt-3 font-display text-xl font-black tracking-tight text-ink">{game.name}</h3>
        <p className="mt-1 min-h-10 text-sm leading-5 text-ink/65">{game.description}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
          <span className={`rounded-lg px-2 py-1 ${difficultyStyles[game.difficulty]}`}>{game.difficulty}</span>
          <span className="rounded-lg bg-ink/5 px-2 py-1 text-ink/60">{game.suggestedAge}</span>
          <span className="rounded-lg bg-sun/25 px-2 py-1 text-ink">+{game.xp} XP</span>
        </div>
        <Link href={game.isPlayable ? `/juegos/${game.slug}/jugar` : `/juegos/${game.slug}`} className="mt-5 inline-flex w-full items-center justify-between rounded-xl bg-ink px-4 py-3 text-sm font-extrabold text-white outline-none transition-colors hover:bg-violet focus-visible:ring-4 focus-visible:ring-violet/25">
          {game.isPlayable ? "Jugar ahora" : "Ver aventura"} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
