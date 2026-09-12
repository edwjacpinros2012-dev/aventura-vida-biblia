"use client";

import { useState } from "react";
import { VictoryPanel, useGameCompletion } from "@/components/games/game-shell";

type Chapter = { title: string; scene: string; decision: string; options: string[]; answer: number; question: string; answers: string[]; correct: number; emoji: string };
const storySets: Chapter[][] = [
  [
    { title: "Una tarea especial", scene: "Un gran cielo azul aparece sobre un valle tranquilo. Noé escucha con atención una tarea importante: preparar un arca para cuidar la vida.", decision: "¿Cómo comienza Noé una tarea grande?", options: ["Escucha y organiza el trabajo", "Se ríe y se va"], answer: 0, question: "¿Qué muestra Noé al prestar atención a una buena instrucción?", answers: ["Cuidado y obediencia", "Olvido"], correct: 0, emoji: "☀" },
    { title: "Manos que ayudan", scene: "El arca toma forma poco a poco. Cada persona puede aportar algo: madera, alimento, agua y palabras de ánimo.", decision: "Cuando el trabajo parece largo, ¿qué ayuda al equipo?", options: ["Compartir tareas y animarse", "Dejar que una persona haga todo"], answer: 0, question: "¿Qué valor se practica cuando colaboramos?", answers: ["Servicio", "Egoísmo"], correct: 0, emoji: "🛶" },
    { title: "Una señal de esperanza", scene: "Después de la lluvia, aparece un arco de colores. Es una señal de esperanza y de un nuevo comienzo para la familia y los animales.", decision: "¿Qué puedes hacer cuando empieza un día nuevo?", options: ["Dar gracias y hacer el bien", "Pensar que nada puede cambiar"], answer: 0, question: "¿Qué representa el arco en esta aventura?", answers: ["Esperanza", "Miedo"], correct: 0, emoji: "🌈" },
  ],
  [
    { title: "Una semilla pequeña", scene: "En un campo lleno de caminos, una semilla encuentra tierra buena. Con cuidado, agua y paciencia comienza a crecer.", decision: "¿Qué hace crecer una tarea buena?", options: ["Cuidarla cada día", "Olvidarla enseguida"], answer: 0, question: "¿Qué valor aprendemos al esperar que una semilla crezca?", answers: ["Paciencia", "Prisa"], correct: 0, emoji: "🌱" },
    { title: "Un vecino en el camino", scene: "Un viajero necesita ayuda. Una persona se detiene, le ofrece agua y busca apoyo para que esté bien.", decision: "¿Qué harías al ver a alguien que necesita ayuda?", options: ["Me acerco con cuidado y busco ayuda", "Sigo sin mirar"], answer: 0, question: "¿Qué demuestra ayudar a un vecino?", answers: ["Amor", "Indiferencia"], correct: 0, emoji: "🧡" },
    { title: "Luz para compartir", scene: "Al caer la tarde, varias familias encienden pequeñas lámparas. Juntas iluminan el camino y todos pueden volver tranquilos a casa.", decision: "¿Cómo puedes compartir luz con otros?", options: ["Con palabras y acciones amables", "Guardando toda la ayuda"], answer: 0, question: "¿Qué ocurre cuando compartimos algo bueno?", answers: ["La esperanza crece", "La esperanza desaparece"], correct: 0, emoji: "🏮" },
  ],
];

