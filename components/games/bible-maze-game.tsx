"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GameLoading, VictoryPanel, useGameCompletion } from "@/components/games/game-shell";
import { MultiplayerLobby } from "@/components/multiplayer/multiplayer-lobby";
import { useMultiplayerRoom } from "@/components/multiplayer/use-multiplayer-room";
import { usePlayerProgress } from "@/components/player-progress-provider";
import { bibleMazeLevels, mazeCellAt, mazePointFor, mazeTokenKeys, nextMazePoint, type MazeDirection, type MazePoint } from "@/lib/bible-maze";

const GAME_ID = "bible-maze";
const directionLabels: Record<MazeDirection, string> = { up: "Arriba", down: "Abajo", left: "Izquierda", right: "Derecha" };
const directionIcons: Record<MazeDirection, string> = { up: "↑", down: "↓", left: "←", right: "→" };

function pointKey(point: MazePoint) { return `${point.row}-${point.column}`; }

function ImmediateControl({ direction, onMove }: { direction: MazeDirection; onMove: (direction: MazeDirection) => void }) {
  const pointerHandled = useRef(false);
  return <button
    type="button"
    aria-label={`Mover ${directionLabels[direction]}`}
    onPointerDown={(event) => { event.preventDefault(); pointerHandled.current = true; onMove(direction); }}
    onClick={() => {
      if (pointerHandled.current) { pointerHandled.current = false; return; }
      onMove(direction);
    }}
    className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-2xl font-black text-ink shadow-card transition active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/25"
  >{directionIcons[direction]}</button>;
}

