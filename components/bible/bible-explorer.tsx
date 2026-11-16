"use client";

import Link from "next/link";
import { useState } from "react";
import { bibleQuiz, bibleStudies } from "@/lib/bible/learning-paths";

export function BibleExplorer() {
  const [activeStudy, setActiveStudy] = useState<string | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const question = bibleQuiz[questionIndex];

  function answer(optionIndex: number) {
    if (selected !== null || finished) return;
    setSelected(optionIndex);
    if (optionIndex === question.correctIndex) setScore((value) => value + 1);
  }

  function nextQuestion() {
    if (questionIndex + 1 >= bibleQuiz.length) {
      setFinished(true);
      return;
    }
    setQuestionIndex((value) => value + 1);
    setSelected(null);
  }

  function restartQuiz() {
    setQuestionIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  }

  const selectedStudy = bibleStudies.find((study) => study.slug === activeStudy);

  return (
    <main className="av-page min-h-screen pb-20">
      <section className="relative overflow-hidden border-b border-amber-200/15 bg-[radial-gradient(ellipse_at_75%_0%,rgba(245,190,75,.22),transparent_40%),linear-gradient(145deg,#173b50,#082a38_60%,#061923)] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="inline-flex rounded-full border border-amber-200/25 bg-amber-300/10 px-3 py-1 text-xs font-black uppercase tracking-[.16em] text-amber-100">📖 Biblioteca de aventuras</p>
          <h1 className="av-title mt-5 max-w-4xl font-display text-4xl font-black sm:text-6xl">Explora la Biblia, historia por historia</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">Aprende sobre personajes, parábolas y acontecimientos bíblicos con resúmenes, actividades y un pequeño desafío de preguntas. Lee también las referencias directamente en tu Biblia.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#historias" className="av-gold-button rounded-xl px-5 py-3 text-sm font-black">Explorar historias ↓</a>
            <a href="#desafio" className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-black text-white hover:bg-white/10">Probar desafío</a>
            <Link href="/juegos" className="rounded-xl border border-cyan-200/20 bg-cyan-200/10 px-5 py-3 text-sm font-black text-cyan-100 hover:bg-cyan-200/15">Volver a los juegos</Link>
          </div>
          <div className="mt-8 grid max-w-xl grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-[#061923]/60 p-4"><p className="text-xs font-bold text-white/55">Rutas de estudio</p><p className="mt-1 text-3xl font-black text-amber-100">{bibleStudies.length}</p></div>
            <div className="rounded-2xl border border-white/10 bg-[#061923]/60 p-4"><p className="text-xs font-bold text-white/55">Preguntas del reto</p><p className="mt-1 text-3xl font-black text-cyan-100">{bibleQuiz.length}</p></div>
          </div>
        </div>
      </section>

      <section id="historias" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6"><p className="text-xs font-black uppercase tracking-[.16em] text-cyan-200">Recorridos</p><h2 className="mt-1 font-display text-3xl font-black text-[#f5e5b9]">Historias y enseñanzas</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">Selecciona una historia para abrir sus objetivos y actividad. Los resúmenes son guías de aprendizaje, no sustituyen la lectura bíblica.</p></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bibleStudies.map((study, index) => (
            <article key={study.slug} className="rounded-3xl border border-white/10 bg-[#092633]/80 p-5 transition hover:border-amber-200/25">
              <div className="flex items-start justify-between gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-200/10 text-2xl">{study.era === "Antiguo Testamento" ? "🕊️" : "🌟"}</span><span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-black uppercase text-white/55">Ruta {String(index + 1).padStart(2, "0")}</span></div>
              <p className="mt-4 text-[10px] font-black uppercase tracking-[.14em] text-cyan-200">{study.era}</p>
              <h3 className="mt-1 font-display text-xl font-black text-[#f5e5b9]">{study.title}</h3>
              <p className="mt-2 text-xs font-bold text-amber-100/70">{study.reference} · {study.theme}</p>
              <p className="mt-3 min-h-20 text-sm leading-6 text-white/60">{study.summary}</p>
              <button type="button" onClick={() => setActiveStudy(activeStudy === study.slug ? null : study.slug)} aria-expanded={activeStudy === study.slug} className="mt-4 w-full rounded-xl border border-amber-200/20 bg-amber-200/10 px-4 py-3 text-sm font-black text-amber-100 hover:bg-amber-200/15">{activeStudy === study.slug ? "Cerrar actividad ↑" : "Abrir estudio →"}</button>
            </article>
          ))}
        </div>
        {selectedStudy && (
          <section aria-live="polite" className="mt-6 rounded-3xl border border-cyan-200/20 bg-[#082b39] p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[.15em] text-cyan-200">Estudio abierto · {selectedStudy.reference}</p>
            <h3 className="mt-2 font-display text-2xl font-black text-[#f5e5b9]">{selectedStudy.title}</h3>
            <div className="mt-5 grid gap-6 md:grid-cols-2">
              <div><h4 className="font-black text-white">Al terminar podrás…</h4><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-white/70">{selectedStudy.learningGoals.map((goal) => <li key={goal}>{goal}</li>)}</ul></div>
              <div className="rounded-2xl border border-amber-200/15 bg-amber-200/5 p-5"><h4 className="font-black text-amber-100">Actividad sugerida</h4><p className="mt-2 text-sm leading-6 text-white/70">{selectedStudy.activity}</p></div>
            </div>
          </section>
        )}
      </section>

      <section id="desafio" className="mx-auto max-w-4xl scroll-mt-6 px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-violet-200/15 bg-[radial-gradient(ellipse_at_100%_0%,rgba(139,92,246,.15),transparent_50%),#092633] p-6 sm:p-9">
          <p className="text-xs font-black uppercase tracking-[.15em] text-violet-200">🧠 Desafío bíblico</p>
          <h2 className="mt-2 font-display text-3xl font-black text-[#f5e5b9]">Comprueba lo que aprendiste</h2>
          {finished ? (
            <div className="mt-6 rounded-2xl border border-emerald-200/20 bg-emerald-200/5 p-6" aria-live="polite">
              <p className="text-sm font-bold text-emerald-100">¡Desafío completado!</p><p className="mt-2 text-4xl font-black text-white">{score} / {bibleQuiz.length}</p><p className="mt-2 text-sm leading-6 text-white/65">Vuelve a revisar las referencias de las preguntas para seguir aprendiendo. El resultado es de práctica local y no modifica monedas ni perfil.</p>
              <button type="button" onClick={restartQuiz} className="mt-5 rounded-xl bg-amber-300 px-5 py-3 text-sm font-black text-[#14252a]">Volver a jugar</button>
            </div>
          ) : (
            <div className="mt-6">
              <div className="flex items-center justify-between gap-4 text-xs font-bold text-white/50"><span>Pregunta {questionIndex + 1} de {bibleQuiz.length}</span><span>Marcador: {score}</span></div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-amber-300 transition-all" style={{ width: ((questionIndex + 1) / bibleQuiz.length * 100) + "%" }} /></div>
              <h3 className="mt-6 text-xl font-black leading-7 text-white">{question.question}</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {question.options.map((option, index) => {
                  const isCorrect = selected !== null && index === question.correctIndex;
                  const isWrong = selected === index && index !== question.correctIndex;
                  return <button key={option} type="button" disabled={selected !== null} onClick={() => answer(index)} className={`rounded-2xl border px-4 py-4 text-left text-sm font-bold transition ${isCorrect ? "border-emerald-200/40 bg-emerald-200/10 text-emerald-100" : isWrong ? "border-rose-200/40 bg-rose-200/10 text-rose-100" : "border-white/10 bg-white/5 text-white hover:bg-white/10 disabled:opacity-70"}`}><span className="mr-3 text-white/45">{String.fromCharCode(65 + index)}.</span>{option}</button>;
                })}
              </div>
              {selected !== null && <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4" aria-live="polite"><p className="font-black text-[#f5e5b9]">{selected === question.correctIndex ? "¡Correcto!" : "Sigue aprendiendo"}</p><p className="mt-1 text-sm leading-6 text-white/65">{question.explanation}</p><p className="mt-2 text-xs font-bold text-cyan-200">Referencia: {question.reference}</p><button type="button" onClick={nextQuestion} className="mt-4 rounded-xl bg-amber-300 px-5 py-3 text-sm font-black text-[#14252a]">{questionIndex + 1 === bibleQuiz.length ? "Ver resultado" : "Siguiente pregunta →"}</button></div>}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
