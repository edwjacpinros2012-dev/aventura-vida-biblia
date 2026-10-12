"use client";

import { useState } from "react";
import { publicShareText, publicSiteName, publicSiteUrl } from "@/lib/site-config";

type PlatformShareButtonProps = { className?: string; compact?: boolean };

/**
 * Comparte la plataforma pública, no una partida ni el perfil de un menor.
 * Web Share abre las aplicaciones disponibles; WhatsApp queda como opción
 * explícita para navegadores sin esa API o familias que la prefieran.
 */
export function PlatformShareButton({ className = "", compact = false }: PlatformShareButtonProps) {
  const [message, setMessage] = useState<string | null>(null);
  const text = `${publicShareText} ${publicSiteUrl}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;

  const share = async () => {
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({ title: publicSiteName, text: publicShareText, url: publicSiteUrl });
        setMessage("Invitación lista para compartir.");
        return;
      }
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      setMessage("Abrimos WhatsApp para compartir la plataforma.");
    } catch (error) {
      // Cerrar la hoja de compartir no es un error del juego ni del progreso.
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMessage("No se pudo abrir el menú para compartir. Inténtalo de nuevo.");
    }
  };

  return <div className={`inline-flex flex-wrap items-center justify-center gap-2 ${className}`}>
    <button type="button" onClick={() => void share()} className="av-teal-button rounded-xl px-4 py-3 text-sm font-extrabold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-100/30">
      {compact ? "Compartir" : "Compartir Aventura Vida Biblia"}
    </button>
    <a href={whatsappUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-[#74e2b0]/45 bg-[#74e2b0]/10 px-4 py-3 text-sm font-extrabold text-[#c8f5da] transition hover:bg-[#74e2b0]/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#74e2b0]/25">
      WhatsApp
    </a>
    {message ? <p className="basis-full text-center text-xs font-bold text-white/65" role="status">{message}</p> : null}
  </div>;
}
