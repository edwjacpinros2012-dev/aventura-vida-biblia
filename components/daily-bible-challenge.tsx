"use client";

import Link from "next/link";
import { useState } from "react";
import { CharacterAvatar } from "@/components/character-avatar";
import { PlatformShareButton } from "@/components/platform-share-button";
import { usePlayerProgress } from "@/components/player-progress-provider";
import { avatarFallbackFor } from "@/lib/characters/catalog";
import type { DailyBibleChallenge as DailyChallenge } from "@/lib/daily-bible-challenge";

export function DailyBibleChallenge({ challenge }: { challenge: DailyChallenge }) {
  const { completeDailyChallenge, confirmDailyChallenge, identity, progress } = usePlayerProgress();
  const [step, setStep] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [practicing, setPracticing] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const alreadyClaimed = progress.dailyChallengeIds.includes(challenge.id);
  const question = challenge.questions[step];
  const correct = choice === question.correct;

  const restart = () => { setStep(0); setChoice(null); setFinished(false); setPracticing(true); setClaimError(null); };
  const next = async () => {
    if (!correct) { setChoice(null); return; }
    if (step + 1 < challenge.questions.length) { setStep((current) => current + 1); setChoice(null); return; }
    if (!alreadyClaimed) {
      try {
        if (identity.authenticated) await confirmDailyChallenge(challenge.id);
        else completeDailyChallenge({ gameId: challenge.id, points: challenge.rewardPoints, xp: challenge.rewardXp, verseReference: challenge.verse.reference });
      } catch (error) {
        setClaimError(error instanceof Error ? error.message : "No pudimos confirmar la recompensa.");
        return;
      }
    }
    setFinished(true);
  };

  if (finished || (alreadyClaimed && !practicing)) return <section className="av-panel mt-6 overflow-hidden rounded-[1.8rem] p-6 text-center shadow-card sm:p-8"><CharacterAvatar avatarKey={identity.avatarKey} fallback={avatarFallbackFor(identity.avatarKey)} alt={`Avatar de ${identity.nickname}`} imageSizes="72px" className="mx-auto grid h-20 w-20 place-items-center rounded-[1.5rem] border border-[#f5bd4d]/60 bg-[#0b3542]" /><p className="mt-5 text-xs font-black uppercase tracking-[.18em] text-[#67e5e0]">Nivel diario {challenge.edition}</p><h2 className="mt-2 font-display text-3xl font-black text-[#f5e5b9]">{alreadyClaimed && !finished ? "Ya recibiste la recompensa de hoy" : "¡Nivel diario completado!"}</h2><p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-6 text-white/70">{finished && !practicing ? identity.authenticated ? `Tu cuenta confirmó +${challenge.rewardXp} XP y +${challenge.rewardPoints} puntos.` : `Sumaste +${challenge.rewardXp} XP y +${challenge.rewardPoints} puntos en este dispositivo.` : "Terminaste una práctica. La recompensa de este día ya fue guardada una sola vez; mañana aparecerá una ruta bíblica diferente."}</p><div className="mx-auto mt-6 max-w-sm rounded-2xl border border-teal-100/15 bg-[#061923]/55 p-4 text-left"><p className="text-xs font-black uppercase tracking-[.16em] text-[#f5bd4d]">Palabra para recordar</p><p className="mt-2 font-display text-xl font-black text-[#f5e5b9]">{challenge.verse.reference}</p><p className="mt-2 text-sm leading-6 text-white/70">“{challenge.verse.text}”</p></div><div className="mt-6 flex flex-wrap justify-center gap-3"><button type="button" onClick={restart} className="av-gold-button rounded-xl px-5 py-3 text-sm font-extrabold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f5bd4d]/35">Practicar de nuevo</button><Link href={`/juegos/${challenge.gameSlug}/jugar`} className="av-teal-button rounded-xl px-5 py-3 text-sm font-extrabold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-100/30">Abrir {challenge.gameName}</Link><PlatformShareButton compact /></div></section>;

  return <section className="av-panel mt-6 overflow-hidden rounded-[1.8rem] shadow-card"><div className="border-b border-teal-100/15 bg-[radial-gradient(circle_at_85%_0%,rgba(245,189,77,.2),transparent_28%),linear-gradient(135deg,#0b4050,#061923)] p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#67e5e0]">Nivel bíblico automático · {challenge.dateLabel}</p><h2 className="mt-2 font-display text-3xl font-black text-[#f5e5b9]">{challenge.icon} {challenge.title}</h2><p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">{challenge.description}</p></div><span className="rounded-full border border-[#f5bd4d]/35 bg-[#f5bd4d]/10 px-4 py-2 text-sm font-black text-[#f5e5b9]">{step + 1}/{challenge.questions.length}</span></div><div className="mt-5 h-2.5 overflow-hidden rounded-full av-progress"><span style={{ width: `${(step / challenge.questions.length) * 100}%` }} /></div></div><div className="p-5 sm:p-7"><p className="text-xs font-black uppercase tracking-[.16em] text-[#f5bd4d]">Paso {step + 1}: responde con calma</p><h3 className="mt-3 max-w-3xl font-display text-2xl font-black leading-tight text-[#f5e5b9] sm:text-3xl">{question.prompt}</h3><div className="mt-6 grid gap-3 md:grid-cols-2">{question.options.map((option, index) => { const selected = choice === index; const style = selected && correct ? "border-[#74e2b0] bg-[#74e2b0]/15 text-[#d0fae3]" : selected ? "border-coral bg-coral/10 text-white" : "border-teal-100/15 bg-[#061923]/55 text-white/85 hover:border-[#f5bd4d]/65 hover:bg-white/10"; return <button key={option} type="button" disabled={choice !== null} onClick={() => { setChoice(index); setClaimError(null); }} className={`rounded-2xl border-2 p-4 text-left text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-100/25 ${style}`}><span className="mr-3 inline-grid h-7 w-7 place-items-center rounded-lg bg-white/10 text-xs font-black text-[#f5e5b9]">{String.fromCharCode(65 + index)}</span>{option}</button>; })}</div>{choice !== null && <div className={`mt-5 rounded-2xl p-4 text-sm font-bold leading-6 ${correct ? "bg-[#74e2b0]/12 text-[#c8f5da]" : "bg-coral/12 text-white"}`}><p>{correct ? `¡Muy bien! ${question.explanation}` : `Casi. ${question.explanation}`}</p><button type="button" onClick={() => void next()} className="av-gold-button mt-4 rounded-xl px-5 py-3 text-sm font-extrabold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f5bd4d]/35">{correct ? step + 1 === challenge.questions.length ? "Completar nivel" : "Siguiente paso" : "Intentar otra vez"}</button></div>}{claimError && <p role="alert" className="mt-4 rounded-xl bg-coral/10 p-3 text-sm font-bold text-[#ffb2a7]">{claimError}</p>}</div></section>;
}
