"use client";

import { useSyncExternalStore } from "react";

export type ChildProfile = {
  id: number;
  name: string;
  role: string;
  color: string;
  speed: number;
  jump: number;
};

type GameState = {
  currentChapter: number;
  maxUnlockedChapter: number;
  activeChildIndex: number;
  childrenData: ChildProfile[];
  faith: number;
  isPraying: boolean;
  guidanceMessage: string;
  inventory: string[];
  missionProgress: number;
  hydrated: boolean;
  switchChild: (index: number) => void;
  triggerPrayer: (hint?: string) => void;
  restoreFaith: (amount: number) => void;
  addItem: (item: string) => void;
  setMissionProgress: (progress: number) => void;
  setChapter: (chapter: number) => void;
  hydrate: () => void;
};

const STORAGE_KEY = "av-tres-ninos-game-state";
const childrenData: ChildProfile[] = [
  { id: 0, name: "Mateo", role: "Sabiduría y oración", color: "#3b82f6", speed: 5, jump: 7 },
  { id: 1, name: "Sofía", role: "Agilidad y exploración", color: "#ec4899", speed: 7, jump: 9 },
  { id: 2, name: "Lucas", role: "Fuerza y protección", color: "#10b981", speed: 4, jump: 6 },
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
    if (state.isPraying || state.faith < 20) return;
    if (prayerTimer) clearTimeout(prayerTimer);
    update({
      faith: state.faith - 20,
      isPraying: true,
      guidanceMessage: hint || "Haz una pausa: observa las señales luminosas para encontrar un camino seguro.",
    });
    prayerTimer = setTimeout(() => update({ isPraying: false, guidanceMessage: "" }), 4000);
  },
  restoreFaith: (amount) => update({ faith: Math.min(100, state.faith + Math.max(0, amount)) }),
  addItem: (item) => {
    if (!state.inventory.includes(item)) update({ inventory: [...state.inventory, item] });
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
          inventory: Array.isArray(parsed.inventory) ? parsed.inventory.filter((item): item is string => typeof item === "string").slice(0, 50) : [],
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
