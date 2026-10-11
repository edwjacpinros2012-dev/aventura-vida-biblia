"use client";

import { useMemo, useState } from "react";
import { VictoryPanel, useGameCompletion } from "@/components/games/game-shell";

type Vowel = {
  letter: "A" | "E" | "I" | "O" | "U";
  color: string;
  examples: Array<{ word: string; emoji: string }>;
};

const vowels: readonly Vowel[] = [
  { letter: "A", color: "from-[#ffb26b] to-[#e96765]", examples: [{ word: "Amor", emoji: "💗" }, { word: "Arca", emoji: "⛵" }] },
  { letter: "E", color: "from-[#b285ec] to-[#7555c7]", examples: [{ word: "Estrella", emoji: "⭐" }, { word: "Escudo", emoji: "🛡️" }] },
  { letter: "I", color: "from-[#48c9dc] to-[#2783b1]", examples: [{ word: "Iglesia", emoji: "⛪" }, { word: "Isla", emoji: "🏝️" }] },
  { letter: "O", color: "from-[#f5dc67] to-[#e7a839]", examples: [{ word: "Oración", emoji: "🙏" }, { word: "Oveja", emoji: "🐑" }] },
  { letter: "U", color: "from-[#78d791] to-[#279673]", examples: [{ word: "Uva", emoji: "🍇" }, { word: "Uno", emoji: "1️⃣" }] },
];

