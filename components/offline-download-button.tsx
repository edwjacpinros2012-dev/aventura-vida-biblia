"use client";

import { useState } from "react";

type PackResult = { type: "OFFLINE_PACK_RESULT"; ok: boolean; cached: number; total: number; failed: string[] };

export function OfflineDownloadButton() {
  const [state, setState] = useState<"idle" | "downloading" | "ready" | "partial" | "error">("idle");
  const [detail, setDetail] = useState("");

  async function prepareOffline() {
    if (!("serviceWorker" in navigator)) {
      setState("error");
      setDetail("Este navegador no permite instalar el modo sin conexión.");
      return;
    }
    if (!navigator.onLine) {
      setState("error");
      setDetail("Conéctate una vez para descargar el juego y poder abrirlo después sin Internet.");
      return;
    }
    setState("downloading");
    setDetail("Preparando el catálogo y las 16 rutas de juego con sus archivos de aplicación…");
    try {
      const registration = await navigator.serviceWorker.ready;
      const worker = navigator.serviceWorker.controller ?? registration.active;
      if (!worker) throw new Error("El modo instalable todavía se está preparando. Recarga la página e inténtalo de nuevo.");
      const channel = new MessageChannel();
      const result = await new Promise<PackResult>((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error("La descarga está tardando demasiado. Inténtalo otra vez.")), 30000);
        channel.port1.onmessage = (event: MessageEvent<PackResult>) => {
          window.clearTimeout(timeout);
          resolve(event.data);
        };
        worker.postMessage({ type: "CACHE_OFFLINE_PACK" }, [channel.port2]);
      });
      setState(result.ok ? "ready" : "partial");
      setDetail(result.ok
        ? `¡Listo! ${result.cached} secciones principales quedaron preparadas en este dispositivo.`
        : `Se prepararon ${result.cached} de ${result.total} secciones. Mantén Internet para completar las que falten.`);
    } catch (error) {
      setState("error");
      setDetail(error instanceof Error ? error.message : "No se pudo preparar el modo sin conexión.");
    }
  }

  return (
    <div className="w-full max-w-xl">
      <button type="button" onClick={prepareOffline} disabled={state === "downloading"}
        className="av-teal-button w-full rounded-xl px-5 py-3 text-sm font-extrabold disabled:cursor-wait disabled:opacity-60">
        {state === "downloading" ? "Preparando descarga…" : state === "ready" ? "Actualizar descarga sin conexión" : "Preparar juego sin Internet"}
      </button>
      {detail ? <p role="status" aria-live="polite" className="mt-3 text-xs font-semibold leading-5 text-white/75">{detail}</p> : null}
    </div>
  );
}
