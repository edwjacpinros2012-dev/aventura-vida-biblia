"use client";

import { useEffect, useState } from "react";
import { VictoryPanel, useGameCompletion } from "@/components/games/game-shell";

const verse = {
  reference: "Filipenses 4:13",
  text: "Todo lo puedo en Cristo que me fortalece",
  words: ["Todo", "lo", "puedo", "en", "Cristo", "que", "me", "fortalece"],
};
const shuffledWords = ["Cristo", "me", "Todo", "fortalece", "puedo", "que", "en", "lo"];

export function VerseGame() {
  const { result, finish, resetCompletion, saveGameProgress } = useGameCompletion("verse-learn");
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState("");
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => { saveGameProgress("verse-learn", { step, reference: verse.reference }); }, [saveGameProgress, step]);
  const reset = () => { setStep(0); setAnswer(""); setSelectedWords([]); setMessage(""); resetCompletion(); };
  const checkWord = () => {
    if (answer.trim().toLocaleLowerCase() === "fortalece") { setMessage(""); setStep(2); }
    else setMessage("Casi. Lee el versículo nuevamente y prueba otra vez.");
  };
  const addWord = (word: string) => { if (!selectedWords.includes(word)) setSelectedWords((current) => [...current, word]); };
  const checkOrder = () => {
    if (selectedWords.join(" ") === verse.text) finish({ points: 350, xp: 120, verseReference: verse.reference });
    else setMessage("El orden aún no está completo. Revisa las primeras palabras y vuelve a intentar.");
  };
  if (result) return <VictoryPanel title="¡Versículo aprendido!" description={`${verse.reference} se agregó a tus versículos aprendidos. Puedes volver a practicarlo cuando quieras.`} result={result} points={350} xp={120} onPlayAgain={reset} />;
  return <div className="mx-auto mt-6 max-w-4xl rounded-[1.7rem] bg-white p-5 shadow-card sm:p-8"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-violet px-3 py-1.5 text-xs font-black uppercase tracking-wide text-white">Paso {step + 1} de 3</span>{["Leer", "Completar", "Ordenar"].map((item, index) => <span key={item} className={`rounded-full px-3 py-1.5 text-xs font-black ${index <= step ? "bg-sun/35 text-ink" : "bg-ink/5 text-ink/45"}`}>{index < step ? "✓ " : ""}{item}</span>)}</div><div className="mt-7 rounded-[1.5rem] bg-[#f1eeff] p-6 text-center sm:p-9"><p className="text-xs font-black uppercase tracking-[.2em] text-violet">{verse.reference}</p><p className="mt-4 font-display text-3xl font-black leading-tight text-ink sm:text-4xl">{step === 1 ? <>Todo lo puedo en Cristo que me <span className="rounded-lg bg-sun/55 px-2">_____</span></> : verse.text}</p></div>{step === 0 && <div className="mt-6 text-center"><p className="mx-auto max-w-lg text-sm leading-6 text-ink/65">Lee el versículo dos veces con calma. Cuando estés listo, oculta una palabra para practicar.</p><button type="button" onClick={() => setStep(1)} className="mt-5 rounded-xl bg-ink px-5 py-3 text-sm font-extrabold text-white hover:bg-violet focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/25">Estoy listo para practicar</button></div>}{step === 1 && <div className="mx-auto mt-6 max-w-md"><label className="text-sm font-bold text-ink" htmlFor="verse-answer">¿Qué palabra falta?<input id="verse-answer" value={answer} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => event.key === "Enter" && checkWord()} autoComplete="off" className="mt-2 h-12 w-full rounded-xl border border-ink/10 bg-sky/40 px-4 font-bold outline-none focus:border-violet focus:ring-4 focus:ring-violet/15" placeholder="Escribe la palabra" /></label><button type="button" onClick={checkWord} className="mt-3 w-full rounded-xl bg-violet px-5 py-3 text-sm font-extrabold text-white hover:bg-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/25">Comprobar respuesta</button>{message && <p role="status" className="mt-3 rounded-xl bg-coral/10 p-3 text-sm font-bold text-coral">{message}</p>}</div>}{step === 2 && <div className="mt-6"><p className="text-center text-sm font-bold text-ink">¡Muy bien! Ahora toca las palabras en el orden correcto.</p><div className="mx-auto mt-4 flex min-h-16 max-w-3xl flex-wrap justify-center gap-2 rounded-2xl border-2 border-dashed border-violet/25 bg-[#f9f8ff] p-3">{selectedWords.length === 0 ? <span className="self-center text-sm font-semibold text-ink/45">Tu versículo aparecerá aquí</span> : selectedWords.map((word) => <button type="button" key={word} onClick={() => setSelectedWords((current) => current.filter((item) => item !== word))} className="rounded-xl bg-violet px-3 py-2 text-sm font-extrabold text-white">{word} ×</button>)}</div><div className="mx-auto mt-4 flex max-w-3xl flex-wrap justify-center gap-2">{shuffledWords.filter((word) => !selectedWords.includes(word)).map((word) => <button type="button" key={word} onClick={() => addWord(word)} className="rounded-xl bg-sky px-3 py-2 text-sm font-extrabold text-ink outline-none hover:bg-sun/50 focus-visible:ring-4 focus-visible:ring-violet/25">{word}</button>)}</div><div className="mt-5 flex flex-wrap justify-center gap-3"><button type="button" onClick={() => setSelectedWords([])} className="rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm font-extrabold text-ink">Reordenar</button><button type="button" disabled={selectedWords.length !== verse.words.length} onClick={checkOrder} className="rounded-xl bg-ink px-5 py-3 text-sm font-extrabold text-white disabled:opacity-40">Completar versículo</button></div>{message && <p role="status" className="mx-auto mt-4 max-w-xl rounded-xl bg-coral/10 p-3 text-center text-sm font-bold text-coral">{message}</p>}</div>}</div>;
}
