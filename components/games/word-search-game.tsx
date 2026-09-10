"use client";

import { useEffect, useMemo, useState } from "react";
import { VictoryPanel, useGameCompletion } from "@/components/games/game-shell";

const letterRows = ["AMORQZKLPV", "FENUBESDAR", "LUZCAMINOS", "PAZSEMILLAS", "DAVIDRUTAS", "NOEESPERAN", "VIDAESTRELL", "REYAMIGOSX", "ORACIONFEY", "SERVICIOLU"];
const levels = {
  Inicial: ["AMOR", "FE", "LUZ", "PAZ"],
  Explorador: ["AMOR", "FE", "LUZ", "PAZ", "DAVID", "NOE"],
} as const;

export function WordSearchGame() {
  const { result, finish, resetCompletion } = useGameCompletion("word-search-bible");
  const [difficulty, setDifficulty] = useState<keyof typeof levels>("Inicial");
  const [timerOn, setTimerOn] = useState(true);
  const [seconds, setSeconds] = useState(180);
  const [selected, setSelected] = useState<number[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("Toca las letras en orden para formar una palabra.");
  const targetWords = levels[difficulty];
  const letters = useMemo(() => letterRows.join("").split(""), []);

  useEffect(() => {
    if (!timerOn || result || seconds <= 0) return;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [result, seconds, timerOn]);

  const reset = (nextDifficulty = difficulty) => {
    setDifficulty(nextDifficulty); setSeconds(nextDifficulty === "Inicial" ? 180 : 240); setSelected([]); setFound([]); setScore(0); setMessage("Toca las letras en orden para formar una palabra."); resetCompletion();
  };

  const chooseLetter = (index: number) => {
    if (result || seconds === 0 || selected.includes(index)) return;
    const candidate = [...selected, index];
    const text = candidate.map((item) => letters[item]).join("");
    const reverse = text.split("").reverse().join("");
    const matched = targetWords.find((word) => word === text || word === reverse);
    if (matched && !found.includes(matched)) {
      const nextFound = [...found, matched];
      const nextScore = score + 50;
      setFound(nextFound); setScore(nextScore); setSelected([]); setMessage(`¡Encontraste ${matched}!`);
      if (nextFound.length === targetWords.length) finish({ points: nextScore + Math.floor(seconds / 3), xp: difficulty === "Inicial" ? 90 : 120 });
      return;
    }
    const isPrefix = targetWords.some((word) => word.startsWith(text) || word.startsWith(reverse));
    if (isPrefix) { setSelected(candidate); setMessage(`Buscando: ${text}`); return; }
    setSelected([]); setMessage("Esa ruta no forma una palabra del nivel. ¡Intenta otra vez!");
  };

  const time = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  if (result) return <VictoryPanel description="Encontraste todas las palabras y encendiste el mapa con nuevas ideas." result={result} points={score + Math.floor(seconds / 3)} xp={difficulty === "Inicial" ? 90 : 120} onPlayAgain={() => reset()} />;
  return <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]"><div className="rounded-[1.7rem] bg-white p-4 shadow-card sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.16em] text-violet">Sopa de letras</p><p className="mt-1 text-sm font-bold text-ink/65">{message}</p></div>{timerOn && <span className={`rounded-xl px-3 py-2 font-display text-xl font-black ${seconds < 30 ? "bg-coral/15 text-coral" : "bg-sky text-ink"}`}>⏱ {time}</span>}</div><div className="mx-auto mt-6 grid max-w-xl grid-cols-10 gap-1.5 rounded-2xl bg-[#eef7ff] p-2 sm:gap-2 sm:p-3">{letters.map((letter, index) => <button type="button" key={`${letter}-${index}`} onClick={() => chooseLetter(index)} aria-label={`Letra ${letter}`} className={`aspect-square min-w-0 rounded-lg text-sm font-black outline-none transition-all focus-visible:ring-4 focus-visible:ring-violet/35 sm:text-base ${selected.includes(index) ? "bg-violet text-white scale-95" : "bg-white text-ink hover:bg-sun/50"}`}>{letter}</button>)}</div></div><aside className="rounded-[1.7rem] bg-[#edfaff] p-5 shadow-card"><p className="text-xs font-black uppercase tracking-[.16em] text-violet">Nivel y progreso</p><label className="mt-4 block text-sm font-bold text-ink">Dificultad<select value={difficulty} onChange={(event) => reset(event.target.value as keyof typeof levels)} className="mt-2 h-11 w-full rounded-xl border border-ink/10 bg-white px-3 font-bold outline-none focus:border-violet focus:ring-4 focus:ring-violet/15"><option>Inicial</option><option>Explorador</option></select></label><label className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-white p-3 text-sm font-bold text-ink"><span>Temporizador</span><input type="checkbox" checked={timerOn} onChange={(event) => setTimerOn(event.target.checked)} className="h-5 w-5 accent-violet" /></label><div className="mt-5"><p className="text-sm font-black text-ink">Palabras</p><div className="mt-3 grid grid-cols-2 gap-2">{targetWords.map((word) => <span key={word} className={`rounded-lg px-2.5 py-2 text-center text-xs font-black ${found.includes(word) ? "bg-leaf text-white" : "bg-white text-ink/60"}`}>{found.includes(word) ? "✓ " : ""}{word}</span>)}</div></div><p className="mt-5 rounded-xl bg-white p-3 text-sm font-bold text-violet">{score} puntos</p><button type="button" onClick={() => reset()} className="mt-4 w-full rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm font-extrabold text-ink hover:bg-sky focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/25">Reiniciar nivel</button></aside></div>;
}
