"use client";

import Link from "next/link";
import { MultiplayerLobby } from "@/components/multiplayer/multiplayer-lobby";
import { useMultiplayerRoom } from "@/components/multiplayer/use-multiplayer-room";

export function MultiplayerHub() {
  const multiplayer = useMultiplayerRoom("bible-maze");
  return <section className="av-page"><div className="mx-auto max-w-5xl px-4 pb-12 pt-8 sm:px-6 lg:px-8"><section className="av-panel relative overflow-hidden rounded-[2rem] p-6 shadow-lift sm:p-9"><div className="absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-teal-300/10 blur-3xl" /><div className="relative grid gap-7 lg:grid-cols-[1fr_360px] lg:items-start"><div><p className="av-kicker text-xs font-black uppercase tracking-[.2em]">Sala cooperativa</p><h1 className="av-title mt-3 font-display text-4xl font-black sm:text-5xl">Explora el laberinto en equipo</h1><p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-white/70">Crea una sala de 1 a 4 exploradores o únete con un código. Las salas sincronizan el recorrido del Laberinto Bíblico y usan solo apodos, avatares y frases positivas.</p><div className="mt-6 rounded-2xl border border-teal-100/15 bg-[#061923]/55 p-4 text-sm font-bold leading-6 text-white/70"><p>• Comparte el código solo con familia, escuela o grupo autorizado.</p><p>• El chat limita mensajes, filtra datos personales y no permite mensajes privados.</p><p>• El servidor valida los movimientos relevantes del laberinto.</p></div><Link href="/juegos/laberinto-biblico/jugar" className="mt-6 inline-flex rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-extrabold text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-100/25">Abrir mapa del Laberinto →</Link></div><MultiplayerLobby multiplayer={multiplayer} /></div></section></div></section>;
}