function shuffle<T>(items: readonly T[], seed: number) {
  const result = [...items];
  let value = Math.max(1, seed * 9301 + 49297);
  for (let index = result.length - 1; index > 0; index -= 1) {
    value = (value * 9301 + 49297) % 233280;
    const swapIndex = Math.floor((value / 233280) * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function speak(vowel: Vowel, example: { word: string }) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const phrase = new SpeechSynthesisUtterance(`La vocal ${vowel.letter}. ${vowel.letter} como ${example.word}.`);
  phrase.lang = "es-ES";
  phrase.rate = 0.72;
  phrase.pitch = 1.15;
  window.speechSynthesis.speak(phrase);
}

/** Actividad segura para primeras palabras: no usa micrófono ni almacena voz. */
export function VowelsGame() {
  const { result, finish, resetCompletion } = useGameCompletion("vowel-light");
  const [session, setSession] = useState(1);
  const [round, setRound] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const sequence = useMemo(() => shuffle(vowels, session), [session]);
  const options = useMemo(() => shuffle(vowels, session * 19 + round), [round, session]);
  const target = sequence[round];
  const example = target.examples[(session + round) % target.examples.length];
  const points = correct * 30;
  const complete = choice === target.letter;

  const choose = (letter: string) => {
    if (choice || result) return;
    setChoice(letter);
    if (letter === target.letter) setCorrect((value) => value + 1);
  };

  const next = () => {
    if (!complete) { setChoice(null); return; }
    if (round + 1 === sequence.length) {
      finish({ points: points + 30, xp: 60 });
      return;
    }
    setRound((value) => value + 1);
    setChoice(null);
  };

  const replay = () => {
    window.speechSynthesis?.cancel();
    setSession((value) => value + 1);
    setRound(0);
    setChoice(null);
    setCorrect(0);
    resetCompletion();
  };

  if (result) return <VictoryPanel title="¡Las vocales brillan contigo!" description="Reconociste las cinco vocales. Juega otra vez para escuchar nuevos ejemplos y seguir practicando con alegría." result={result} points={150} xp={60} onPlayAgain={replay} actionLabel="Otra ronda de vocales" />;

  return <div className="av-panel mt-6 overflow-hidden rounded-[1.8rem] p-4 shadow-card sm:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#67e5e0]">Primeras palabras · ronda {session}</p><h2 className="mt-1 font-display text-3xl font-black text-[#f5e5b9]">Escucha y encuentra la vocal</h2></div><span className="rounded-full bg-[#f5bd4d] px-4 py-2 text-sm font-black text-[#061923]">{round + 1} / {sequence.length}</span></div><p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/70">Toca <strong className="text-[#f5cf74]">Escuchar</strong>, repite la vocal en voz alta con tu familia y encuentra la letra grande. No usamos micrófono ni guardamos voces.</p><div className="mt-6 grid gap-5 md:grid-cols-[minmax(0,1fr)_220px]"><section className={`relative overflow-hidden rounded-[1.7rem] bg-gradient-to-br ${target.color} p-6 text-center shadow-card sm:p-8`}><span className="absolute -right-8 -top-10 text-[10rem] text-white/10">{target.letter}</span><p className="relative text-sm font-black uppercase tracking-[.2em] text-white/80">Hoy practicamos</p><p className="relative mt-2 font-display text-[8rem] font-black leading-none text-white drop-shadow-[0_6px_0_rgba(0,0,0,.16)] sm:text-[10rem]">{target.letter}</p><div className="relative mt-3 inline-flex items-center gap-3 rounded-2xl bg-white/20 px-4 py-3 text-left backdrop-blur"><span className="text-3xl">{example.emoji}</span><span><span className="block text-xs font-black uppercase tracking-wide text-white/70">{target.letter} como</span><strong className="text-xl text-white">{example.word}</strong></span></div><button type="button" onClick={() => speak(target, example)} className="relative mt-6 rounded-xl border border-white/45 bg-white/20 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-white/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/35">🔊 Escuchar {target.letter}</button></section><aside className="rounded-[1.7rem] border border-teal-100/15 bg-[#061923]/60 p-5"><p className="text-xs font-black uppercase tracking-[.16em] text-[#67e5e0]">Pequeño progreso</p><div className="mt-4 h-3 overflow-hidden rounded-full av-progress"><span style={{ width: `${round / sequence.length * 100}%` }} /></div><p className="mt-3 text-sm font-bold text-white/65">{correct} vocal{correct === 1 ? "" : "es"} encontradas</p><p className="mt-6 rounded-xl bg-white/10 p-3 text-xs font-bold leading-5 text-white/70">Cada nueva ronda cambia el orden y alterna los ejemplos para que puedas practicar muchas veces.</p><button type="button" onClick={replay} className="mt-5 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-extrabold text-white hover:bg-white/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-100/25">Cambiar ronda</button></aside></div><section className="mt-6"><p className="text-center text-sm font-extrabold text-[#f5e5b9]">¿Dónde está la vocal {target.letter}?</p><div className="mx-auto mt-4 grid max-w-3xl grid-cols-5 gap-2 sm:gap-4">{options.map((vowel) => { const selected = choice === vowel.letter; const isCorrect = vowel.letter === target.letter; const style = selected && isCorrect ? "border-[#74e2b0] bg-[#74e2b0] text-[#061923]" : selected ? "border-coral bg-coral/20 text-white" : "border-white/15 bg-[#061923]/60 text-[#f5e5b9] hover:border-[#f5bd4d]/70 hover:bg-white/10"; return <button key={vowel.letter} type="button" disabled={choice !== null} onClick={() => choose(vowel.letter)} aria-label={`Elegir vocal ${vowel.letter}`} className={`aspect-square rounded-2xl border-2 font-display text-4xl font-black transition sm:text-6xl ${style} disabled:cursor-default focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-100/25`}>{vowel.letter}</button>; })}</div>{choice && <div className={`mx-auto mt-5 max-w-2xl rounded-2xl p-4 text-center text-sm font-bold ${complete ? "bg-[#74e2b0]/15 text-[#a6f0c9]" : "bg-coral/15 text-white"}`}><p>{complete ? `¡Muy bien! ${target.letter} como ${example.word}.` : `Casi. La letra que buscamos es ${target.letter}. Escúchala y prueba de nuevo.`}</p><button type="button" onClick={next} className="av-gold-button mt-4 rounded-xl px-5 py-3 text-sm font-extrabold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f5bd4d]/30">{complete ? round + 1 === sequence.length ? "Ver recompensa" : "Siguiente vocal" : "Intentar otra vez"}</button></div>}</section></div>;
}
