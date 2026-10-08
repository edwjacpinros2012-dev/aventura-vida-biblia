import Link from "next/link";
import { ArrowRight, Sparkle } from "@/components/icons";
import { GameCover } from "@/components/game-cover";
import type { Game } from "@/types/content";

const difficultyStyles = {
  Inicial: "bg-emerald-400/15 text-emerald-200",
  Explorador: "bg-amber-300/15 text-amber-200",
  Aventurero: "bg-rose-300/15 text-rose-200",
};

export function GameCard({
  game,
  compact = false,
}: {
  game: Game;
  compact?: boolean;
}) {
  return (
    <article className="group av-card overflow-hidden rounded-[1.45rem] transition-all hover:-translate-y-1 hover:brightness-110">
      <Link
        href={`/juegos/${game.slug}`}
        className="block outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-sun/50"
      >
        <GameCover
          theme={game.coverTheme}
          className={compact ? "h-36" : "h-44"}
        />
      </Link>

      <div className="p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full border border-teal-200/25 bg-teal-300/10 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-teal-100">
            {game.category}
          </span>

          {game.isNew && (
            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wide text-[#f5cf74]">
              <Sparkle className="h-3.5 w-3.5" />
              Nuevo
            </span>
          )}
        </div>

        <h3 className="mt-3 font-display text-xl font-black tracking-tight text-[#f5e5b9]">
          {game.name}
        </h3>

        <p className="mt-1 min-h-10 text-sm leading-5 text-white/65">
          {game.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
          <span
            className={`rounded-lg px-2 py-1 ${difficultyStyles[game.difficulty]}`}
          >
            {game.difficulty}
          </span>

          <span className="rounded-lg bg-white/10 px-2 py-1 text-white/65">
            {game.suggestedAge}
          </span>

          <span className="rounded-lg bg-[#f5bd4d]/20 px-2 py-1 text-[#f5dc9a]">
            +{game.xp} XP
          </span>
        </div>

        <Link
          href={
            game.isPlayable
              ? `/juegos/${game.slug}/jugar`
              : `/juegos/${game.slug}`
          }
          className="av-teal-button mt-5 inline-flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-extrabold outline-none focus-visible:ring-4 focus-visible:ring-teal-200/30"
        >
          {game.isPlayable ? "Jugar ahora" : "Ver aventura"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}