export function StoryGame() {
  const { result, finish, resetCompletion } = useGameCompletion("stories-bible");
  const [storyIndex, setStoryIndex] = useState(0);
  const [chapter, setChapter] = useState(0);
  const [decision, setDecision] = useState<number | null>(null);
  const [answer, setAnswer] = useState<number | null>(null);
  const [goodChoices, setGoodChoices] = useState(0);
  const chapters = storySets[storyIndex];
  const current = chapters[chapter];
  const advance = () => {
    const earned = goodChoices + (decision === current.answer ? 1 : 0) + (answer === current.correct ? 1 : 0);
    if (chapter + 1 >= chapters.length) { setGoodChoices(earned); finish({ points: 220 + earned * 35, xp: 100 + earned * 10 }); return; }
    setGoodChoices(earned); setChapter((value) => value + 1); setDecision(null); setAnswer(null);
  };
  const reset = () => { setStoryIndex((index) => (index + 1) % storySets.length); setChapter(0); setDecision(null); setAnswer(null); setGoodChoices(0); resetCompletion(); };
  const points = 220 + goodChoices * 35; const xp = 100 + goodChoices * 10;
  if (result) return <VictoryPanel title="¡Historia completada!" description="Llegaste al final de la historia con decisiones llenas de cuidado y esperanza." result={result} points={points} xp={xp} onPlayAgain={reset} />;
  return <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]"><div className="overflow-hidden rounded-[1.7rem] bg-white shadow-card"><div className="relative overflow-hidden bg-gradient-to-br from-sky-300 via-sky-100 to-[#f8e3a4] p-7 sm:p-10"><span className="absolute right-8 top-5 text-8xl opacity-30">{current.emoji}</span><p className="relative text-xs font-black uppercase tracking-[.18em] text-violet">Historia {storyIndex + 1} · Capítulo {chapter + 1} de {chapters.length}</p><h2 className="relative mt-3 max-w-xl font-display text-4xl font-black text-ink">{current.title}</h2><p className="relative mt-5 max-w-xl text-base leading-7 text-ink/75">{current.scene}</p></div><div className="p-5 sm:p-7"><h3 className="font-display text-xl font-black text-ink">{current.decision}</h3><div className="mt-4 grid gap-3 sm:grid-cols-2">{current.options.map((item, index) => <button key={item} type="button" onClick={() => decision === null && setDecision(index)} disabled={decision !== null} className={`rounded-2xl border-2 p-4 text-left text-sm font-bold outline-none ${decision === null ? "border-ink/5 bg-sky/40 hover:border-violet" : index === current.answer ? "border-leaf bg-leaf/10 text-[#147558]" : decision === index ? "border-coral bg-coral/10 text-coral" : "border-ink/5 text-ink/45"}`}>{item}</button>)}</div>{decision !== null && <div className="mt-7"><h3 className="font-display text-xl font-black text-ink">Pequeño reto</h3><p className="mt-1 text-sm text-ink/65">{current.question}</p><div className="mt-3 flex flex-wrap gap-2">{current.answers.map((item, index) => <button key={item} type="button" disabled={answer !== null} onClick={() => setAnswer(index)} className={`rounded-xl px-4 py-3 text-sm font-extrabold ${answer === null ? "bg-sky text-ink hover:bg-violet/10" : index === current.correct ? "bg-leaf text-white" : answer === index ? "bg-coral text-white" : "bg-ink/5 text-ink/45"}`}>{item}</button>)}</div></div>}{answer !== null && <button type="button" onClick={advance} className="mt-6 rounded-xl bg-ink px-5 py-3 text-sm font-extrabold text-white hover:bg-violet focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/25">{chapter + 1 === chapters.length ? "Completar historia" : "Siguiente capítulo"}</button>}</div></div><aside className="rounded-[1.7rem] bg-[#e9fbf5] p-5 shadow-card"><p className="text-xs font-black uppercase tracking-[.16em] text-leaf">Mapa de historia</p><div className="mt-5 grid gap-3">{chapters.map((item, index) => <div key={item.title} className={`rounded-xl p-4 ${index === chapter ? "bg-leaf text-white" : index < chapter ? "bg-white text-ink" : "bg-white/60 text-ink/45"}`}><p className="text-xs font-black">{index < chapter ? "✓ COMPLETADO" : `CAPÍTULO ${index + 1}`}</p><p className="mt-1 font-display font-black">{item.title}</p></div>)}</div><p className="mt-5 rounded-xl bg-white p-3 text-sm font-bold text-ink/65">Buenas decisiones: {goodChoices}</p><p className="mt-3 text-xs font-bold leading-5 text-ink/55">Al volver a jugar descubrirás una historia nueva.</p></aside></div>;
}
