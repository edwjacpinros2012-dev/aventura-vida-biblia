"use client";

import { useEffect } from "react";

/** Registra el caché mínimo de PWA solo fuera del entorno de desarrollo. */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => undefined);
  }, []);
  return null;
}
