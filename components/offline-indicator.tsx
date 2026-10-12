"use client";

import { useOffline } from "@/components/offline-provider";

export function OfflineIndicator() {
  const { state } = useOffline();
  if (state === "loading" || state === "online") return null;
  const message = state === "syncing" ? "Sincronizando" : state === "offline" ? "Sin conexión" : "Contenido local";
  const color = state === "syncing" ? "text-[#f5e5b9]" : "text-[#c8f5da]";
  return <span aria-live="polite" className={`fixed right-3 top-[82px] z-[60] rounded-full border border-teal-100/20 bg-[#061923]/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide shadow-card backdrop-blur ${color}`}>{message}</span>;
}
