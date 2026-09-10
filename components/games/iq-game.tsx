"use client";

import { useState } from "react";
import { VictoryPanel, useGameCompletion } from "@/components/games/game-shell";

const puzzles = [
  { label: "Patrón de luz", prompt: "☀ · ⭐ · ☀ · ⭐ · ¿?", options: ["☀", "🛶", "🌱", "🐟"], correct: 0, explanation: "El patrón alterna sol y estrella." },
  { label: "Secuencia de cuidado", prompt: "Semilla → planta → fruto → ¿?", options: ["Compartir", "Esconder", "Romper", "Olvidar"], correct: 0, explanation: "El fruto puede convertirse en una oportunidad para compartir." },
  { label: "Asociación", prompt: "Una lámpara se relaciona con…", options: ["Luz y guía", "Ruido", "Velocidad", "Nieve"], correct: 0, explanation: "La lámpara es una imagen de luz y guía." },
  { label: "Acertijo amable", prompt: "No tiene alas, pero puede viajar de corazón a corazón. ¿Qué es?", options: ["Una palabra de ánimo", "Una piedra", "Una sombra", "Un candado"], correct: 0, explanation: "Una palabra de ánimo puede llegar lejos y hacer bien." },
];

export function IqGame() {
  const { result, finish, resetCompletion } = useGameCompletion("iq-bible");
  const [index, setIndex] = useState(0); const [selected, setSelected] = useState<number | null>(null); const [correct, setCorrect] = useState(0);
  const current = puzzles[index];
  const choose = (value: number) => { if (selected === null) setSelected(value); };
  const next = () => { const nextCorrect = correct + (selected === current.correct ? 1 : 0); if (index + 1 >= puzzles.length) { setCorrect(nextCorrect); finish({ points: 120 + nextCorrect * 65, xp: 70 + nextCorrect * 15 }); return; } setCorrect(nextCorrect); setIndex((value) => value + 1); setSelected(null); };
  const reset = () => { setIndex(0); setSelected(null); setCorrect(0); resetCompletion(); };
  const points = 120 + correct * 65; const xp = 70 + correct * 15;
  if (result) return <VictoryPanel title="¡Tu mente encontró las pistas!" description={`Respondiste ${correct} de ${puzzles.length} retos de lógica. ¡Sigue haciendo buenas preguntas!`} result={result} points={points} xp={xp} onPlayAgain={reset} />;
  return <div className="mx-auto mt-6 max-w-3xl rounded-[1.7rem] bg-white p-5 shadow-card sm:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><span className="rounded-full bg-violet/10 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-violet">Reto {index + 1} de {puzzles.length}</span><span className="text-sm font-bold text-ink/55">{correct} correctas</span></div><p className="mt-7 text-xs font-black uppercase tracking-[.18em] text-violet">{current.label}</p><h2 className="mt-3 font-display text-3xl font-black leading-tight text-ink">{current.prompt}</h2><div className="mt-7 grid gap-3 sm:grid-cols-2">{current.options.map((option, optionIndex) => <button key={option} type="button" disabled={selected !== null} onClick={() => choose(optionIndex)} className={`min-h-16 rounded-2xl border-2 p-4 text-left text-sm font-bold outline-none transition-all focus-visible:ring-4 focus-visible:ring-violet/25 ${selected === null ? "border-ink/5 bg-sky/40 hover:border-violet" : optionIndex === current.correct ? "border-leaf bg-leaf/10 text-[#147558]" : optionIndex === selected ? "border-coral bg-coral/10 text-coral" : "border-ink/5 text-ink/40"}`}>{option}</button>)}</div>{selected !== null && <div className={`mt-5 rounded-2xl p-4 text-sm leading-6 ${selected === current.correct ? "bg-leaf/10 text-[#147558]" : "bg-coral/10 text-[#af3f3b]"}`}><strong>{selected === current.correct ? "¡Buena lógica!" : "Una pista más:"}</strong><p className="mt-1 font-semibold">{current.explanation}</p></div>}{selected !== null && <button type="button" onClick={next} className="mt-6 rounded-xl bg-ink px-5 py-3 text-sm font-extrabold text-white hover:bg-violet focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/25">{index + 1 === puzzles.length ? "Ver recompensa" : "Siguiente reto"}</button>}</div>;
}
