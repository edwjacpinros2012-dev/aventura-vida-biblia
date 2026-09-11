"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { VictoryPanel, useGameCompletion } from "@/components/games/game-shell";

function StartCard({ icon, title, instructions, onStart }: { icon: string; title: string; instructions: string[]; onStart: () => void }) {
  return <section className="mx-auto mt-6 max-w-2xl rounded-[1.7rem] bg-white p-6 text-center shadow-card sm:p-8"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-sun text-3xl">{icon}</span><h2 className="mt-5 font-display text-3xl font-black text-ink">{title}</h2><p className="mt-2 text-sm font-bold text-ink/65">Antes de empezar:</p><ol className="mx-auto mt-4 grid max-w-md gap-2 text-left text-sm font-semibold text-ink/70">{instructions.map((instruction, index) => <li key={instruction} className="rounded-xl bg-sky px-3 py-2"><span className="mr-2 font-black text-violet">{index + 1}.</span>{instruction}</li>)}</ol><button type="button" onClick={onStart} className="mt-6 rounded-xl bg-violet px-6 py-3 text-sm font-extrabold text-white shadow-card hover:bg-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/25">¡Empezar a jugar!</button></section>;
}

type GridPoint = { x: number; y: number };
type LightLayout = { lights: GridPoint[]; clouds: GridPoint[]; bells: GridPoint[] };

const lightLayouts: LightLayout[] = [
  { lights: [{ x: 1, y: 0 }, { x: 3, y: 0 }, { x: 2, y: 1 }, { x: 4, y: 1 }, { x: 0, y: 2 }, { x: 3, y: 2 }, { x: 5, y: 2 }, { x: 2, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }], clouds: [{ x: 2, y: 0 }, { x: 1, y: 2 }, { x: 4, y: 2 }], bells: [{ x: 0, y: 3 }, { x: 5, y: 0 }] },
  { lights: [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 4, y: 0 }, { x: 1, y: 1 }, { x: 3, y: 1 }, { x: 5, y: 1 }, { x: 2, y: 2 }, { x: 4, y: 2 }, { x: 0, y: 3 }, { x: 3, y: 3 }], clouds: [{ x: 1, y: 0 }, { x: 3, y: 2 }, { x: 5, y: 3 }], bells: [{ x: 5, y: 0 }, { x: 1, y: 3 }] },
];

function pointKey(point: GridPoint) { return `${point.x}-${point.y}`; }

