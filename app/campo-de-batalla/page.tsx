"use client";

import Link from "next/link";
import { useState } from "react";

const trials = [
  { title: "La verdad ilumina el camino", reference: "Juan 8:12", prompt: "Jesús enseñó que Él es…", answers: ["La luz del mundo", "Una estrella del cielo", "Un rey de una ciudad"], correct: 0, lesson: "La luz representa guía y esperanza." },
  { title: "La fortaleza del corazón", reference: "Efesios 6:10", prompt: "¿De dónde viene la fortaleza que enseña este pasaje?", answers: ["De la fama", "Del Señor y de su gran poder", "De tener más tesoros"], correct: 1, lesson: "La verdadera fortaleza nace de confiar en Dios." },
  { title: "Vencer el mal con el bien", reference: "Romanos 12:21", prompt: "¿Qué nos anima a hacer este versículo?", answers: ["Responder con bondad y vencer el mal con el bien", "Buscar venganza", "Dejar de ayudar"], correct: 0, lesson: "La bondad, el perdón y la sabiduría son el camino." },
];

export default function CampoDeBatallaPage() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [resolved, setResolved] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const current = trials[step];
  const score = resolved.length;
  const completed = finished || resolved.length === trials.length;

  function checkAnswer() {
    if (selected === null || !current) return;
    if (selected === current.correct) {
      setResolved((items) => items.includes(step) ? items : [...items, step]);
    }
    if (step === trials.length - 1) setFinished(true);
    else { setStep((value) => value + 1); setSelected(null); }
  }

  function restart() { setStep(0); setSelected(null); setResolved([]); setFinished(false); }

  return (
    <main className="av-page min-h-screen overflow-hidden pb-24">
      <section className="relative border-b border-amber-200/20 bg-[radial-gradient(ellipse_at_50%_0%,rgba(250,204,100,.2),transparent_42%),linear-gradient(145deg,#241b43,#102c43_58%,#071923)] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="inline-flex rounded-full border border-amber-200/30 bg-amber-200/10 px-3 py-1 text-xs font-black uppercase tracking-[.18em] text-amber-100">✦ Expedición de la luz</p>
          <h1 className="av-title mt-5 max-w-3xl font-display text-4xl font-black sm:text-6xl">Campo de Batalla contra las Tinieblas</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">Una batalla simbólica donde la verdad, la fe, la oración y la bondad iluminan el camino. Aprende la Palabra y ayuda a restaurar el Reino de Luz.</p>
          <div className="mt-7 flex flex-wrap gap-3 text-sm font-bold text-amber-100/90"><span className="rounded-xl border border-white/10 bg-black/20 px-4 py-2">🛡️ Armadura del Espíritu</span><span className="rounded-xl border border-white/10 bg-black/20 px-4 py-2">📖 Retos bíblicos</span><span className="rounded-xl border border-white/10 bg-black/20 px-4 py-2">✨ Sin combate realista</span></div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-9 lg:grid-cols-[1.15fr_.85fr] sm:px-6 lg:px-8">
        <article className="rounded-3xl border border-amber-200/20 bg-[#0b2635] p-5 shadow-2xl sm:p-7">
          <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.16em] text-amber-200">Desafío de entrenamiento</p><h2 className="mt-1 font-display text-2xl font-black text-[#f5e5b9]">{completed ? "¡La luz ha prevalecido!" : current.title}</h2></div><span className="rounded-xl bg-white/10 px-3 py-2 text-xs font-black text-white/70">{completed ? trials.length : step + 1}/{trials.length}</span></div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-teal-300 to-amber-300" style={{ width: `${(completed ? trials.length : step) / trials.length * 100}%` }} /></div>
          {completed ? <div className="mt-7 rounded-2xl border border-emerald-200/20 bg-emerald-300/[.07] p-6"><div className="text-5xl">🌟</div><h3 className="mt-3 text-xl font-black text-emerald-100">Entrenamiento completado</h3><p className="mt-2 text-sm leading-6 text-white/70">Respuestas correctas: {score} de {trials.length}. Sigue aprendiendo y comparte la luz con tus acciones.</p><button onClick={restart} className="mt-5 rounded-xl bg-amber-300 px-5 py-3 text-sm font-black text-[#18232b]">Repetir entrenamiento</button></div> : <><p className="mt-7 text-xs font-bold uppercase tracking-wide text-teal-200">{current.reference}</p><p className="mt-2 text-lg font-bold text-white">{current.prompt}</p><div className="mt-5 grid gap-3">{current.answers.map((answer, index) => <button key={answer} onClick={() => setSelected(index)} className={`rounded-2xl border p-4 text-left text-sm font-bold transition ${selected === index ? "border-amber-200 bg-amber-200/15 text-amber-100" : "border-white/10 bg-white/[.04] text-white/75 hover:bg-white/[.08]"}`}>{String.fromCharCode(65 + index)}. {answer}</button>)}</div><button disabled={selected === null} onClick={checkAnswer} className="mt-6 w-full rounded-xl bg-amber-300 px-5 py-3.5 text-sm font-black text-[#18232b] disabled:cursor-not-allowed disabled:opacity-40">Confirmar respuesta</button></>}
        </article>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-[#102f3d] p-6"><p className="text-xs font-black uppercase tracking-[.16em] text-teal-200">Tu propósito</p><h2 className="mt-2 font-display text-2xl font-black text-[#f5e5b9]">Restaurar la luz</h2><p className="mt-3 text-sm leading-6 text-white/65">Cada zona del campo tendrá una historia bíblica, personajes que necesitan ayuda, acertijos, rutas secretas y desafíos cooperativos.</p><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-black/20 p-4"><span className="text-2xl">📖</span><p className="mt-2 text-xs font-bold text-white/65">Sabiduría</p></div><div className="rounded-2xl bg-black/20 p-4"><span className="text-2xl">🕊️</span><p className="mt-2 text-xs font-bold text-white/65">Paz</p></div><div className="rounded-2xl bg-black/20 p-4"><span className="text-2xl">🛡️</span><p className="mt-2 text-xs font-bold text-white/65">Fe</p></div><div className="rounded-2xl bg-black/20 p-4"><span className="text-2xl">💛</span><p className="mt-2 text-xs font-bold text-white/65">Bondad</p></div></div></div>
          <div className="rounded-3xl border border-amber-200/15 bg-amber-200/[.06] p-6"><p className="text-xs font-black uppercase tracking-[.16em] text-amber-200">Próximas regiones</p><ul className="mt-4 space-y-3 text-sm text-white/75"><li>🌿 Jardín de los comienzos</li><li>🏜️ Desierto de la confianza</li><li>🏰 Murallas de Jericó</li><li>🌊 Camino del Mar Rojo</li><li>🏞️ Valle del valor de David</li><li>✨ Ciudad de la Nueva Jerusalén</li></ul></div>
          <Link href="/aventuras/armadura-del-espiritu" className="block rounded-2xl border border-white/10 bg-white/[.05] p-4 text-sm font-bold text-amber-100 hover:bg-white/10">Explorar la Armadura del Espíritu →</Link>
          <Link href="/tienda" className="block rounded-2xl border border-white/10 bg-white/[.05] p-4 text-sm font-bold text-amber-100 hover:bg-white/10">Visitar la tienda de expedición →</Link>
        </aside>
      </section>
    </main>
  );
}
