"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePlayerProgress } from "@/components/player-progress-provider";
import { armorCampaignWorlds, getArmorCampaignStage, type CampaignStage } from "@/lib/armadura-campaign";
import type { RewardResult } from "@/types/player-progress";

type CampaignScreen = "map" | "intro" | "playing" | "reward" | "narrative" | "final";
type LevelNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type Control = "left" | "right" | "jump" | "interact";
type Position = { x: number; y: number; velocityY: number; grounded: boolean };

const AVATAR_WIDTH = 4.8;
const AVATAR_HEIGHT = 10.5;

function timeLabel(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

function StageControls({ onControl, onAction }: { onControl: (control: Control, active: boolean) => void; onAction: (control: "jump" | "interact") => void }) {
  const hold = (control: Control) => ({
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      onControl(control, true);
      if (control === "jump" || control === "interact") onAction(control);
    },
    onPointerUp: () => onControl(control, false),
    onPointerCancel: () => onControl(control, false),
    onPointerLeave: () => onControl(control, false),
  });

  return (
    <div className="mt-4 flex items-end justify-between gap-4 lg:hidden" aria-label="Controles táctiles">
      <div className="flex gap-2">
        <button type="button" aria-label="Mover a la izquierda" className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-2xl font-black text-ink shadow-card touch-none active:scale-95" {...hold("left")}>←</button>
        <button type="button" aria-label="Mover a la derecha" className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-2xl font-black text-ink shadow-card touch-none active:scale-95" {...hold("right")}>→</button>
      </div>
      <div className="flex gap-2">
        <button type="button" aria-label="Interactuar" onClick={() => onAction("interact")} className="grid h-14 min-w-14 place-items-center rounded-2xl bg-violet px-3 text-sm font-black text-white shadow-card touch-none active:scale-95" {...hold("interact")}>E</button>
        <button type="button" aria-label="Saltar" onClick={() => onAction("jump")} className="grid h-14 min-w-20 place-items-center rounded-2xl bg-sun px-3 text-sm font-black text-ink shadow-card touch-none active:scale-95" {...hold("jump")}>SALTAR</button>
      </div>
    </div>
  );
}

