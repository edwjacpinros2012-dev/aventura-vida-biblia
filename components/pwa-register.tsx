"use client";

import { useEffect } from "react";

/** Registra el caché mínimo de PWA solo fuera del entorno de desarrollo. */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    let reloadedForUpdate = false;
    const hadController = Boolean(navigator.serviceWorker.controller);
    const reloadForUpdate = () => {
      if (!hadController || reloadedForUpdate) return;
      reloadedForUpdate = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", reloadForUpdate);
    void navigator.serviceWorker.register("/sw.js", { scope: "/" })
      .then((registration) => registration.update())
      .catch(() => undefined);
    return () => navigator.serviceWorker.removeEventListener("controllerchange", reloadForUpdate);
  }, []);
  return null;
}
