"use client";

import { useRef, useState } from "react";
import { VictoryPanel, useGameCompletion } from "@/components/games/game-shell";

const palette = ["#ff6e67", "#ffc83d", "#1eaa82", "#5d91ed", "#7664e9", "#f7a8c4", "#9d6849"];
const paintAreas = ["sky", "sun", "rainbow-one", "rainbow-two", "hill-left", "hill-right", "water", "ark", "roof", "door"];
const defaults: Record<string, string> = { sky: "#e7f8ff", sun: "#fff7d4", "rainbow-one": "#f5e9ff", "rainbow-two": "#fff0c5", "hill-left": "#d9f3c6", "hill-right": "#c7ecb5", water: "#d9f7ff", ark: "#ffe3c0", roof: "#f7cfaa", door: "#fff6e9" };

export function ColoringGame() {
  const { result, finish, resetCompletion } = useGameCompletion("coloring-bible");
  const svgRef = useRef<SVGSVGElement>(null);
  const [color, setColor] = useState(palette[0]);
  const [colors, setColors] = useState(defaults);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const painted = paintAreas.filter((area) => colors[area] !== defaults[area]).length;

  const paint = (area: string) => { if (result) return; setColors((current) => ({ ...current, [area]: color })); setError(""); };
  const clear = () => { setColors(defaults); setSaved(false); setError(""); };
  const save = () => {
    try {
      if (!svgRef.current) throw new Error("No se encontró el dibujo.");
      const source = new XMLSerializer().serializeToString(svgRef.current);
      const url = URL.createObjectURL(new Blob([source], { type: "image/svg+xml" }));
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = "aventura-vida-arca-de-esperanza.svg"; anchor.click(); URL.revokeObjectURL(url); setSaved(true);
    } catch { setError("No pudimos guardar el dibujo. Intenta nuevamente."); }
  };
  const reset = () => { clear(); resetCompletion(); };
  if (result) return <VictoryPanel title="¡Tu escena está llena de color!" description="Compartiste luz, cuidado y esperanza con tu creación." result={result} points={220} xp={70} onPlayAgain={reset} />;
  return <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_290px]"><div className="overflow-hidden rounded-[1.7rem] bg-white p-3 shadow-card sm:p-6"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.16em] text-violet">El arca de la esperanza</p><p className="mt-1 text-sm font-bold text-ink/65">Elige un color y toca una parte de la escena.</p></div><span className="rounded-xl bg-sky px-3 py-2 text-xs font-black text-ink">{painted}/{paintAreas.length} partes coloreadas</span></div><svg ref={svgRef} viewBox="0 0 800 510" className="w-full touch-none select-none rounded-2xl border border-ink/5 bg-[#e7f8ff]" role="img" aria-label="Escena original del arca para colorear"><rect width="800" height="510" fill={colors.sky} onPointerDown={() => paint("sky")} /><circle cx="112" cy="94" r="48" fill={colors.sun} onPointerDown={() => paint("sun")} /><path d="M32 162 Q210 42 394 160" fill="none" stroke={colors["rainbow-one"]} strokeWidth="28" strokeLinecap="round" onPointerDown={() => paint("rainbow-one")} /><path d="M58 192 Q220 90 366 192" fill="none" stroke={colors["rainbow-two"]} strokeWidth="26" strokeLinecap="round" onPointerDown={() => paint("rainbow-two")} /><path d="M0 300 Q110 226 306 314 V510 H0Z" fill={colors["hill-left"]} onPointerDown={() => paint("hill-left")} /><path d="M800 286 Q640 218 423 315 V510 H800Z" fill={colors["hill-right"]} onPointerDown={() => paint("hill-right")} /><path d="M0 386 C156 342 275 433 420 388 C560 343 665 420 800 378 V510 H0Z" fill={colors.water} onPointerDown={() => paint("water")} /><path d="M220 315 Q402 246 590 316 L548 397 H260Z" fill={colors.ark} stroke="#172147" strokeWidth="7" strokeLinejoin="round" onPointerDown={() => paint("ark")} /><path d="M242 315 L402 196 L569 315Z" fill={colors.roof} stroke="#172147" strokeWidth="7" strokeLinejoin="round" onPointerDown={() => paint("roof")} /><rect x="366" y="300" width="70" height="97" rx="12" fill={colors.door} stroke="#172147" strokeWidth="7" onPointerDown={() => paint("door")} /><path d="M90 385 q20-30 40 0 q20-30 40 0" fill="none" stroke="#172147" strokeWidth="7" strokeLinecap="round" /><path d="M645 370 q15-24 30 0 q15-24 30 0" fill="none" stroke="#172147" strokeWidth="7" strokeLinecap="round" /></svg></div><aside className="rounded-[1.7rem] bg-[#fff5cf] p-5 shadow-card"><p className="text-xs font-black uppercase tracking-[.16em] text-[#a66d00]">Herramientas</p><div className="mt-4 grid grid-cols-4 gap-2">{palette.map((item) => <button key={item} type="button" onClick={() => setColor(item)} aria-label={`Usar color ${item}`} className={`h-11 rounded-xl border-4 transition-transform focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/25 ${color === item ? "scale-105 border-ink" : "border-white"}`} style={{ backgroundColor: item }} />)}<button type="button" onClick={() => setColor("#ffffff")} className={`rounded-xl border-4 bg-white text-xs font-black ${color === "#ffffff" ? "border-ink" : "border-white"}`}>Borrar</button></div><button type="button" onClick={clear} className="mt-5 w-full rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm font-extrabold text-ink hover:bg-sky focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/25">Limpiar dibujo</button><button type="button" onClick={save} className="mt-3 w-full rounded-xl bg-violet px-4 py-3 text-sm font-extrabold text-white hover:bg-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/25">Guardar dibujo</button>{saved && <p className="mt-3 rounded-xl bg-white p-3 text-xs font-bold text-leaf">✓ Tu dibujo se descargó en formato SVG.</p>}{error && <p role="alert" className="mt-3 rounded-xl bg-coral/10 p-3 text-xs font-bold text-coral">{error}</p>}<button type="button" disabled={painted < 3} onClick={() => finish({ points: 220, xp: 70 })} className="mt-5 w-full rounded-xl bg-ink px-4 py-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40">Terminé mi dibujo</button><p className="mt-3 text-xs leading-5 text-ink/60">Colorea al menos 3 partes para recibir la recompensa.</p></aside></div>;
}
