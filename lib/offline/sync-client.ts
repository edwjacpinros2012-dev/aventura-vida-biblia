"use client";

import { enqueueProgressOperation, listProgressOperations, removeProgressOperations } from "@/lib/offline/client-storage";
import type { PendingGameProgressOperation } from "@/lib/offline/contracts";

function operationId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
      const random = Math.floor(Math.random() * 16);
      return (character === "x" ? random : (random & 0x3) | 0x8).toString(16);
    });
}

export async function queueGameProgress(gameSlug: string, data: Record<string, unknown>, accountId: string) {
  const operation: PendingGameProgressOperation = { id: operationId(), type: "GAME_PROGRESS", accountId, gameSlug, data, updatedAt: new Date().toISOString() };
  await enqueueProgressOperation(operation);
  return operation;
}

export async function flushPendingProgress() {
  if (typeof navigator !== "undefined" && !navigator.onLine) return { sent: 0, pending: true };
  const operations = await listProgressOperations();
  if (!operations.length) return { sent: 0, pending: false };
  const response = await fetch("/api/progress/sync", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ operations }),
  });
  // Si se cerró sesión, la cola queda intacta; no es una desconexión ni se
  // convierte en un falso estado offline para quien usa el modo invitado.
  if (response.status === 401) return { sent: 0, pending: true };
  if (!response.ok) throw new Error("La conexión aún no pudo sincronizar tu progreso.");
  const result = await response.json() as { appliedIds?: string[]; duplicateIds?: string[] };
  const completed = [...(result.appliedIds ?? []), ...(result.duplicateIds ?? [])];
  await removeProgressOperations(completed);
  return { sent: completed.length, pending: operations.length > completed.length };
}
