import Link from "next/link";
import { DailyBibleChallenge } from "@/components/daily-bible-challenge";
import { PlatformShareButton } from "@/components/platform-share-button";
import { ArrowRight, CheckIcon } from "@/components/icons";
import { publishedDailyBibleChallengeFor } from "@/lib/content-automation/daily-content-service";

export const dynamic = "force-dynamic";

export default async function MissionPage() {
  // Lee la edición publicada cuando hay base de datos; conserva una plantilla
  // bíblica validada como respaldo para modo visitante y sin conexión.
  const mission = await publishedDailyBibleChallengeFor();
  return <section className="av-page"><div className="mx-auto max-w-6xl px-4 pb-12 pt-12 sm:px-6 sm:pt-16">
    <div className="av-panel overflow-hidden rounded-[2rem] p-6 text-white shadow-lift sm:p-10"><div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center"><div><p className="text-xs font-black uppercase tracking-[.2em] text-[#f5bd4d]">Misión diaria · nivel automático</p><h1 className="av-title mt-3 font-display text-5xl font-black tracking-tight sm:text-6xl">{mission.title}</h1><p className="mt-4 max-w-2xl text-base leading-7 text-white/70">{mission.description}</p><p className="mt-4 text-sm font-bold text-[#67e5e0]">Nueva ruta: {mission.dateLabel} · Edición {mission.edition}</p><PlatformShareButton className="mt-5" /></div><div className="grid h-28 w-28 place-items-center rounded-[2rem] border border-sun/50 bg-[#0c3a49] text-5xl shadow-card">{mission.icon}</div></div><div className="mt-8 grid gap-3 border-t av-divider pt-6 sm:grid-cols-3"><div className="av-chip rounded-xl p-4"><p className="text-xs font-black uppercase tracking-wide text-white/55">Objetivo</p><p className="mt-2 font-bold">{mission.objective}</p></div><div className="av-chip rounded-xl p-4"><p className="text-xs font-black uppercase tracking-wide text-white/55">Recompensa</p><p className="mt-2 font-bold text-[#f5cf74]">+{mission.rewardXp} XP</p></div><div className="av-chip rounded-xl p-4"><p className="text-xs font-black uppercase tracking-wide text-white/55">Puntos</p><p className="mt-2 font-bold text-[#f5cf74]">+{mission.rewardPoints} puntos</p></div></div></div>
    <DailyBibleChallenge challenge={mission} />
    <div className="mt-10 grid gap-6 md:grid-cols-[1.1fr_.9fr]"><div><h2 className="av-title font-display text-3xl font-black">Cómo avanzar</h2><div className="mt-5 grid gap-3">{["Lee la pregunta y elige una respuesta.", "Descubre la explicación bíblica al avanzar.", "Completa los tres pasos para recibir la recompensa diaria."].map((step, index) => <div key={step} className="av-card flex items-center gap-4 rounded-2xl p-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#0d8795] text-sm font-black text-white">{index + 1}</span><p className="font-bold text-white/85">{step}</p><CheckIcon className="ml-auto h-5 w-5 text-[#74e2b0]" /></div>)}</div></div><aside className="av-panel-soft rounded-[1.7rem] p-6"><p className="text-xs font-black uppercase tracking-[.18em] text-[#67e5e0]">Juego relacionado</p><h2 className="mt-3 font-display text-2xl font-black text-[#f5e5b9]">{mission.gameName}</h2><p className="mt-2 text-sm leading-6 text-white/65">Cuando termines el nivel diario, continúa practicando en el juego relacionado.</p><Link href={`/juegos/${mission.gameSlug}/jugar`} className="av-gold-button mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold">Jugar ahora <ArrowRight className="h-4 w-4" /></Link></aside></div>
  </div></section>;
}
