"use client";

import { useMemo, useState } from "react";
import { VictoryPanel, useGameCompletion } from "@/components/games/game-shell";

type Question = { category: "Historias" | "Valores" | "Versículos"; difficulty: "Inicial" | "Explorador"; question: string; options: string[]; correct: number; explanation: string };

const questions: Question[] = [
  { category: "Historias", difficulty: "Inicial", question: "¿Quién construyó un arca para cuidar a su familia y a los animales?", options: ["Noé", "David", "Moisés", "Jonás"], correct: 0, explanation: "Noé siguió las instrucciones de Dios y preparó el arca." },
  { category: "Historias", difficulty: "Inicial", question: "¿Qué abrió el mar para que el pueblo pudiera pasar?", options: ["Una gran roca", "El viento de Dios", "Un puente", "Una escalera"], correct: 1, explanation: "El relato cuenta que Dios abrió un camino en el mar para su pueblo." },
  { category: "Valores", difficulty: "Inicial", question: "Cuando alguien necesita ayuda, una respuesta amable es…", options: ["Ignorarlo", "Ayudar con cuidado", "Reírse", "Esconderse"], correct: 1, explanation: "Servir y cuidar a otros es una manera práctica de mostrar amor." },
  { category: "Valores", difficulty: "Explorador", question: "¿Qué ayuda a tomar una buena decisión cuando estás molesto?", options: ["Apurarse", "Respirar y pensar", "Gritar", "Culpar"], correct: 1, explanation: "Pausar, orar y pensar nos ayuda a responder con sabiduría." },
  { category: "Versículos", difficulty: "Inicial", question: "¿Cuál de estas ideas aparece muchas veces en los versículos de ánimo?", options: ["No tengas miedo", "Nunca compartas", "Corre sin mirar", "No preguntes"], correct: 0, explanation: "La Biblia anima a confiar y a no vivir dominados por el miedo." },
  { category: "Versículos", difficulty: "Explorador", question: "Completa la idea: “Tu palabra es lámpara a mis…”", options: ["manos", "pasos", "juegos", "sueños"], correct: 1, explanation: "El Salmo 119 usa una lámpara como imagen de guía para nuestros pasos." },
];

export function QuizGame() {
  const { result, finish, resetCompletion } = useGameCompletion("quiz-adventure");
  const [category, setCategory] = useState<Question["category"]>("Historias");
  const [difficulty, setDifficulty] = useState<Question["difficulty"]>("Inicial");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const filtered = useMemo(() => {
    const matches = questions.filter((question) => question.category === category && question.difficulty === difficulty);
    return matches.length >= 2 ? matches : questions.filter((question) => question.category === category).slice(0, 2);
  }, [category, difficulty]);
  const current = filtered[index % filtered.length];
  const answered = selected !== null;
  const reset = () => { setIndex(0); setSelected(null); setCorrectCount(0); resetCompletion(); };
  const choose = (choice: number) => { if (!answered) setSelected(choice); };
  const next = () => {
    const nextCorrect = correctCount + (selected === current.correct ? 1 : 0);
    if (index + 1 >= filtered.length) { const points = 80 + nextCorrect * 55; finish({ points, xp: 70 + nextCorrect * 20 }); setCorrectCount(nextCorrect); return; }
    setCorrectCount(nextCorrect); setIndex((value) => value + 1); setSelected(null);
  };
  const points = 80 + correctCount * 55;
  const xp = 70 + correctCount * 20;
  if (result) return <VictoryPanel title="¡Mapa de preguntas completado!" description={`Acertaste ${correctCount} de ${filtered.length} retos. Cada pregunta es una nueva luz para tu mapa.`} result={result} points={points} xp={xp} onPlayAgain={reset} />;
  return <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]"><aside className="rounded-[1.7rem] bg-[#edfaff] p-5 shadow-card"><p className="text-xs font-black uppercase tracking-[.16em] text-violet">Tu ruta</p><p className="mt-3 text-sm font-bold text-ink">Categoría</p><div className="mt-2 grid gap-2">{(["Historias", "Valores", "Versículos"] as const).map((item) => <button key={item} type="button" onClick={() => { setCategory(item); reset(); }} className={`rounded-xl px-3 py-2.5 text-left text-sm font-extrabold outline-none focus-visible:ring-4 focus-visible:ring-violet/25 ${category === item ? "bg-violet text-white" : "bg-white text-ink hover:bg-violet/10"}`}>{item}</button>)}</div><p className="mt-5 text-sm font-bold text-ink">Dificultad</p><div className="mt-2 flex gap-2">{(["Inicial", "Explorador"] as const).map((item) => <button key={item} type="button" onClick={() => { setDifficulty(item); reset(); }} className={`flex-1 rounded-xl px-2 py-2.5 text-xs font-extrabold ${difficulty === item ? "bg-ink text-white" : "bg-white text-ink/65"}`}>{item}</button>)}</div><div className="mt-6 rounded-xl bg-white p-4"><p className="text-xs font-black uppercase tracking-wide text-ink/50">Marcador</p><p className="mt-2 font-display text-3xl font-black text-violet">{correctCount}</p><p className="text-xs font-bold text-ink/60">respuestas correctas</p></div></aside><div className="rounded-[1.7rem] bg-white p-5 shadow-card sm:p-8"><div className="flex items-center justify-between gap-3"><span className="rounded-full bg-sun/30 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-ink">Pregunta {index + 1} de {filtered.length}</span><span className="text-xs font-bold text-ink/50">{category}</span></div><h2 className="mt-7 font-display text-3xl font-black leading-tight text-ink">{current.question}</h2><div className="mt-7 grid gap-3">{current.options.map((option, optionIndex) => { const isCorrect = answered && optionIndex === current.correct; const isSelected = selected === optionIndex; return <button type="button" key={option} onClick={() => choose(optionIndex)} disabled={answered} className={`rounded-2xl border-2 p-4 text-left text-sm font-bold outline-none transition-all focus-visible:ring-4 focus-visible:ring-violet/25 ${!answered ? "border-ink/5 bg-sky/40 hover:border-violet hover:bg-violet/5" : isCorrect ? "border-leaf bg-leaf/10 text-[#147558]" : isSelected ? "border-coral bg-coral/10 text-coral" : "border-ink/5 bg-white text-ink/45"}`}><span className="mr-3 inline-grid h-7 w-7 place-items-center rounded-lg bg-white text-xs font-black text-ink/65">{String.fromCharCode(65 + optionIndex)}</span>{option}</button>; })}</div>{answered && <div className={`mt-5 rounded-2xl p-4 text-sm leading-6 ${selected === current.correct ? "bg-leaf/10 text-[#147558]" : "bg-coral/10 text-[#af3f3b]"}`}><p className="font-black">{selected === current.correct ? "¡Correcto!" : "Casi, sigue explorando."}</p><p className="mt-1 font-semibold">{current.explanation}</p></div>}{answered && <button type="button" onClick={next} className="mt-6 rounded-xl bg-ink px-5 py-3 text-sm font-extrabold text-white hover:bg-violet focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/25">{index + 1 >= filtered.length ? "Ver recompensa" : "Siguiente pregunta"}</button>}</div></div>;
}
