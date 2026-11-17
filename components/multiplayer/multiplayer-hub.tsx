"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { MultiplayerLobby } from "@/components/multiplayer/multiplayer-lobby";
import { useMultiplayerRoom } from "@/components/multiplayer/use-multiplayer-room";

type Health = { configured: boolean; status: "online" | "offline" | "unconfigured"; latencyMs?: number; message: string };

export function MultiplayerHub() {
  const multiplayer = useMultiplayerRoom("bible-maze");
  const [health, setHealth] = useState<Health | null>(null);
  const [checking, setChecking] = useState(false);

  const checkServer = useCallback(async () => {
    setChecking(true);
    try {
      const response = await fetch("/api/multiplayer/health", { cache: "no-store" });
      if (!response.ok) throw new Error("No se pudo consultar el estado.");
      setHealth(await response.json() as Health);
    } catch {
      setHealth({ configured: false, status: "offline", message: "No se pudo consultar el estado del servidor desde la web." });
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => { void checkServer(); }, [checkServer]);

  const statusLabel = health?.status === "online" ? "Servidor conectado" : health?.status === "offline" ? "Servidor sin respuesta" : health?.status === "unconfigured" ? "Servidor por configurar" : "Consultando servidor…";
  const statusTone = health?.status === "online" ? "border-emerald-200/25 bg-emerald-200/10 text-emerald-100" : health?.status === "offline" ? "border-rose-200/25 bg-rose-200/10 text-rose-100" : "border-amber-200/25 bg-amber-200/10 text-amber-100";

  return (
    <section className="av-page">
      <div className="mx-auto max-w-5xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <section className="av-panel relative overflow-hidden rounded-[2rem] p-6 shadow-lift sm:p-9">
          <div className="absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-teal-300/10 blur-3xl" />
          <div className="relative">
            <div className="mb-7 flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-white/10 bg-[#061923]/55 p-4">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[.16em] text-cyan-200">Estado del servicio</p>
                <p className="mt-2 text-sm font-bold text-white">{statusLabel}</p>
                <p className="mt-1 max-w-xl text-xs leading-5 text-white/55">{health?.message ?? "Estamos consultando la configuración de este entorno."}</p>
                {health?.latencyMs !== undefined && <p className="mt-2 text-[11px] font-bold text-white/45">Respuesta: {health.latencyMs} ms</p>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-1.5 text-xs font-black ${statusTone}`}>{health?.status === "online" ? "● ONLINE" : health?.status === "offline" ? "● OFFLINE" : health?.status === "unconfigured" ? "○ SIN CONFIGURAR" : "◌ REVISANDO"}</span>
                <button type="button" onClick={() => void checkServer()} disabled={checking} className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-black text-white hover:bg-white/10 disabled:opacity-50">{checking ? "Revisando…" : "Revisar"}</button>
              </div>
            </div>

            <div className="mb-7 grid gap-3 sm:grid-cols-2">
              <Link href="/multiplayer" className="rounded-2xl border border-teal-200/20 bg-teal-200/[.06] p-4 transition hover:bg-teal-200/[.10]">
                <p className="text-xs font-black uppercase tracking-[.14em] text-teal-100">Cooperativo · Servidor</p>
                <h2 className="mt-2 font-display text-xl font-black text-[#f5e5b9]">Laberinto Bíblico</h2>
                <p className="mt-1 text-xs leading-5 text-white/60">Salas de hasta cuatro exploradores con código y movimientos sincronizados.</p>
              </Link>
              <Link href="/pvp" className="rounded-2xl border border-violet-200/20 bg-violet-200/[.06] p-4 transition hover:bg-violet-200/[.10]">
                <p className="text-xs font-black uppercase tracking-[.14em] text-violet-100">Duelo · Servidor</p>
                <h2 className="mt-2 font-display text-xl font-black text-[#f5e5b9]">Duelo de preguntas bíblicas</h2>
                <p className="mt-1 text-xs leading-5 text-white/60">Partidas 1 contra 1 con preguntas y puntuación validada por servidor.</p>
              </Link>
            </div>

            <div className="grid gap-7 lg:grid-cols-[1fr_360px] lg:items-start">
              <div>
                <p className="av-kicker text-xs font-black uppercase tracking-[.2em]">Sala cooperativa</p>
                <h1 className="av-title mt-3 font-display text-4xl font-black sm:text-5xl">Explora el laberinto en equipo</h1>
                <p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-white/70">Crea una sala de 1 a 4 exploradores o únete con un código. Las salas sincronizan el recorrido y usan solo apodos, avatares y frases positivas.</p>
                <div className="mt-6 rounded-2xl border border-teal-100/15 bg-[#061923]/55 p-4 text-sm font-bold leading-6 text-white/70">
                  <p>• Comparte el código solo con familia, escuela o grupo autorizado.</p>
                  <p>• El chat limita mensajes, filtra datos personales y no permite mensajes privados.</p>
                  <p>• El servidor valida los movimientos relevantes del laberinto.</p>
                  <p>• Por ahora, los modos online disponibles son Laberinto Bíblico cooperativo y Duelo bíblico 1 vs 1; los demás juegos todavía necesitan adaptadores de servidor.</p>
                </div>
                <Link href="/juegos/laberinto-biblico/jugar" className="mt-6 inline-flex rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-extrabold text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-100/25">Abrir mapa del Laberinto →</Link>
              </div>
              <MultiplayerLobby multiplayer={multiplayer} />
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
