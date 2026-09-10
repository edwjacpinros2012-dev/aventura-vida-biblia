import type { CoverTheme } from "@/types/content";

const palettes: Record<CoverTheme, { base: string; accent: string; horizon: string; character: string }> = {
  forest: { base: "from-[#5c48bb] via-[#625ce5] to-[#9b9bf5]", accent: "bg-[#ffd452]", horizon: "bg-[#2c956b]", character: "🦊" },
  sky: { base: "from-[#4ab5eb] via-[#78d1f4] to-[#cff3ff]", accent: "bg-[#fff2a7]", horizon: "bg-[#4fa482]", character: "🦉" },
  sunset: { base: "from-[#ff9273] via-[#ffba72] to-[#ffe4a4]", accent: "bg-[#fff7ca]", horizon: "bg-[#7063c8]", character: "✦" },
  night: { base: "from-[#162455] via-[#314783] to-[#765dba]", accent: "bg-[#ffe078]", horizon: "bg-[#203e68]", character: "🦋" },
  river: { base: "from-[#288fbb] via-[#65c9de] to-[#d2f4df]", accent: "bg-[#ffe18e]", horizon: "bg-[#2b9073]", character: "🦦" },
  garden: { base: "from-[#6ebd77] via-[#a8d87f] to-[#e6efa2]", accent: "bg-[#ffe26e]", horizon: "bg-[#41945e]", character: "🌻" },
};

export function GameCover({ theme, className = "", large = false }: { theme: CoverTheme; className?: string; large?: boolean }) {
  const palette = palettes[theme];
  return (
    <div className={`relative isolate overflow-hidden bg-gradient-to-br ${palette.base} ${className}`} aria-hidden="true">
      <span className={`absolute ${large ? "right-[16%] top-[16%] h-24 w-24 md:h-32 md:w-32" : "right-[16%] top-[15%] h-14 w-14"} rounded-full ${palette.accent} opacity-95 shadow-[0_0_35px_rgba(255,255,255,.45)]`} />
      <span className="absolute left-[8%] top-[20%] text-2xl opacity-80">✦</span>
      <span className="absolute right-[8%] top-[43%] text-lg opacity-70">✧</span>
      <span className={`absolute -bottom-8 left-[-6%] h-24 w-[62%] rotate-[-7deg] rounded-[100%] ${palette.horizon} opacity-90`} />
      <span className={`absolute -bottom-10 right-[-12%] h-28 w-[78%] rotate-[8deg] rounded-[100%] ${palette.horizon} opacity-75`} />
      <span className={`absolute bottom-[11%] left-[38%] grid ${large ? "h-20 w-20 text-5xl md:h-24 md:w-24 md:text-6xl" : "h-12 w-12 text-3xl"} place-items-center rounded-[45%] bg-white/88 shadow-lg backdrop-blur-sm`}>{palette.character}</span>
      <span className="absolute bottom-[10%] left-[11%] h-8 w-3 rounded-full bg-white/45" />
      <span className="absolute bottom-[15%] right-[12%] h-6 w-2 rounded-full bg-white/40" />
    </div>
  );
}