function AdventureStage({ stage, onComplete }: { stage: CampaignStage; onComplete: (elapsedSeconds: number) => void }) {
  const input = useRef<Record<Control, boolean>>({ left: false, right: false, jump: false, interact: false });
  const onCompleteRef = useRef(onComplete);
  const position = useRef<Position>({ x: stage.start.x, y: stage.start.y, velocityY: 0, grounded: true });
  const checkpoint = useRef({ ...stage.start });
  const collectedRef = useRef<string[]>([]);
  const interactedRef = useRef(false);
  const interactionLock = useRef(false);
  const finishing = useRef(false);
  const startedAt = useRef(Date.now());
  const [view, setView] = useState(position.current);
  const [collected, setCollected] = useState<string[]>([]);
  const [interacted, setInteracted] = useState(false);
  const [message, setMessage] = useState(stage.interaction.prompt);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [challengeFeedback, setChallengeFeedback] = useState<string | null>(null);
  const [precision, setPrecision] = useState(0);
  const [selectedFruits, setSelectedFruits] = useState<string[]>([]);
  const [memorySteps, setMemorySteps] = useState<string[]>([]);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  const resetToCheckpoint = useCallback((text: string) => {
    position.current = { x: checkpoint.current.x, y: checkpoint.current.y, velocityY: 0, grounded: true };
    setView(position.current);
    setMessage(text);
  }, []);

  const requestJump = useCallback(() => {
    const current = position.current;
    if (!current.grounded || finishing.current) return;
    current.velocityY = -2.2;
    current.grounded = false;
    input.current.jump = false;
    setView({ ...current });
  }, []);

  const handleInteraction = useCallback(() => {
    const avatarCenter = position.current.x + AVATAR_WIDTH / 2;
    if (Math.abs(avatarCenter - stage.interaction.x) > 9) {
      setMessage("Acércate al elemento brillante para interactuar.");
      return;
    }
    if (interactedRef.current) {
      setMessage(stage.interaction.response);
      return;
    }
    if (stage.interaction.question || stage.interaction.challenge) {
      setChallengeFeedback(null);
      setPrecision(0);
      setSelectedFruits([]);
      setMemorySteps([]);
      setChallengeOpen(true);
      return;
    }
    interactedRef.current = true;
    checkpoint.current = { x: Math.min(stage.interaction.x + 3, 88), y: stage.groundY - AVATAR_HEIGHT };
    setInteracted(true);
    setMessage(stage.interaction.response);
  }, [stage]);

  const collectToken = useCallback((id: string) => {
    if (collectedRef.current.includes(id)) return;
    collectedRef.current = [...collectedRef.current, id];
    setCollected(collectedRef.current);
    setMessage("¡Destello de fe encontrado! Sigue reuniendo la luz del camino.");
  }, []);

  const tryFinish = useCallback(() => {
    if (finishing.current) return;
    if (collectedRef.current.length < stage.tokens.length) {
      setMessage(`Aún faltan ${stage.tokens.length - collectedRef.current.length} destellos de fe.`);
      return;
    }
    if (!interactedRef.current) {
      setMessage(stage.interaction.prompt);
      return;
    }
    finishing.current = true;
    onCompleteRef.current(Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)));
  }, [stage]);

  useEffect(() => {
    const keyToControl: Record<string, Control | undefined> = {
      ArrowLeft: "left",
      KeyA: "left",
      ArrowRight: "right",
      KeyD: "right",
      Space: "jump",
      ArrowUp: "jump",
      KeyE: "interact",
    };
    const setKey = (event: KeyboardEvent, active: boolean) => {
      const control = keyToControl[event.code];
      if (!control) return;
      event.preventDefault();
      if (active && control === "jump") {
        if (!event.repeat) requestJump();
        return;
      }
      input.current[control] = active;
    };
    const down = (event: KeyboardEvent) => setKey(event, true);
    const up = (event: KeyboardEvent) => setKey(event, false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    const clearControls = () => { input.current = { left: false, right: false, jump: false, interact: false }; };
    window.addEventListener("blur", clearControls);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clearControls);
    };
  }, [requestJump]);

  useEffect(() => {
    if (challengeOpen || finishing.current) return;
    let animationFrame = 0;
    let previous = performance.now();

    const frame = (now: number) => {
      const multiplier = Math.min(2, Math.max(0.5, (now - previous) / 16.67));
      previous = now;
      const current = position.current;
      const horizontal = (input.current.right ? 1 : 0) - (input.current.left ? 1 : 0);
      current.x = Math.max(0, Math.min(100 - AVATAR_WIDTH, current.x + horizontal * 0.48 * multiplier));

      const previousBottom = current.y + AVATAR_HEIGHT;
      current.velocityY = Math.min(2.6, current.velocityY + 0.115 * multiplier);
      current.y += current.velocityY * multiplier;
      current.grounded = false;
      const currentBottom = current.y + AVATAR_HEIGHT;

      if (current.velocityY >= 0) {
        if (previousBottom <= stage.groundY && currentBottom >= stage.groundY) {
          current.y = stage.groundY - AVATAR_HEIGHT;
          current.velocityY = 0;
          current.grounded = true;
        }
        for (const platform of stage.platforms) {
          const overlaps = current.x + AVATAR_WIDTH > platform.x && current.x < platform.x + platform.width;
          if (overlaps && previousBottom <= platform.y && currentBottom >= platform.y) {
            current.y = platform.y - AVATAR_HEIGHT;
            current.velocityY = 0;
            current.grounded = true;
          }
        }
      }

      for (const token of stage.tokens) {
        if (!collectedRef.current.includes(token.id) && Math.abs(current.x + AVATAR_WIDTH / 2 - token.x) < 4.6 && Math.abs(current.y + AVATAR_HEIGHT / 2 - token.y) < 8) {
          collectToken(token.id);
        }
      }

      const onGround = current.y + AVATAR_HEIGHT >= stage.groundY - 0.1;
      if (onGround && stage.hazards.some((hazard) => current.x + AVATAR_WIDTH > hazard.x && current.x < hazard.x + hazard.width)) {
        resetToCheckpoint("Una nube traviesa te hizo volver al último faro. ¡Puedes intentarlo otra vez!");
      }

      if (input.current.interact && !interactionLock.current) {
        interactionLock.current = true;
        handleInteraction();
      }
      if (!input.current.interact) interactionLock.current = false;

      if (current.x + AVATAR_WIDTH / 2 >= stage.goal.x) tryFinish();
      setView({ ...position.current });
      animationFrame = requestAnimationFrame(frame);
    };
    animationFrame = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animationFrame);
  }, [challengeOpen, collectToken, handleInteraction, resetToCheckpoint, stage, tryFinish]);

  const completeInteraction = (message: string) => {
    interactedRef.current = true;
    checkpoint.current = { x: Math.min(stage.interaction.x + 3, 88), y: stage.groundY - AVATAR_HEIGHT };
    setInteracted(true);
    setChallengeOpen(false);
    setChallengeFeedback(null);
    setMessage(message);
  };

  const answerQuestion = (choice: number) => {
    const question = stage.interaction.question;
    if (!question) return;
    if (choice !== question.correctOption) {
      setChallengeFeedback("Todavía no. Lee la pregunta con calma y vuelve a intentarlo.");
      return;
    }
    completeInteraction(`${stage.interaction.response} ${question.explanation}`);
  };

  useEffect(() => {
    if (!challengeOpen || stage.interaction.challenge?.kind !== "precision") return;
    const timer = window.setInterval(() => setPrecision((value) => (value + 7) % 101), 100);
    return () => window.clearInterval(timer);
  }, [challengeOpen, stage]);

  const submitPrecision = () => {
    const challenge = stage.interaction.challenge;
    if (!challenge || challenge.kind !== "precision") return;
    if (precision < 42 || precision > 58) {
      setChallengeFeedback("Casi. Espera a que la luz entre en el círculo dorado y vuelve a intentarlo.");
      return;
    }
    completeInteraction(`${stage.interaction.response} ${challenge.explanation}`);
  };

  const toggleFruit = (fruit: string) => {
    const challenge = stage.interaction.challenge;
    if (!challenge || challenge.kind !== "collection") return;
    const next = selectedFruits.includes(fruit) ? selectedFruits.filter((item) => item !== fruit) : [...selectedFruits, fruit];
    setSelectedFruits(next);
    if (challenge.requiredOptions.every((required) => next.includes(required))) completeInteraction(`${stage.interaction.response} ${challenge.explanation}`);
  };

  const pressMemory = (symbol: string) => {
    const challenge = stage.interaction.challenge;
    if (!challenge || challenge.kind !== "memory") return;
    const expected = challenge.sequence[memorySteps.length];
    if (symbol !== expected) {
      setMemorySteps([]);
      setChallengeFeedback("La secuencia se reinició. Mira las señales y prueba otra vez con calma.");
      return;
    }
    const next = [...memorySteps, symbol];
    setMemorySteps(next);
    if (next.length === challenge.sequence.length) completeInteraction(`${stage.interaction.response} ${challenge.explanation}`);
  };

  const setControl = useCallback((control: Control, active: boolean) => {
    input.current[control] = active;
  }, []);

  const triggerAction = useCallback((control: "jump" | "interact") => {
    if (control === "jump") requestJump();
    else handleInteraction();
  }, [handleInteraction, requestJump]);

  return (
    <div className="rounded-[2rem] border border-ink/10 bg-white p-3 shadow-lift sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
        <div><p className="text-xs font-black uppercase tracking-[.18em] text-violet">{stage.worldLabel}</p><h2 className="font-display text-2xl font-black text-ink">{stage.title}</h2></div>
        <div className="flex items-center gap-2"><span className="rounded-full bg-sun/30 px-3 py-2 text-xs font-black text-ink">✦ {collected.length}/{stage.tokens.length}</span><span className="hidden rounded-full bg-sky px-3 py-2 text-xs font-black text-ink sm:inline">Elián · Explorador</span></div>
      </div>

      <div className="relative min-h-[290px] overflow-hidden rounded-[1.5rem] border-4 border-white bg-[linear-gradient(180deg,#86ddff_0%,#c8f2ff_53%,#def7d3_54%,#a7dc83_100%)] shadow-inner sm:min-h-[380px]" aria-label={`Nivel jugable: ${stage.title}`}>
        <div className="absolute inset-0 opacity-70 cloud-dots" />
        <div className="absolute left-[8%] top-[15%] h-9 w-20 rounded-full bg-white/75 blur-[1px]" /><div className="absolute left-[13%] top-[10%] h-8 w-11 rounded-full bg-white/75" />
        <div className="absolute right-[12%] top-[20%] h-8 w-24 rounded-full bg-white/70" /><div className="absolute right-[19%] top-[15%] h-7 w-10 rounded-full bg-white/70" />
        <div className="absolute bottom-0 left-0 right-0 h-[16%] border-t-4 border-leaf/30 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,.13)_0_18px,transparent_18px_36px)]" />
        {stage.platforms.map((platform, index) => <div key={`${platform.x}-${platform.y}`} className="absolute rounded-xl border-b-4 border-[#24725e] bg-leaf shadow-[inset_0_5px_0_rgba(255,255,255,.26)]" style={{ left: `${platform.x}%`, top: `${platform.y}%`, width: `${platform.width}%`, height: "5.5%" }}><span className="absolute left-2 top-1 h-1 w-5 rounded-full bg-white/30" /><span className="sr-only">Plataforma {index + 1}</span></div>)}
        {stage.hazards.map((hazard) => <div key={hazard.id} className="absolute bottom-[16%] flex h-8 items-end gap-1 rounded-t-full bg-violet/75 px-2 pb-1" style={{ left: `${hazard.x}%`, width: `${hazard.width}%` }} aria-label="Nube traviesa: salta por encima"><span className="h-3 w-3 rounded-full bg-white/80" /><span className="h-4 w-4 rounded-full bg-white/90" /></div>)}
        {stage.tokens.map((token) => !collected.includes(token.id) && <div key={token.id} className={`absolute grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-sun text-sm text-ink shadow-card ${token.secret ? "animate-pulse" : ""}`} style={{ left: `${token.x}%`, top: `${token.y}%` }} aria-label={token.secret ? "Destello secreto" : "Destello de fe"}>✦</div>)}
        <div className="absolute bottom-[16%] grid h-14 w-12 -translate-x-1/2 place-items-center rounded-t-2xl border-4 border-violet bg-white shadow-card" style={{ left: `${stage.interaction.x}%` }}><span className="text-2xl">{stage.interaction.question ? "?" : "📖"}</span><span className="absolute -bottom-6 whitespace-nowrap rounded-full bg-ink px-2 py-1 text-[9px] font-black text-white">{stage.interaction.label}</span></div>
        <div className="absolute bottom-[16%] grid h-20 w-12 -translate-x-1/2 place-items-center rounded-t-full border-4 border-sun bg-white shadow-card" style={{ left: `${stage.goal.x}%` }}><span className="text-xl">✦</span><span className="absolute -bottom-6 whitespace-nowrap rounded-full bg-ink px-2 py-1 text-[9px] font-black text-white">{stage.goal.label}</span></div>
        <div className="absolute z-20 grid h-12 w-10 place-items-center transition-[left,top] duration-75" style={{ left: `${view.x}%`, top: `${view.y}%` }} aria-label="Elián, aventurero"><div className="relative grid h-10 w-8 place-items-center rounded-t-[1.2rem] rounded-b-lg border-2 border-ink bg-coral shadow-card"><span className="text-base">✦</span><span className="absolute -right-2 bottom-0 grid h-5 w-5 place-items-center rounded bg-white text-[9px]">📖</span></div></div>
        <p className="absolute bottom-2 left-3 max-w-[70%] rounded-xl bg-ink/85 px-3 py-2 text-xs font-bold leading-5 text-white" aria-live="polite">{message}</p>
      </div>

      <p className="mt-4 hidden rounded-2xl bg-sky px-4 py-3 text-sm font-bold leading-6 text-ink lg:block">Controles: <kbd className="rounded bg-white px-1.5 py-1">A</kbd>/<kbd className="rounded bg-white px-1.5 py-1">D</kbd> o flechas para mover · <kbd className="rounded bg-white px-1.5 py-1">Espacio</kbd> para saltar · <kbd className="rounded bg-white px-1.5 py-1">E</kbd> para interactuar.</p>
      <StageControls onControl={setControl} onAction={triggerAction} />
      <p className="mt-4 px-1 text-sm leading-6 text-ink/65"><span className="font-extrabold text-ink">Objetivo:</span> reúne los {stage.tokens.length} destellos, conversa con {stage.interaction.label} y llega al {stage.goal.label}. {interacted && "✓ Mensaje del camino atendido."}</p>

      {challengeOpen && <div className="fixed inset-0 z-[70] grid place-items-center bg-ink/55 p-4"><section role="dialog" aria-modal="true" aria-label="Desafío del camino" className="w-full max-w-md rounded-[1.8rem] bg-white p-6 shadow-lift"><p className="text-xs font-black uppercase tracking-[.18em] text-violet">{stage.interaction.label}</p>{stage.interaction.question && <><h3 className="mt-2 font-display text-2xl font-black text-ink">{stage.interaction.question.text}</h3><div className="mt-5 grid gap-3">{stage.interaction.question.options.map((option, index) => <button key={option} type="button" onClick={() => answerQuestion(index)} className="rounded-2xl border-2 border-ink/10 px-4 py-3 text-left text-sm font-bold text-ink transition hover:border-violet hover:bg-violet/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/25">{option}</button>)}</div></>}{stage.interaction.challenge?.kind === "precision" && <><h3 className="mt-2 font-display text-2xl font-black text-ink">{stage.interaction.challenge.text}</h3><div className="mt-6 h-6 overflow-hidden rounded-full bg-sky p-1"><div className="h-full w-4 rounded-full bg-violet transition-transform" style={{ transform: `translateX(${precision * 5.5}%)` }} /></div><div className="mt-3 flex justify-center"><span className="rounded-lg bg-sun/35 px-4 py-2 text-xs font-black text-ink">Círculo dorado: 42–58</span></div><button type="button" onClick={submitPrecision} className="mt-5 w-full rounded-xl bg-violet px-4 py-3 text-sm font-extrabold text-white">Enviar destello</button></>}{stage.interaction.challenge?.kind === "collection" && <><h3 className="mt-2 font-display text-2xl font-black text-ink">{stage.interaction.challenge.text}</h3><div className="mt-5 grid grid-cols-2 gap-2">{stage.interaction.challenge.options.map((fruit) => <button key={fruit} type="button" onClick={() => toggleFruit(fruit)} className={`rounded-xl px-3 py-3 text-sm font-extrabold ${selectedFruits.includes(fruit) ? "bg-leaf text-white" : "bg-sky text-ink"}`}>{selectedFruits.includes(fruit) ? "✓ " : ""}{fruit}</button>)}</div></>}{stage.interaction.challenge?.kind === "memory" && <><h3 className="mt-2 font-display text-2xl font-black text-ink">{stage.interaction.challenge.text}</h3><p className="mt-3 text-sm font-bold text-ink/60">Progreso: {memorySteps.join(" · ") || "—"}</p><div className="mt-5 grid grid-cols-3 gap-2">{["Libro", "Escudo", "Estrella"].map((symbol) => <button key={symbol} type="button" onClick={() => pressMemory(symbol)} className="rounded-xl bg-sky px-2 py-4 text-sm font-extrabold text-ink hover:bg-sun/45">{symbol}</button>)}</div></>}{challengeFeedback && <p className="mt-4 rounded-xl bg-coral/15 p-3 text-sm font-bold text-ink" role="status">{challengeFeedback}</p>}<button type="button" onClick={() => setChallengeOpen(false)} className="mt-5 text-sm font-extrabold text-violet hover:underline">Volver al nivel</button></section></div>}
    </div>
  );
}

