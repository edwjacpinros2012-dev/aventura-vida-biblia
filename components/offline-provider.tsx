"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getOfflineContent, saveOfflineContent } from "@/lib/offline/client-storage";
import type { OfflineContentSnapshot } from "@/lib/offline/contracts";
import { flushPendingProgress } from "@/lib/offline/sync-client";

type OfflineState = "loading" | "online" | "offline" | "syncing" | "error";
type OfflineContextValue = { state: OfflineState; snapshot: OfflineContentSnapshot | null; refresh: () => Promise<void> };
const OfflineContext = createContext<OfflineContextValue | null>(null);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OfflineState>("loading");
  const [snapshot, setSnapshot] = useState<OfflineContentSnapshot | null>(null);

  const refresh = useCallback(async () => {
    if (typeof navigator !== "undefined" && !navigator.onLine) { setState("offline"); return; }
    setState("syncing");
    try {
      const response = await fetch("/api/content/offline", { cache: "no-store" });
      if (!response.ok) throw new Error("No se pudo actualizar el contenido.");
      const next = await response.json() as OfflineContentSnapshot;
      await saveOfflineContent(next);
      setSnapshot(next);
      await flushPendingProgress();
      setState("online");
    } catch {
      const cached = await getOfflineContent().catch(() => undefined);
      if (cached) setSnapshot(cached);
      setState(cached ? "offline" : "error");
    }
  }, []);

  useEffect(() => {
    void getOfflineContent().then((cached) => { if (cached) setSnapshot(cached); }).catch(() => undefined).finally(() => void refresh());
    const online = () => void refresh();
    const offline = () => setState("offline");
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    return () => { window.removeEventListener("online", online); window.removeEventListener("offline", offline); };
  }, [refresh]);

  const value = useMemo(() => ({ state, snapshot, refresh }), [refresh, snapshot, state]);
  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) throw new Error("useOffline debe usarse dentro de OfflineProvider.");
  return context;
}
