"use client";

import { useEffect, useRef, useState } from "react";
import { VictoryPanel, useGameCompletion } from "@/components/games/game-shell";

const pairItems = [
  { id: "ark", icon: "🛶", label: "Arca" }, { id: "dove", icon: "🕊", label: "Paloma" }, { id: "star", icon: "⭐", label: "Estrella" }, { id: "crown", icon: "👑", label: "Corona" },
  { id: "fish", icon: "🐟", label: "Pez" }, { id: "seed", icon: "🌱", label: "Semilla" }, { id: "lamp", icon: "🏮", label: "Lámpara" }, { id: "heart", icon: "💛", label: "Amor" },
];
type Card = { id: string; pair: string; icon: string; label: string };

function makeDeck(pairCount: number): Card[] {
  const cards = pairItems.slice(0, pairCount).flatMap((item) => [{ ...item, pair: item.id, id: `${item.id}-a` }, { ...item, pair: item.id, id: `${item.id}-b` }]);
  return [...cards].sort(() => Math.random() - 0.5);
}

export function MemoryGame() {
  const { result, finish, resetCompletion } = useGameCompletion("memory-bible");
  const [pairCount, setPairCount] = useState(6);
  const [deck, setDeck] = useState<Card[]>(() => makeDeck(6));
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const timerRef = useRef<number | null>(null);
  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current); }, []);
  const reset = (nextPairCount = pairCount) => { if (timerRef.current) window.clearTimeout(timerRef.current); setPairCount(nextPairCount); setDeck(makeDeck(nextPairCount)); setOpen([]); setMatched([]); setMoves(0); setLocked(false); resetCompletion(); };
  const reveal = (card: Card) => {
    if (locked || open.includes(card.id) || matched.includes(card.pair)) return;
    if (open.length === 0) { setOpen([card.id]); return; }
    const first = deck.find((item) => item.id === open[0]);
    if (!first) return;
    const nextOpen = [open[0], card.id]; setOpen(nextOpen); setMoves((value) => value + 1); setLocked(true);
    const isMatch = first.pair === card.pair;
    timerRef.current = window.setTimeout(() => {
      if (isMatch) {
        const nextMatched = [...matched, card.pair]; setMatched(nextMatched); setOpen([]);
        if (nextMatched.length === pairCount) { const points = Math.max(120, pairCount * 65 - (moves + 1) * 4); finish({ points, xp: pairCount === 6 ? 100 : 140 }); }
      } else setOpen([]);
      setLocked(false);
    }, 700);
  };
  const points = Math.max(120, pairCount * 65 - moves * 4);
  if (result) return <VictoryPanel title="¡Todas las parejas brillan!" description={`Encontraste ${pairCount} parejas en ${moves} movimientos. Tu memoria iluminó el sendero.`} result={result} points={points} xp={pairCount === 6 ? 100 : 140} onPlayAgain={() => reset()} />;
  return <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]"><div className="rounded-[1.7rem] bg-white p-4 shadow-card sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.16em] text-violet">Encuentra las parejas</p><p className="mt-1 text-sm font-bold text-ink/65">Toca dos cartas para descubrir si combinan.</p></div><span className="rounded-xl bg-sky px-3 py-2 text-sm font-black text-ink">{matched.length}/{pairCount} parejas</span></div><div className={`mx-auto mt-6 grid max-w-3xl gap-2 sm:gap-3 ${pairCount === 6 ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-4"}`}>{deck.map((card) => { const visible = open.includes(card.id) || matched.includes(card.pair); return <button key={card.id} type="button" onClick={() => reveal(card)} aria-label={visible ? card.label : "Carta cerrada"} className={`aspect-[.82] rounded-2xl border-2 text-center outline-none transition-transform focus-visible:ring-4 focus-visible:ring-violet/25 ${visible ? "border-violet bg-[#f1eeff]" : "border-ink/5 bg-ink hover:-translate-y-0.5"}`}><span className={`block text-3xl transition-opacity sm:text-4xl ${visible ? "opacity-100" : "opacity-0"}`}>{card.icon}</span><span className={`mt-2 block text-[10px] font-black uppercase tracking-wide ${visible ? "text-ink/65" : "text-white/80"}`}>{visible ? card.label : "✦"}</span></button>; })}</div></div><aside className="rounded-[1.7rem] bg-[#fff5cf] p-5 shadow-card"><p className="text-xs font-black uppercase tracking-[.16em] text-[#a66d00]">Tablero</p><div className="mt-4 grid gap-2">{([6, 8] as const).map((amount) => <button key={amount} type="button" onClick={() => reset(amount)} className={`rounded-xl px-4 py-3 text-left text-sm font-extrabold ${pairCount === amount ? "bg-ink text-white" : "bg-white text-ink hover:bg-sky"}`}>{amount} parejas <span className="float-right text-xs opacity-70">{amount === 6 ? "Inicial" : "Explorador"}</span></button>)}</div><div className="mt-5 rounded-xl bg-white p-4"><p className="text-xs font-black uppercase tracking-wide text-ink/50">Movimientos</p><p className="mt-1 font-display text-3xl font-black text-violet">{moves}</p></div><p className="mt-4 text-xs leading-5 text-ink/60">Menos movimientos significan más puntos.</p></aside></div>;
}