function CampaignMap({ unlockedLevel, completedLevelIds, onSelect }: { unlockedLevel: number; completedLevelIds: string[]; onSelect: (level: LevelNumber) => void }) {
  return (
    <section className="rounded-[2rem] bg-[linear-gradient(135deg,#eefbff_0%,#f3efff_52%,#fff8dc_100%)] p-5 shadow-card sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.2em] text-violet">Mapa de campaña</p><h2 className="mt-2 font-display text-4xl font-black tracking-tight text-ink">Sigue la luz</h2><p className="mt-2 max-w-xl text-sm leading-6 text-ink/65">Cada mundo muestra el próximo paso de Elián. Completa los niveles disponibles para encender una nueva ruta.</p></div><span className="rounded-full bg-white px-4 py-2 text-sm font-black text-ink shadow-card">7 mundos · progreso local</span></div>
      <ol className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{armorCampaignWorlds.map((world) => {
        const requiredLevel = world.world;
        const completed = completedLevelIds.includes(`armadura-level-${world.world}`);
        const playable = unlockedLevel >= requiredLevel;
        const stateLabel = completed ? "Completado" : playable ? "Disponible" : "Bloqueado";
        return <li key={world.world} className="relative"><button type="button" disabled={!playable} onClick={() => onSelect(world.world as LevelNumber)} className={`group w-full rounded-[1.5rem] border-2 p-4 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/25 ${playable ? "border-violet bg-white shadow-card hover:-translate-y-1" : "border-ink/5 bg-white/65 opacity-75"}`}><div className="flex items-start justify-between gap-3"><span className={`grid h-10 w-10 place-items-center rounded-xl font-display text-lg font-black ${completed ? "bg-leaf text-white" : playable ? "bg-violet text-white" : "bg-ink/10 text-ink/45"}`}>{completed ? "✓" : world.world}</span><span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide ${completed ? "bg-leaf/10 text-leaf" : playable ? "bg-violet/10 text-violet" : "bg-ink/5 text-ink/45"}`}>{stateLabel}</span></div><p className="mt-4 text-xs font-black uppercase tracking-[.14em] text-ink/45">Mundo {world.world}</p><h3 className="mt-1 font-display text-xl font-black text-ink">{world.title}</h3><p className="mt-1 text-sm font-semibold text-ink/60">{world.subtitle}</p>{playable && <p className="mt-4 text-xs font-black text-violet">{completed ? "Jugar de nuevo" : "Comenzar aventura →"}</p>}</button></li>;
      })}</ol>
    </section>
  );
}

export function ArmaduraCampaign() {
  const { progress, completeCampaignLevel } = usePlayerProgress();
  const [screen, setScreen] = useState<CampaignScreen>("map");
  const [activeLevel, setActiveLevel] = useState<LevelNumber>(1);
  const [lastReward, setLastReward] = useState<RewardResult | null>(null);
  const stage = getArmorCampaignStage(activeLevel);
  const campaign = progress.armorCampaign;

  const selectLevel = (level: LevelNumber) => {
    if (level > campaign.unlockedLevel) return;
    setActiveLevel(level);
    setScreen("intro");
  };

  const completeStage = (elapsedSeconds: number) => {
    if (!stage) return;
    const result = completeCampaignLevel({
      levelId: stage.id,
      unlocksLevel: Math.min(7, stage.level + 1),
      points: stage.reward.points,
      xp: stage.reward.xp,
      faithTokens: stage.reward.faithTokens,
      badge: stage.reward.badge,
      armorPiece: stage.reward.armorPiece,
      elapsedSeconds,
    });
    setLastReward(result);
    setScreen("reward");
  };

  if (!stage) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Link href="/aventuras" className="text-sm font-extrabold text-violet hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/25">← Volver a aventuras</Link>
      <section className="mt-6 overflow-hidden rounded-[2.3rem] bg-ink px-6 py-9 text-white shadow-lift sm:px-10"><div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end"><div><p className="text-xs font-black uppercase tracking-[.22em] text-sun">Aventura Vida: La Gran Aventura</p><h1 className="mt-3 max-w-3xl font-display text-4xl font-black tracking-tight sm:text-6xl">En busca de la Armadura del Espíritu</h1><p className="mt-4 max-w-2xl text-base leading-7 text-white/70">Acompaña a Elián por un mundo original de senderos luminosos, decisiones sabias y desafíos de esperanza.</p></div><div className="grid grid-cols-2 gap-2 text-center text-xs font-black"><div className="rounded-2xl bg-white/10 p-3"><span className="block text-xl text-sun">✦ {campaign.faithTokens}</span>destellos</div><div className="rounded-2xl bg-white/10 p-3"><span className="block text-xl text-sun">{campaign.armorPieces.length}/6</span>armaduras</div></div></div></section>

      <div className="mt-8" aria-live="polite">
        {screen === "map" && <CampaignMap unlockedLevel={campaign.unlockedLevel} completedLevelIds={campaign.completedLevelIds} onSelect={selectLevel} />}
        {screen === "intro" && <section className="mx-auto max-w-3xl rounded-[2rem] bg-white p-7 shadow-card sm:p-10"><p className="text-xs font-black uppercase tracking-[.18em] text-violet">{stage.worldLabel}</p><h2 className="mt-3 font-display text-4xl font-black text-ink">Nivel {stage.level}: {stage.title}</h2><p className="mt-4 text-base leading-7 text-ink/70">{stage.intro}</p><div className="mt-6 rounded-2xl bg-sky p-4 text-sm font-bold leading-6 text-ink"><span className="text-violet">Enseñanza del camino:</span> {stage.teaching}</div><div className="mt-7 flex flex-wrap gap-3"><button type="button" onClick={() => setScreen("playing")} className="rounded-2xl bg-violet px-6 py-3 text-sm font-black text-white shadow-card transition hover:bg-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/25">Comenzar nivel →</button><button type="button" onClick={() => setScreen("map")} className="rounded-2xl bg-sky px-5 py-3 text-sm font-black text-ink hover:bg-sky-500/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/25">Ver mapa</button></div></section>}
        {screen === "playing" && <AdventureStage key={stage.id} stage={stage} onComplete={completeStage} />}
        {screen === "reward" && <section className="mx-auto max-w-2xl rounded-[2rem] bg-white p-7 text-center shadow-lift sm:p-10"><div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.7rem] bg-sun text-4xl text-ink shadow-card">✦</div><p className="mt-5 text-xs font-black uppercase tracking-[.2em] text-violet">Recompensa desbloqueada</p><h2 className="mt-2 font-display text-4xl font-black text-ink">{stage.reward.title}</h2><p className="mx-auto mt-4 max-w-lg text-base leading-7 text-ink/70">{stage.reward.description}</p><div className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-3"><div className="rounded-2xl bg-sky p-3 text-sm font-black text-ink">+{stage.reward.xp}<span className="mt-1 block text-[10px] uppercase text-ink/55">XP</span></div><div className="rounded-2xl bg-sun/30 p-3 text-sm font-black text-ink">+{stage.reward.points}<span className="mt-1 block text-[10px] uppercase text-ink/55">Puntos</span></div><div className="rounded-2xl bg-leaf/15 p-3 text-sm font-black text-ink">+{stage.reward.faithTokens}<span className="mt-1 block text-[10px] uppercase text-ink/55">Destellos</span></div></div>{lastReward && <p className="mt-5 text-sm font-bold text-ink/60">Total: {lastReward.totalXp} XP · Nivel {lastReward.level} · Racha {lastReward.streak}</p>}<button type="button" onClick={() => setScreen("narrative")} className="mt-8 rounded-2xl bg-violet px-6 py-3 text-sm font-black text-white shadow-card transition hover:bg-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/25">Continuar la historia →</button></section>}
        {screen === "narrative" && <section className="mx-auto max-w-2xl overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#edeaff_0%,#e9fbff_100%)] p-7 text-center shadow-card sm:p-10"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white text-3xl shadow-card">🧭</div><p className="mt-5 text-xs font-black uppercase tracking-[.2em] text-violet">Historia desbloqueada</p><h2 className="mt-2 font-display text-4xl font-black text-ink">{stage.nextNarrative.title}</h2><p className="mx-auto mt-4 max-w-lg text-base leading-7 text-ink/70">{stage.nextNarrative.text}</p><button type="button" onClick={() => stage.level < 7 ? selectLevel((stage.level + 1) as LevelNumber) : setScreen("final")} className="mt-8 rounded-2xl bg-ink px-6 py-3 text-sm font-black text-white shadow-card transition hover:bg-violet focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/25">{stage.nextNarrative.action} →</button></section>}
        {screen === "final" && <section className="mx-auto max-w-2xl overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#fff2b9_0%,#e9fbff_52%,#eeeaff_100%)] p-7 text-center shadow-lift sm:p-10"><div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.7rem] bg-sun text-4xl text-ink shadow-card">🏆</div><p className="mt-5 text-xs font-black uppercase tracking-[.2em] text-violet">La Gran Aventura</p><h2 className="mt-2 font-display text-4xl font-black text-ink">¡AVENTURA COMPLETADA!</h2><p className="mx-auto mt-4 max-w-lg text-base leading-7 text-ink/70">Elián llegó a la Ciudad Celestial. Cada paso, cada destello y cada decisión se guardaron como parte de tu camino.</p><div className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-3"><div className="rounded-2xl bg-white p-3 text-sm font-black text-ink">{campaign.completedLevelIds.length}/7<span className="mt-1 block text-[10px] uppercase text-ink/55">niveles</span></div><div className="rounded-2xl bg-white p-3 text-sm font-black text-ink">{campaign.armorPieces.length}/6<span className="mt-1 block text-[10px] uppercase text-ink/55">armaduras</span></div><div className="rounded-2xl bg-white p-3 text-sm font-black text-ink">{timeLabel(campaign.adventureSeconds)}<span className="mt-1 block text-[10px] uppercase text-ink/55">tiempo</span></div></div><button type="button" onClick={() => setScreen("map")} className="mt-8 rounded-2xl bg-ink px-6 py-3 text-sm font-black text-white shadow-card hover:bg-violet">Explorar el mapa</button></section>}
      </div>

      <section className="mt-10 grid gap-4 rounded-[1.8rem] border border-ink/5 bg-white p-5 shadow-card md:grid-cols-3"><div><p className="text-xs font-black uppercase tracking-[.16em] text-violet">Progreso guardado</p><p className="mt-1 text-sm font-semibold leading-6 text-ink/65">Esta aventura usa el mismo progreso local del perfil: XP, puntos, racha, logros y partidas completadas.</p></div><div><p className="text-xs font-black uppercase tracking-[.16em] text-violet">Siete niveles jugables</p><p className="mt-1 text-sm font-semibold leading-6 text-ink/65">Los siete mundos están abiertos durante la fase de pruebas; también puedes seguir la historia sin volver al menú.</p></div><div><p className="text-xs font-black uppercase tracking-[.16em] text-violet">Tiempo de aventura</p><p className="mt-1 font-display text-2xl font-black text-ink">{timeLabel(campaign.adventureSeconds)}</p></div></section>
    </div>
  );
}
