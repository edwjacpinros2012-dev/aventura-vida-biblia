"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { VictoryPanel, useGameCompletion } from "@/components/games/game-shell";

const heroes = [
  { name: "Pastor Rubio", emoji: "🧑🏼‍🌾", color: "from-blue-500 to-sky-600", jump: 1 },
  { name: "Astronauta", emoji: "👨‍🚀", color: "from-slate-500 to-indigo-600", jump: 1.12 },
  { name: "Maquinista", emoji: "👨‍✈️", color: "from-orange-500 to-amber-600", jump: 1.04 },
  { name: "Conejito", emoji: "🐰", color: "from-pink-400 to-fuchsia-600", jump: 1.22 },
];
const vowels = [{ l: "A", word: "Árbol", emoji: "🌳" }, { l: "E", word: "Estrella", emoji: "⭐" }, { l: "I", word: "Iglú", emoji: "🧊" }, { l: "O", word: "Oveja", emoji: "🐑" }, { l: "U", word: "Uva", emoji: "🍇" }];

type Obstacle = { id: number; x: number; kind: "rock" | "sheep" | "star"; taken?: boolean };

export function LittleBigHeroesGame() {
  const { result, finish, resetCompletion } = useGameCompletion("little-big-heroes");
  const [hero, setHero] = useState(0);
  const [started, setStarted] = useState(false);
  const [jumping, setJumping] = useState(false);
  const [lives, setLives] = useState(6);
  const [sheep, setSheep] = useState(0);
  const [stars, setStars] = useState(0);
  const [distance, setDistance] = useState(0);
  const [target, setTarget] = useState(0);
  const [station, setStation] = useState(false);
  const [message, setMessage] = useState("¡Corre, salta y rescata ovejitas!");
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [sound, setSound] = useState(true);
  const laneRef = useRef<HTMLDivElement>(null);
  const jumpTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const current = heroes[hero];
  const completed = result !== null;

  const jump = useCallback(() => {
    if (!started || station || completed || jumping) return;
    setJumping(true);
    if (sound && typeof window !== "undefined") {
      try { const Ctx = window.AudioContext; const ctx = new Ctx(); const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.frequency.value = 440; gain.gain.value = 0.04; osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.08); osc.onended = () => void ctx.close(); } catch {}
    }
    if (jumpTimer.current) clearTimeout(jumpTimer.current);
    jumpTimer.current = setTimeout(() => setJumping(false), 650);
  }, [completed, jumping, sound, started, station]);

  const spawn = useCallback(() => {
    setObstacles((items) => {
      const moved = items.map((item) => ({ ...item, x: item.x - 7 })).filter((item) => item.x > -12 || item.taken);
      if (Math.random() < 0.045 && moved.length < 4) {
        const kind = Math.random() < 0.48 ? "sheep" : Math.random() < 0.55 ? "star" : "rock";
        moved.push({ id: Date.now() + Math.random(), x: 105, kind });
      }
      return moved;
    });
    setDistance((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!started || station || completed) return;
    const timer = setInterval(() => {
      spawn();
      setObstacles((items) => {
        const hit = items.find((item) => !item.taken && item.x > 17 && item.x < 27);
        if (hit?.kind === "rock" && !jumping) {
          setLives((value) => {
            const next = value - 1;
            if (next <= 0) setMessage("¡Se acabaron los corazones! Puedes intentarlo otra vez.");
            return Math.max(0, next);
          });
          return items.map((item) => item.id === hit.id ? { ...item, taken: true } : item);
        }
        if (hit && jumping && hit.kind === "rock") return items.map((item) => item.id === hit.id ? { ...item, taken: true } : item);
        if (hit?.kind === "sheep") { setSheep((v) => v + 1); setMessage("¡Ovejita rescatada! 🐑"); return items.map((item) => item.id === hit.id ? { ...item, taken: true } : item); }
        if (hit?.kind === "star") { setStars((v) => v + 1); return items.map((item) => item.id === hit.id ? { ...item, taken: true } : item); }
        return items;
      });
    }, 140);
    return () => clearInterval(timer);
  }, [completed, jumping, spawn, started, station]);

  useEffect(() => {
    if (lives <= 0 && started && !completed) {
      setStarted(false);
      setMessage("¡Buen intento! Las ovejitas te esperan.");
    }
  }, [completed, lives, started]);

  useEffect(() => {
    if (sheep > 0 && sheep % 5 === 0 && !station && started) {
      setStation(true);
      setTarget((value) => (value + 1) % vowels.length);
    }
  }, [sheep, station, started]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (["Space", "ArrowUp", "KeyW"].includes(event.code)) { event.preventDefault(); jump(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [jump]);

  useEffect(() => () => { if (jumpTimer.current) clearTimeout(jumpTimer.current); }, []);

  const chooseVowel = (index: number) => {
    if (index === target) {
      setStars((value) => value + 3);
      setMessage(`¡Correcto! ${vowels[target].l} de ${vowels[target].word}.`);
      setStation(false);
    } else setMessage("¡Inténtalo otra vez! Escucha y busca la vocal correcta.");
  };

  const start = () => {
    setLives(6); setSheep(0); setStars(0); setDistance(0); setObstacles([]);
    setStation(false); setTarget(0); setMessage("¡Corre, salta y rescata ovejitas!");
    resetCompletion(); setStarted(true);
  };
  const end = () => { setStarted(false); finish({ points: sheep * 35 + stars * 10 + Math.floor(distance / 10), xp: 120 + sheep * 4 }); };

  if (completed) return <VictoryPanel title="¡Héroe del rebaño!" description={`Rescataste ${sheep} ovejitas y reuniste ${stars} estrellas en tu carrera.`} result={result} points={sheep * 35 + stars * 10 + Math.floor(distance / 10)} xp={120 + sheep * 4} onPlayAgain={start} />;
  if (!started) return <section className="mt-6 overflow-hidden rounded-[1.8rem] border-4 border-amber-700 bg-gradient-to-b from-sky-300 via-sky-100 to-emerald-200 p-5 shadow-card sm:p-8">
    <div className="mx-auto max-w-3xl text-center"><p className="inline-flex rounded-full border-2 border-amber-700 bg-amber-100 px-4 py-1 text-xs font-black tracking-widest text-amber-900">PRESENTS</p><h2 className="mt-3 font-display text-3xl font-black text-amber-950 sm:text-5xl">LITTLE BIG HEROES</h2><p className="mt-2 inline-block -rotate-1 rounded-xl border-4 border-amber-900 bg-orange-600 px-5 py-2 text-2xl font-black text-white sm:text-3xl">RUN HERO RUN!</p>
    <p className="mt-4 text-sm font-bold text-amber-950">Elige tu héroe para comenzar la aventura</p>
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{heroes.map((item, index) => <button key={item.name} onClick={() => setHero(index)} className={`rounded-2xl border-4 p-3 text-center transition ${hero === index ? "border-amber-500 bg-white shadow-lg" : "border-white/70 bg-white/60"}`}><span className="text-4xl">{item.emoji}</span><span className="mt-2 block text-sm font-black text-amber-950">{item.name}</span></button>)}</div>
    <div className="mt-5 rounded-2xl border-2 border-amber-600 bg-amber-50/90 p-4 text-left text-sm font-bold text-amber-950"><p>🎮 Salta sobre las rocas y recoge ovejitas y estrellas.</p><p className="mt-2">🚂 Cada cinco ovejitas tendrás un reto de vocales.</p><p className="mt-2">❤️ Tienes seis corazones. ¡Cuídalos!</p></div>
    <button onClick={start} className="mt-5 w-full rounded-2xl border-4 border-amber-900 bg-gradient-to-b from-orange-400 to-orange-600 px-8 py-4 text-2xl font-black text-white shadow-lg">▶ JUGAR</button></div>
  </section>;

  return <section className="mt-6 overflow-hidden rounded-[1.7rem] border-4 border-sky-700 bg-sky-100 shadow-card">
    <div className="flex flex-wrap items-center justify-between gap-2 bg-amber-900 px-3 py-3 text-white sm:px-5"><button onClick={() => setStarted(false)} className="rounded-xl bg-amber-100 px-3 py-2 text-sm font-black text-amber-950">🏠 Menú</button><div className="flex gap-3 text-sm font-black"><span>❤️ {lives}/6</span><span>🐑 {sheep}</span><span>⭐ {stars}</span></div><button onClick={() => setSound((v) => !v)} className="rounded-xl bg-white px-3 py-2 text-sm text-amber-950">{sound ? "🔊" : "🔇"}</button></div>
    <div className="flex items-center justify-center gap-1 bg-orange-500 px-2 py-2">{vowels.map((v, i) => <div key={v.l} className={`rounded-lg border-2 px-3 py-1 text-lg font-black ${i === target ? "border-yellow-200 bg-yellow-300 text-amber-950" : "border-white/40 bg-white/20 text-white"}`}>{v.l}</div>)}</div>
    <div ref={laneRef} className="relative h-64 overflow-hidden bg-gradient-to-b from-sky-300 via-sky-100 to-emerald-300 sm:h-80">
      <div className="absolute left-8 top-7 text-4xl">☁️</div><div className="absolute right-12 top-12 text-3xl">☁️</div><div className="absolute bottom-0 h-16 w-full border-t-4 border-emerald-700 bg-gradient-to-b from-green-500 to-green-700" />
      <div className={`absolute bottom-12 left-[18%] z-10 text-5xl transition-transform duration-300 ${jumping ? " -translate-y-28" : ""}`}>{current.emoji}</div>
      {obstacles.filter((o) => !o.taken).map((o) => <div key={o.id} className="absolute bottom-12 z-10 text-4xl" style={{ left: `${o.x}%` }}>{o.kind === "rock" ? "🪨" : o.kind === "sheep" ? "🐑" : "⭐"}</div>)}
      <div className="absolute bottom-2 left-0 right-0 text-center text-xs font-black text-white">🏃‍♂️ ¡Corre por el valle!</div>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-800 p-3 text-white"><p className="text-sm font-bold">{message}</p><div className="flex gap-2"><button onClick={jump} className="rounded-full border-4 border-white bg-lime-500 px-6 py-3 text-lg font-black shadow-lg">⬆ SALTAR</button><button onClick={end} className="rounded-xl bg-amber-300 px-4 py-3 text-sm font-black text-amber-950">Terminar</button></div></div>
    {station && <div className="border-t-4 border-amber-500 bg-amber-50 p-4 text-center"><p className="text-xs font-black uppercase tracking-widest text-orange-700">🚂 Estación de vocales</p><h3 className="mt-2 text-xl font-black text-amber-950">¡Encuentra la vocal {vowels[target].l}!</h3><p className="text-sm font-bold text-amber-800">Pista: {vowels[target].emoji} {vowels[target].word}</p><div className="mt-3 grid grid-cols-5 gap-2">{vowels.map((v, i) => <button key={v.l} onClick={() => chooseVowel(i)} className="rounded-xl border-2 border-amber-500 bg-white py-3 text-xl font-black text-amber-950">{v.l}</button>)}</div></div>}
    {!station && <p className="bg-sky-50 px-3 py-2 text-center text-xs font-bold text-slate-700">Computadora: ESPACIO o ↑ para saltar · Móvil: botón SALTAR</p>}
  </section>;
}
