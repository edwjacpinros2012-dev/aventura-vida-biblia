"use client";

import { useSyncExternalStore } from "react";

export type ChildId = "mateo" | "sofia" | "lucas";

export interface ChildProfile {
  id: ChildId;
  name: string;
  role: string;
  speed: number;
  jumpForce: number;
  prayerBonus: number;
  accentColor: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  chapter: number;
}

export const CHILDREN_PROFILES: ChildProfile[] = [
  { id: "mateo", name: "Mateo", role: "Sabiduría y Oración", speed: 5.2, jumpForce: 7.2, prayerBonus: 1.35, accentColor: "#3b82f6" },
  { id: "sofia", name: "Sofía", role: "Agilidad y Exploración", speed: 7.1, jumpForce: 9.0, prayerBonus: 1.0, accentColor: "#ec4899" },
  { id: "lucas", name: "Lucas", role: "Fuerza y Escudo", speed: 4.4, jumpForce: 6.4, prayerBonus: 1.15, accentColor: "#10b981" },
];

export const CHAPTER_GUIDANCE: Record<number, string> = {
  1: "Busca las tres señales alrededor del portal para encender el paso al siguiente mundo.",
  2: "Observa los pasillos de la nave y reúne las tres señales antes de acercarte al portal.",
  3: "Avancen con calma y valentía: las tres señales abrirán el camino de salida.",
  4: "Revisa las zonas altas del campamento inundado para completar las tres señales.",
  5: "Camina con cuidado por el bosque y recoge las tres señales sin apresurarte.",
  6: "Explora cerca del árbol de los frutos mágicos para reunir las tres señales.",
  7: "Manténganse unidos ante la avalancha: al reunir las tres señales se completará la aventura.",
};

type GameState = {
  currentChapter: number;
  maxUnlockedChapter: number;
  activeChildIndex: number;
  childrenData: ChildProfile[];
  faith: number;
  isPraying: boolean;
  guidanceMessage: string;
  inventory: InventoryItem[];
  missionProgress: number;
  hydrated: boolean;
  switchChild: (index: number) => void;
  triggerPrayer: (hint?: string) => void;
  restoreFaith: (amount: number) => void;
  addItem: (item: string, chapter?: number) => void;
  setMissionProgress: (progress: number) => void;
  setChapter: (chapter: number) => void;
  hydrate: () => void;
};

const STORAGE_KEY = "av-tres-ninos-game-state";
const childrenData: ChildProfile[] = [
  ...CHILDREN_PROFILES,
];

let prayerTimer: ReturnType<typeof setTimeout> | undefined;
let state: GameState;
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      currentChapter: state.currentChapter,
      maxUnlockedChapter: state.maxUnlockedChapter,
      activeChildIndex: state.activeChildIndex,
      faith: state.faith,
      inventory: state.inventory,
      missionProgress: state.missionProgress,
    }));
  } catch {
    // El juego sigue funcionando aunque el almacenamiento esté deshabilitado.
  }
}

function update(patch: Partial<GameState>) {
  state = { ...state, ...patch };
  persist();
  listeners.forEach((listener) => listener());
}

state = {
  currentChapter: 1,
  maxUnlockedChapter: 1,
  activeChildIndex: 0,
  childrenData,
  faith: 100,
  isPraying: false,
  guidanceMessage: "",
  inventory: [],
  missionProgress: 0,
  hydrated: false,
  switchChild: (index) => {
    if (index >= 0 && index < childrenData.length) update({ activeChildIndex: index });
  },
  triggerPrayer: (hint) => {
    const prayerCost = Math.ceil(20 / (childrenData[state.activeChildIndex]?.prayerBonus ?? 1));
    if (state.isPraying || state.faith < prayerCost) return;
    if (prayerTimer) clearTimeout(prayerTimer);
    update({
      faith: state.faith - prayerCost,
      isPraying: true,
      guidanceMessage: hint || "Haz una pausa: observa las señales luminosas para encontrar un camino seguro.",
    });
    prayerTimer = setTimeout(() => update({ isPraying: false, guidanceMessage: "" }), 4000);
  },
  restoreFaith: (amount) => update({ faith: Math.min(100, state.faith + Math.max(0, amount)) }),
  addItem: (item, chapter = state.currentChapter) => {
    const id = `chapter-${chapter}-${item.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    if (!state.inventory.some((entry) => entry.id === id)) {
      update({ inventory: [...state.inventory, { id, name: item, chapter }] });
    }
  },
  setMissionProgress: (missionProgress) => update({ missionProgress }),
  setChapter: (chapter) => {
    const safeChapter = Math.max(1, Math.min(7, Math.floor(chapter)));
    update({
      currentChapter: safeChapter,
      maxUnlockedChapter: Math.max(state.maxUnlockedChapter, safeChapter),
      missionProgress: 0,
      faith: 100,
      isPraying: false,
      guidanceMessage: "",
    });
  },
  hydrate: () => {
    if (state.hydrated || typeof window === "undefined") return;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<Pick<GameState, "currentChapter" | "maxUnlockedChapter" | "activeChildIndex" | "faith" | "inventory" | "missionProgress">>;
        update({
          currentChapter: Math.max(1, Math.min(7, parsed.currentChapter ?? 1)),
          maxUnlockedChapter: Math.max(1, Math.min(7, parsed.maxUnlockedChapter ?? 1)),
          activeChildIndex: Math.max(0, Math.min(2, parsed.activeChildIndex ?? 0)),
          faith: Math.max(0, Math.min(100, parsed.faith ?? 100)),
          inventory: Array.isArray(parsed.inventory) ? parsed.inventory.flatMap((item, index) => {
            if (typeof item === "string") return [{ id: `legacy-${index}`, name: item, chapter: 1 }];
            if (item && typeof item === "object" && "id" in item && "name" in item && "chapter" in item && typeof item.id === "string" && typeof item.name === "string" && typeof item.chapter === "number") return [{ id: item.id, name: item.name, chapter: item.chapter }];
            return [];
          }).slice(0, 50) : [],
          missionProgress: Math.max(0, parsed.missionProgress ?? 0),
        });
      }
    } catch {
      // Se usan los valores iniciales si el guardado está dañado.
    }
    update({ hydrated: true });
  },
};

export function useGameStore<T>(selector: (snapshot: GameState) => T): T {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => selector(state),
    () => selector(state),
  );
}

export function getGameStoreState() {
  return state;
}