export function BibleMazeGame() {
  const { progress, hydrated } = usePlayerProgress();
  const { result, finish, resetCompletion, saveGameProgress } = useGameCompletion(GAME_ID);
  const multiplayer = useMultiplayerRoom("bible-maze");
  const [screen, setScreen] = useState<"map" | "playing">("map");
  const [levelNumber, setLevelNumber] = useState(1);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [routeVersion, setRouteVersion] = useState(0);
  const [position, setPosition] = useState<MazePoint>({ row: 0, column: 0 });
  const [collected, setCollected] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [message, setMessage] = useState("Elige una ruta y avanza con calma.");
  const [completedLevel, setCompletedLevel] = useState<number | null>(null);
  const positionRef = useRef<MazePoint>({ row: 0, column: 0 });
  const collectedRef = useRef<string[]>([]);
  const completedRef = useRef(false);

  const level = bibleMazeLevels[levelNumber - 1];
  const layout = level.layouts[routeVersion % level.layouts.length];
  const start = useMemo(() => mazePointFor(layout, "S"), [layout]);
  const tokenKeys = useMemo(() => mazeTokenKeys(layout), [layout]);

  const resetBoard = useCallback(() => {
    positionRef.current = start;
    collectedRef.current = [];
    completedRef.current = false;
    setPosition(start);
    setCollected([]);
    setMoves(0);
    setCompletedLevel(null);
    setMessage(`${level.objective} Usa flechas o WASD.`);
  }, [level.objective, start]);

  useEffect(() => { resetBoard(); }, [resetBoard]);

  useEffect(() => {
    if (!hydrated) return;
    const saved = progress.gameProgress[GAME_ID]?.unlockedLevel;
    const nextUnlocked = typeof saved === "number" && Number.isFinite(saved) ? Math.max(1, Math.min(bibleMazeLevels.length, Math.floor(saved))) : 1;
    setUnlockedLevel(nextUnlocked);
    setLevelNumber((current) => Math.min(current, nextUnlocked));
  }, [hydrated, progress.gameProgress]);

  const completeLevel = useCallback(() => {
    if (completedRef.current || result) return;
    completedRef.current = true;
    const nextUnlocked = Math.min(bibleMazeLevels.length, Math.max(unlockedLevel, levelNumber + 1));
    setCompletedLevel(levelNumber);
    setUnlockedLevel(nextUnlocked);
    saveGameProgress(GAME_ID, {
      unlockedLevel: nextUnlocked,
      lastCompletedLevel: levelNumber,
      lastRoute: routeVersion % level.layouts.length,
      lastMoves: moves,
      completedAt: new Date().toISOString(),
    });
    multiplayer.sendAction({ type: "maze.level-complete", level: levelNumber });
    finish(level.reward);
  }, [finish, level.layouts.length, level.reward, levelNumber, moves, multiplayer, result, routeVersion, saveGameProgress, unlockedLevel]);

  const move = useCallback((direction: MazeDirection) => {
    if (screen !== "playing" || result || completedRef.current) return;
    const next = nextMazePoint(positionRef.current, direction);
    const cell = mazeCellAt(layout, next);
    if (!cell || cell === "#" || cell === "~") {
      setMessage(cell === "~" ? "La niebla suave cubre esa ruta. Prueba otro camino." : "Ese muro de piedras no tiene paso. Busca un desvío.");
      return;
    }
    const key = pointKey(next);
    const foundNewToken = cell === "*" && !collectedRef.current.includes(key);
    const nextCollected = foundNewToken ? [...collectedRef.current, key] : collectedRef.current;
    positionRef.current = next;
    collectedRef.current = nextCollected;
    setPosition(next);
    if (foundNewToken) setCollected(nextCollected);
    const nextMoves = moves + 1;
    setMoves(nextMoves);
    multiplayer.sendAction({ type: "maze.move", level: levelNumber, row: next.row, column: next.column, moves: nextMoves });
    if (foundNewToken) setMessage(`¡Destello encontrado! Llevas ${nextCollected.length}/${tokenKeys.length}.`);
    if (cell === "E") {
      if (nextCollected.length < tokenKeys.length) setMessage(`La salida se abrirá al reunir los ${tokenKeys.length} destellos.`);
      else completeLevel();
    }
  }, [completeLevel, layout, levelNumber, moves, multiplayer, result, screen, tokenKeys.length]);

  useEffect(() => {
    const codeToDirection: Record<string, MazeDirection | undefined> = {
      ArrowUp: "up", KeyW: "up", ArrowDown: "down", KeyS: "down", ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right",
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const direction = codeToDirection[event.code];
      if (!direction) return;
      event.preventDefault();
      move(direction);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [move]);

  const beginLevel = (nextLevel: number) => {
    if (nextLevel > unlockedLevel) return;
    const nextLayout = bibleMazeLevels[nextLevel - 1].layouts[0];
    const nextStart = mazePointFor(nextLayout, "S");
    resetCompletion();
    positionRef.current = nextStart;
    collectedRef.current = [];
    completedRef.current = false;
    setPosition(nextStart);
    setCollected([]);
    setMoves(0);
    setCompletedLevel(null);
    setLevelNumber(nextLevel);
    setRouteVersion(0);
    setScreen("playing");
  };
  const retryWithNewRoute = () => { resetCompletion(); setRouteVersion((value) => value + 1); setScreen("playing"); };
  const continueAdventure = () => {
    resetCompletion();
    if (levelNumber < bibleMazeLevels.length) {
      setLevelNumber((value) => value + 1);
      setRouteVersion(0);
      setScreen("playing");
    } else setScreen("map");
  };

  useEffect(() => {
    const activeLevel = multiplayer.room?.state.activeLevel;
    if (multiplayer.room?.status !== "PLAYING" || screen !== "map" || typeof activeLevel !== "number") return;
    beginLevel(Math.max(1, Math.min(bibleMazeLevels.length, activeLevel)));
  }, [multiplayer.room?.state.activeLevel, multiplayer.room?.status, screen]);

  if (!hydrated) return <GameLoading />;
  if (result) {
    const finalLevel = completedLevel === bibleMazeLevels.length;
    return <VictoryPanel
      title={finalLevel ? "¡Gran Laberinto Final superado!" : `¡Nivel ${completedLevel} completado!`}
      description={finalLevel ? "Tu recorrido terminó con una luz de esperanza. Puedes explorar cualquier ruta de nuevo." : `${level.teaching} La siguiente ruta ya está disponible.`}
      result={result}
      points={level.reward.points}
      xp={level.reward.xp}
      onPlayAgain={continueAdventure}
      actionLabel={finalLevel ? "Ver el mapa del laberinto" : `Continuar al nivel ${(completedLevel ?? levelNumber) + 1}`}
      secondaryAction={{ label: "Repetir con otra ruta", onAction: retryWithNewRoute }}
    />;
  }

  if (screen === "map") return <section className="mx-auto mt-6 max-w-4xl rounded-[1.8rem] bg-white p-5 shadow-card sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-violet">Mapa del Laberinto Bíblico</p><h2 className="mt-2 font-display text-4xl font-black text-ink">Siete caminos para explorar</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-ink/65">Elige un nivel desbloqueado. En cada partida puedes cambiar la ruta para encontrar un mapa diferente.</p></div><span className="rounded-xl bg-sun/35 px-4 py-3 text-sm font-black text-ink">{unlockedLevel}/7 rutas abiertas</span></div><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{bibleMazeLevels.map((item) => { const open = item.id <= unlockedLevel; return <button key={item.id} type="button" disabled={!open} onClick={() => beginLevel(item.id)} className={`rounded-2xl border-2 p-4 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/25 ${open ? "border-violet/20 bg-sky/45 hover:-translate-y-0.5 hover:border-violet" : "cursor-not-allowed border-ink/5 bg-ink/5 text-ink/40"}`}><div className="flex items-start justify-between gap-3"><span className={`grid h-9 w-9 place-items-center rounded-xl font-display text-lg font-black ${open ? "bg-violet text-white" : "bg-ink/10"}`}>{open ? item.id : "🔒"}</span><span className="text-xs font-black uppercase tracking-wide">{open ? "Jugar" : "Bloqueado"}</span></div><h3 className="mt-4 font-display text-xl font-black text-ink">{item.title}</h3><p className="mt-1 text-sm font-semibold leading-5 text-ink/60">{item.subtitle}</p></button>; })}</div><p className="mt-6 rounded-xl bg-[#e9fbf5] p-4 text-sm font-bold text-ink/70">Controles: usa <strong>flechas</strong> o <strong>W A S D</strong> en PC. En móvil, toca las flechas grandes: responden al instante.</p><div className="mt-5"><MultiplayerLobby multiplayer={multiplayer} /></div></section>;

  const columns = layout[0].length;
  const remotePlayers = multiplayer.room?.status === "PLAYING" ? multiplayer.room.players.filter((player) => {
    const state = player.state;
    return player.id !== multiplayer.identity.id && state.level === levelNumber && typeof state.row === "number" && typeof state.column === "number";
  }) : [];
  return <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]"><div className="rounded-[1.8rem] bg-white p-4 shadow-card sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.16em] text-violet">Nivel {level.id} de 7 · Ruta {(routeVersion % level.layouts.length) + 1}</p><h2 className="mt-1 font-display text-3xl font-black text-ink">{level.title}</h2><p className="mt-2 text-sm font-bold text-ink/65">{message}</p></div><div className="rounded-xl bg-sun/35 px-3 py-2 text-center text-sm font-black text-ink">✦ {collected.length}/{tokenKeys.length}<span className="mt-1 block text-[10px] uppercase text-ink/55">destellos</span></div></div>{multiplayer.room?.status === "PLAYING" && <p className="mt-3 rounded-xl bg-leaf/10 px-3 py-2 text-xs font-bold text-leaf">Sala {multiplayer.room.code} · {remotePlayers.length + 1}/{multiplayer.room.maxPlayers} exploradores sincronizados</p>}<div className="mx-auto mt-6 max-w-2xl rounded-[1.5rem] bg-[linear-gradient(135deg,#effcff_0%,#edf8dd_100%)] p-3 shadow-inner" style={{ touchAction: "none" }}><div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }} role="grid" aria-label={`Laberinto: ${level.title}`}>{layout.flatMap((line, row) => [...line].map((cell, column) => { const key = `${row}-${column}`; const playerHere = position.row === row && position.column === column; const friendsHere = remotePlayers.filter((player) => player.state.row === row && player.state.column === column); const starHere = cell === "*" && !collected.includes(key); const appearance = cell === "#" ? "bg-violet/80" : cell === "~" ? "bg-sky-500/60" : "bg-white/90"; return <div key={key} role="gridcell" aria-label={playerHere ? "Elián" : cell === "#" ? "Muro de piedras" : cell === "~" ? "Niebla" : cell === "E" ? "Salida" : starHere ? "Destello de luz" : "Camino"} className={`relative grid aspect-square min-h-8 place-items-center overflow-hidden rounded-lg text-base shadow-sm sm:min-h-10 ${appearance}`}>{cell === "#" && <span aria-hidden="true">🌿</span>}{cell === "~" && <span aria-hidden="true">☁</span>}{cell === "E" && <span aria-hidden="true">🏁</span>}{starHere && <span aria-hidden="true" className="text-sun">✦</span>}{cell === "S" && !playerHere && <span aria-hidden="true">⌂</span>}{friendsHere.map((player, index) => <span key={player.id} title={player.nickname} className="absolute bottom-0.5 right-0.5 grid h-4 w-4 place-items-center rounded-full bg-violet text-[8px] text-white">{player.avatar}</span>)}{playerHere && <span aria-label="Elián" className="absolute grid h-[72%] w-[72%] place-items-center rounded-full bg-coral text-xs font-black text-white shadow-card">E</span>}</div>; }))}</div></div><div className="mx-auto mt-5 grid w-fit grid-cols-3 gap-2" style={{ touchAction: "none" }} aria-label="Controles táctiles del laberinto"><span /><ImmediateControl direction="up" onMove={move} /><span /><ImmediateControl direction="left" onMove={move} /><button type="button" onClick={() => retryWithNewRoute()} className="grid h-14 w-14 place-items-center rounded-2xl bg-violet text-[10px] font-black leading-3 text-white shadow-card focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/25" aria-label="Cambiar a otra ruta">OTRA<br />RUTA</button><ImmediateControl direction="right" onMove={move} /><span /><ImmediateControl direction="down" onMove={move} /><span /></div></div><aside className="rounded-[1.8rem] bg-[#fff5cf] p-5 shadow-card"><p className="text-xs font-black uppercase tracking-[.16em] text-[#a66d00]">Objetivo</p><p className="mt-3 text-sm font-bold leading-6 text-ink">{level.objective}</p><div className="mt-5 rounded-xl bg-white p-4"><p className="text-xs font-black uppercase tracking-wide text-ink/50">Progreso de ruta</p><p className="mt-2 font-display text-2xl font-black text-ink">{moves} movimientos</p><p className="mt-1 text-xs font-bold text-ink/55">Las paredes y la niebla son obstáculos tranquilos: busca otro sendero.</p></div><p className="mt-5 rounded-xl bg-white/70 p-3 text-sm font-bold leading-6 text-ink/70">{level.teaching}</p><button type="button" onClick={() => setScreen("map")} className="mt-5 w-full rounded-xl bg-ink px-4 py-3 text-sm font-extrabold text-white hover:bg-violet focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/25">Ver mapa de niveles</button></aside></section>;
}