export function LightCollectorGame() {
  const { result, finish, resetCompletion } = useGameCompletion("light-collector");
  const [started, setStarted] = useState(false);
  const [variant, setVariant] = useState(0);
  const [position, setPosition] = useState<GridPoint>({ x: 0, y: 0 });
  const [found, setFound] = useState<string[]>([]);
  const [bells, setBells] = useState<string[]>([]);
  const [message, setMessage] = useState("Mueve a Lumo por el valle.");
  const layout = lightLayouts[variant % lightLayouts.length];
  const lights = useMemo(() => new Set(layout.lights.map(pointKey)), [layout]);
  const clouds = useMemo(() => new Set(layout.clouds.map(pointKey)), [layout]);
  const bellKeys = useMemo(() => new Set(layout.bells.map(pointKey)), [layout]);
  const lightTotal = layout.lights.length * 3;

  const move = useCallback((xDelta: number, yDelta: number) => {
    if (!started || result) return;
    setPosition((current) => {
      const next = { x: Math.max(0, Math.min(5, current.x + xDelta)), y: Math.max(0, Math.min(3, current.y + yDelta)) };
      const key = pointKey(next);
      if (clouds.has(key)) { setMessage("Una nube traviesa bloquea ese paso. Busca otra ruta."); return current; }
      if (lights.has(key) && !found.includes(key)) { setFound((items) => [...items, key]); setMessage("¡Encontraste 3 destellos de luz!"); }
      return next;
    });
  }, [clouds, found, lights, result, started]);

  const interact = useCallback(() => {
    if (!started || result) return;
    const key = pointKey(position);
    if (bellKeys.has(key) && !bells.includes(key)) { setBells((items) => [...items, key]); setMessage("¡Campana activada! El viento aparta la niebla."); return; }
    if (position.x === 5 && position.y === 3) {
      if (found.length * 3 < lightTotal || bells.length < 2) { setMessage("El faro necesita todos los destellos y las 2 campanas activas."); return; }
      finish({ points: 420 + bells.length * 40, xp: 160 });
      return;
    }
    setMessage("Aquí no hay nada que activar. Busca una campana o el faro.");
  }, [bellKeys, bells, finish, found.length, lightTotal, position, result, started]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const action: Record<string, () => void> = { ArrowLeft: () => move(-1, 0), KeyA: () => move(-1, 0), ArrowRight: () => move(1, 0), KeyD: () => move(1, 0), ArrowUp: () => move(0, -1), KeyW: () => move(0, -1), ArrowDown: () => move(0, 1), KeyS: () => move(0, 1), KeyE: interact, Space: interact };
      const next = action[event.code];
      if (!next) return;
      event.preventDefault();
      next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [interact, move]);

  const reset = () => { setStarted(false); setVariant((value) => value + 1); setPosition({ x: 0, y: 0 }); setFound([]); setBells([]); setMessage("Mueve a Lumo por el valle."); resetCompletion(); };
  if (!started) return <StartCard icon="✦" title="Recolector de luz" instructions={["Usa A, D, W, S o las flechas para mover a Lumo.", "Cada destello vale 3 luces: reúne las 30.", "Llega a una campana o al faro y pulsa E o el botón Activar."]} onStart={() => setStarted(true)} />;
  if (result) return <VictoryPanel title="¡El faro volvió a brillar!" description="Lumo reunió los destellos, activó las campanas y guio al valle con su luz." result={result} points={420 + bells.length * 40} xp={160} onPlayAgain={reset} />;
  return <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]"><div className="rounded-[1.7rem] bg-white p-4 shadow-card sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.16em] text-violet">Guía a Lumo</p><p className="mt-1 text-sm font-bold text-ink/65">{message}</p></div><span className="rounded-xl bg-sun/35 px-3 py-2 text-sm font-black text-ink">✦ {found.length * 3}/{lightTotal}</span></div><div className="mx-auto mt-6 grid max-w-xl grid-cols-6 gap-2 rounded-[1.5rem] bg-[linear-gradient(180deg,#aeeaff,#d8f7dc)] p-3">{Array.from({ length: 24 }, (_, index) => { const point = { x: index % 6, y: Math.floor(index / 6) }; const key = pointKey(point); const isLumo = position.x === point.x && position.y === point.y; const isFaro = point.x === 5 && point.y === 3; return <div key={key} className="relative grid aspect-square place-items-center rounded-xl bg-white/70 text-xl shadow-sm">{clouds.has(key) && "☁"}{lights.has(key) && !found.includes(key) && "✦"}{bellKeys.has(key) && <span className={bells.includes(key) ? "text-leaf" : ""}>🔔</span>}{isFaro && "🏮"}{isLumo && <span className="absolute grid h-8 w-8 place-items-center rounded-full bg-coral text-sm shadow-card">L</span>}</div>; })}</div><div className="mt-5 grid grid-cols-3 gap-2 sm:hidden"><span /><button type="button" onClick={() => move(0, -1)} className="rounded-xl bg-sky py-3 font-black">↑</button><span /><button type="button" onClick={() => move(-1, 0)} className="rounded-xl bg-sky py-3 font-black">←</button><button type="button" onClick={interact} className="rounded-xl bg-violet py-3 text-sm font-black text-white">ACTIVAR</button><button type="button" onClick={() => move(1, 0)} className="rounded-xl bg-sky py-3 font-black">→</button><span /><button type="button" onClick={() => move(0, 1)} className="rounded-xl bg-sky py-3 font-black">↓</button></div></div><aside className="rounded-[1.7rem] bg-[#fff5cf] p-5 shadow-card"><p className="text-xs font-black uppercase tracking-[.16em] text-[#a66d00]">Objetivo</p><p className="mt-3 text-sm font-bold leading-6 text-ink">Recoge 30 destellos, activa 2 campanas y usa el faro de la esquina inferior derecha.</p><p className="mt-5 rounded-xl bg-white p-3 text-sm font-bold text-ink">Campanas: {bells.length}/2</p><p className="mt-3 text-xs font-semibold text-ink/60">PC: flechas o WASD · E/Espacio para activar.</p></aside></section>;
}

const gardenVariants = [["Sembrar", "Regar", "Compartir"], ["Quitar piedras", "Regar", "Compartir"]];

export function GardenHelpersGame() {
  const { result, finish, resetCompletion } = useGameCompletion("garden-helpers");
  const [started, setStarted] = useState(false); const [variant, setVariant] = useState(0); const [step, setStep] = useState(0); const [message, setMessage] = useState("El jardín espera una mano amiga.");
  const tasks = gardenVariants[variant % gardenVariants.length];
  const choose = (task: string) => { if (task !== tasks[step]) { setMessage("Ese gesto puede ayudar después. Mira cuál es la necesidad de ahora."); return; } if (step + 1 === tasks.length) finish({ points: 280, xp: 90 }); else { setStep((value) => value + 1); setMessage("¡Muy bien! El jardín se ve más alegre."); } };
  const reset = () => { setStarted(false); setVariant((value) => value + 1); setStep(0); setMessage("El jardín espera una mano amiga."); resetCompletion(); };
  if (!started) return <StartCard icon="🌱" title="Guardianes del jardín" instructions={["Lee qué necesita el jardín en cada momento.", "Elige la acción amable que corresponde.", "Completa tres gestos de cuidado para recibir tu recompensa."]} onStart={() => setStarted(true)} />;
  if (result) return <VictoryPanel title="¡El jardín floreció!" description="Tus decisiones de servicio hicieron crecer un lugar bonito para todos." result={result} points={280} xp={90} onPlayAgain={reset} />;
  const current = tasks[step];
  return <section className="mx-auto mt-6 max-w-3xl rounded-[1.7rem] bg-white p-6 shadow-card"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.16em] text-leaf">Paso {step + 1} de {tasks.length}</p><h2 className="mt-2 font-display text-3xl font-black text-ink">El jardín necesita: {current}</h2></div><span className="text-5xl">{step === 0 ? "🌱" : step === 1 ? "💧" : "🌻"}</span></div><p className="mt-4 rounded-xl bg-sky p-3 text-sm font-bold text-ink/70">{message}</p><div className="mt-6 grid gap-3 sm:grid-cols-3">{[...new Set([...tasks, "Descansar", "Esconder herramientas"])].sort(() => Math.random() - 0.5).map((task) => <button key={task} type="button" onClick={() => choose(task)} className="rounded-2xl bg-[#e9fbf5] p-4 text-sm font-extrabold text-ink hover:bg-leaf hover:text-white">{task}</button>)}</div><div className="mt-6 h-3 overflow-hidden rounded-full bg-sky"><div className="h-full bg-leaf transition-all" style={{ width: `${(step / tasks.length) * 100}%` }} /></div></section>;
}

const riverStories = [[{ text: "Ves una mochila olvidada junto al río.", options: ["Llevarla al campamento", "Esconderla"], answer: 0 }, { text: "El puente tiene ramas sueltas.", options: ["Avisar al equipo", "Correr sin mirar"], answer: 0 }, { text: "Llegan provisiones para compartir.", options: ["Repartirlas con cuidado", "Guardarlas solo"], answer: 0 }], [{ text: "Un niño no encuentra el sendero.", options: ["Mostrarle el mapa", "Reírse"], answer: 0 }, { text: "El bote necesita remos.", options: ["Buscar y colaborar", "Esperar sin decir nada"], answer: 0 }, { text: "Una familia pide agua.", options: ["Compartir la cantimplora", "Dar la espalda"], answer: 0 }]];

export function RiverPathGame() {
  const { result, finish, resetCompletion } = useGameCompletion("river-path");
  const [started, setStarted] = useState(false); const [variant, setVariant] = useState(0); const [step, setStep] = useState(0); const [answered, setAnswered] = useState<number | null>(null); const [kindness, setKindness] = useState(0);
  const chapters = riverStories[variant % riverStories.length]; const current = chapters[step];
  const next = () => { const earned = kindness + (answered === current.answer ? 1 : 0); if (step + 1 === chapters.length) { setKindness(earned); finish({ points: 220 + earned * 60, xp: 120 }); } else { setKindness(earned); setStep((value) => value + 1); setAnswered(null); } };
  const reset = () => { setStarted(false); setVariant((value) => value + 1); setStep(0); setAnswered(null); setKindness(0); resetCompletion(); };
  if (!started) return <StartCard icon="🛶" title="El camino del río" instructions={["Lee cada señal del río.", "Elige la ruta que cuida y ayuda a los demás.", "Entrega las provisiones al final de tres decisiones."]} onStart={() => setStarted(true)} />;
  if (result) return <VictoryPanel title="¡Provisiones entregadas!" description={`Tomaste ${kindness} decisiones de amistad y abriste una ruta segura para el campamento.`} result={result} points={220 + kindness * 60} xp={120} onPlayAgain={reset} />;
  return <section className="mx-auto mt-6 max-w-3xl overflow-hidden rounded-[1.7rem] bg-white shadow-card"><div className="bg-[linear-gradient(135deg,#bcefff,#e4f8d3)] p-7"><p className="text-xs font-black uppercase tracking-[.16em] text-violet">Señal {step + 1} de {chapters.length}</p><h2 className="mt-3 font-display text-3xl font-black text-ink">{current.text}</h2><p className="mt-3 text-sm font-bold text-ink/65">Elige una ruta de amistad para llevar las provisiones.</p></div><div className="p-6"><div className="grid gap-3 sm:grid-cols-2">{current.options.map((option, index) => <button key={option} type="button" disabled={answered !== null} onClick={() => setAnswered(index)} className={`rounded-2xl border-2 p-4 text-left text-sm font-extrabold ${answered === null ? "border-ink/5 bg-sky hover:border-violet" : index === current.answer ? "border-leaf bg-leaf/10 text-leaf" : answered === index ? "border-coral bg-coral/10 text-coral" : "border-ink/5 text-ink/40"}`}>{option}</button>)}</div>{answered !== null && <><p className="mt-5 rounded-xl bg-[#e9fbf5] p-3 text-sm font-bold text-ink">{answered === current.answer ? "¡Buena ruta! Cuidar a los demás hace el camino más seguro." : "Puedes volver a pensar en esta decisión durante la próxima aventura."}</p><button type="button" onClick={next} className="mt-5 rounded-xl bg-ink px-5 py-3 text-sm font-extrabold text-white hover:bg-violet">{step + 1 === chapters.length ? "Entregar provisiones" : "Siguiente señal"}</button></>}</div></section>;
}

const starSequences = [["Norte", "Río", "Árbol", "Luz", "Brújula"], ["Luz", "Árbol", "Norte", "Brújula", "Río"]];

export function StarMapGame() {
  const { result, finish, resetCompletion } = useGameCompletion("star-map");
  const [started, setStarted] = useState(false); const [variant, setVariant] = useState(0); const [chosen, setChosen] = useState<string[]>([]); const [message, setMessage] = useState("Conecta la primera estrella: Norte.");
  const sequence = starSequences[variant % starSequences.length];
  const choose = (star: string) => { const expected = sequence[chosen.length]; if (star !== expected) { setChosen([]); setMessage(`Esa no es la siguiente señal. Vuelve a empezar por ${sequence[0]}.`); return; } const next = [...chosen, star]; setChosen(next); if (next.length === sequence.length) finish({ points: 360, xp: 110 }); else setMessage(`¡Conectaste ${star}! Ahora busca: ${sequence[next.length]}.`); };
  const reset = () => { setStarted(false); setVariant((value) => value + 1); setChosen([]); setMessage("Conecta las estrellas en orden."); resetCompletion(); };
  if (!started) return <StartCard icon="✧" title="Mapa de estrellas" instructions={["Lee la primera señal que aparece abajo.", "Toca las estrellas en ese orden para dibujar una ruta.", "Completa las cinco señales y encuentra la brújula."]} onStart={() => setStarted(true)} />;
  if (result) return <VictoryPanel title="¡La brújula encontró la ruta!" description="Conectaste cada señal y orientaste la expedición nocturna." result={result} points={360} xp={110} onPlayAgain={reset} />;
  return <section className="mx-auto mt-6 max-w-3xl rounded-[1.7rem] bg-ink p-5 text-white shadow-card sm:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.16em] text-sun">Constelación de ruta</p><h2 className="mt-2 font-display text-3xl font-black">{message}</h2></div><span className="rounded-xl bg-white/10 px-3 py-2 text-sm font-black">{chosen.length}/5</span></div><div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-5">{[...sequence].sort((a, b) => (a.length + variant) % 3 - (b.length + variant) % 3).map((star) => <button key={star} type="button" disabled={chosen.includes(star)} onClick={() => choose(star)} className={`aspect-square rounded-2xl border-2 text-sm font-black transition ${chosen.includes(star) ? "border-sun bg-sun text-ink" : "border-white/20 bg-white/10 hover:border-sun hover:bg-white/20"}`}>✦<span className="mt-1 block text-xs">{star}</span></button>)}</div><p className="mt-6 text-sm font-bold text-white/70">Ruta conectada: {chosen.join(" → ") || "—"}</p></section>;
}
