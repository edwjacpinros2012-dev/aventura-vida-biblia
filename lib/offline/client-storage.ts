"use client";

import type { OfflineContentSnapshot, PendingGameProgressOperation } from "@/lib/offline/contracts";

const DATABASE = "aventura-vida-offline";
const VERSION = 1;
const CONTENT_STORE = "content";
const OPERATIONS_STORE = "operations";
const CONTENT_KEY = "current";

function database() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") { reject(new Error("IndexedDB no está disponible.")); return; }
    const request = indexedDB.open(DATABASE, VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(CONTENT_STORE)) db.createObjectStore(CONTENT_STORE);
      if (!db.objectStoreNames.contains(OPERATIONS_STORE)) db.createObjectStore(OPERATIONS_STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("No se pudo abrir el almacenamiento offline."));
  });
}

function transact<T>(storeName: string, mode: IDBTransactionMode, callback: (store: IDBObjectStore) => IDBRequest<T>) {
  return database().then((db) => new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const request = callback(transaction.objectStore(storeName));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("No se pudo leer el almacenamiento offline."));
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => { db.close(); reject(transaction.error ?? new Error("No se pudo guardar el almacenamiento offline.")); };
  }));
}

export function saveOfflineContent(snapshot: OfflineContentSnapshot) {
  return transact(CONTENT_STORE, "readwrite", (store) => store.put(snapshot, CONTENT_KEY));
}

export function getOfflineContent() {
  return transact<OfflineContentSnapshot | undefined>(CONTENT_STORE, "readonly", (store) => store.get(CONTENT_KEY));
}

export function enqueueProgressOperation(operation: PendingGameProgressOperation) {
  return transact(OPERATIONS_STORE, "readwrite", (store) => store.put(operation));
}

export function listProgressOperations() {
  return transact<PendingGameProgressOperation[]>(OPERATIONS_STORE, "readonly", (store) => store.getAll());
}

export function removeProgressOperations(ids: string[]) {
  if (!ids.length) return Promise.resolve();
  return database().then((db) => new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(OPERATIONS_STORE, "readwrite");
    const store = transaction.objectStore(OPERATIONS_STORE);
    ids.forEach((id) => store.delete(id));
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => { db.close(); reject(transaction.error ?? new Error("No se pudo limpiar la cola.")); };
  }));
}
