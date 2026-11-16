import type { CoverTheme } from "@/types/content";

type Scene = {
  sky: string;
  glow: string;
  mountain: string;
  ground: string;
  landmark: string;
  landmarkTone: string;
  sparkles: string;
};

const scenes: Record<CoverTheme, Scene> = {
  forest: { sky: "from-[#163f54] via-[#156b70] to-[#78b770]", glow: "bg-[#f9d86b]", mountain: "bg-[#165f58]", ground: "bg-[#163f44]", landmark: "✦", landmarkTone: "text-[#f5bd4d]", sparkles: "✧" },
  sky: { sky: "from-[#0b3756] via-[#2382a5] to-[#9cdbc2]", glow: "bg-[#fff0a1]", mountain: "bg-[#18737c]", ground: "bg-[#1d5b61]", landmark: "☁", landmarkTone: "text-white", sparkles: "✦" },
  sunset: { sky: "from-[#562c63] via-[#d06776] to-[#f0ae61]", glow: "bg-[#fff0ae]", mountain: "bg-[#734569]", ground: "bg-[#274e51]", landmark: "✦", landmarkTone: "text-[#fff0ae]", sparkles: "✧" },
  night: { sky: "from-[#071e3e] via-[#174b71] to-[#347490]", glow: "bg-[#f8da75]", mountain: "bg-[#112e5a]", ground: "bg-[#0a3041]", landmark: "✦", landmarkTone: "text-[#f9dd7c]", sparkles: "✦" },
  river: { sky: "from-[#0a4f6b] via-[#1d9ab0] to-[#a2e0ce]", glow: "bg-[#ffe18e]", mountain: "bg-[#197e82]", ground: "bg-[#115567]", landmark: "⌁", landmarkTone: "text-white", sparkles: "✦" },
  garden: { sky: "from-[#194e50] via-[#398b68] to-[#abd06d]", glow: "bg-[#fee27b]", mountain: "bg-[#32805d]", ground: "bg-[#175641]", landmark: "✦", landmarkTone: "text-[#fff1a7]", sparkles: "❋" },
};

const individualCovers = new Set([
  "little-big-heroes", "vocales-de-luz", "memoria-biblica", "preguntas-biblicas",
  "recolector-de-luz", "guardianes-del-jardin", "el-camino-del-rio", "mapa-de-estrellas",
  "laberinto-biblico", "sopa-de-letras-biblica", "colorear-biblico",
  "historias-biblicas-interactivas", "iq-biblico", "aprende-el-versiculo",
  "rompecabezas-biblico",
]);

/**
 * Usa una ilustración vectorial original por juego y conserva una escena CSS
 * de respaldo para aventuras u otras vistas que no pertenezcan al catálogo.
 */
export function GameCover({
  theme,
  gameId,
  className = "",
  large = false,
}: {
  theme: CoverTheme;
  gameId?: string;
  className?: string;
  large?: boolean;
}) {
  const scene = scenes[theme];
  const hasIndividualCover = gameId ? individualCovers.has(gameId) : false;

  if (hasIndividualCover && gameId) {
    return (
      <div
        className={`relative isolate overflow-hidden bg-gradient-to-br ${scene.sky} ${className}`}
        style={{ backgroundImage: `url("/assets/game-covers/${gameId}.svg")`, backgroundSize: "cover", backgroundPosition: "center" }}
        aria-hidden="true"
      >
        <span className="absolute inset-0 bg-gradient-to-t from-[#071b2c]/35 via-transparent to-white/5" />
        <span className="absolute inset-0 ring-1 ring-inset ring-white/10" />
      </div>
    );
  }

  return (
    <div className={`relative isolate overflow-hidden bg-gradient-to-br ${scene.sky} ${className}`} aria-hidden="true">
      <span className={`absolute ${large ? "right-[13%] top-[11%] h-24 w-24 md:h-32 md:w-32" : "right-[14%] top-[13%] h-14 w-14"} rounded-full ${scene.glow} opacity-95 shadow-[0_0_45px_rgba(255,240,174,.6)]`} />
      <span className="absolute left-[9%] top-[16%] text-xl text-white/70">{scene.sparkles}</span>
      <span className="absolute right-[31%] top-[29%] text-sm text-white/60">✧</span>
      <span className="absolute left-[52%] top-[10%] text-xs text-white/70">✦</span>
      <span className={`absolute -bottom-[17%] -left-[11%] h-[58%] w-[66%] rotate-[-13deg] rounded-[55%] ${scene.mountain} opacity-95`} />
      <span className={`absolute -bottom-[20%] right-[-14%] h-[65%] w-[78%] rotate-[11deg] rounded-[55%] ${scene.mountain} opacity-85`} />
      <span className={`absolute inset-x-0 bottom-0 h-[28%] ${scene.ground} opacity-95`} />
      <span className="absolute bottom-[15%] left-[15%] h-12 w-2 rounded-t-full bg-white/30" />
      <span className="absolute bottom-[16%] left-[20%] h-8 w-2 rounded-t-full bg-white/25" />
      <span className="absolute bottom-[14%] right-[18%] h-14 w-2 rounded-t-full bg-white/30" />
      <span className={`absolute bottom-[16%] left-1/2 grid -translate-x-1/2 place-items-center rounded-[42%] border border-white/45 bg-[#092a38]/75 font-display font-black shadow-[0_8px_18px_rgba(0,0,0,.3)] ${large ? "h-20 w-20 text-5xl md:h-24 md:w-24 md:text-6xl" : "h-12 w-12 text-3xl"} ${scene.landmarkTone}`}>{scene.landmark}</span>
      <span className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,.13),transparent_28%,transparent_72%,rgba(0,0,0,.2))]" />
    </div>
  );
}
