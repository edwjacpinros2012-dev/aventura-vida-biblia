"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePlayerProgress } from "@/components/player-progress-provider";

type StoreItem = {
  slug: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  coinPrice: number;
  criteria?: { minLevel?: number } | null;
};

type InventoryItem = StoreItem & { acquiredAt: string; source: string };

const typeLabel: Record<string, string> = {
  AVATAR: "Avatar",
  CHARACTER_STYLE: "Estilo",
  EFFECT: "Efecto",
  SCENERY: "Escenario",
  COSMETIC: "Cosmético",
  SPECIAL_CONTENT: "Contenido especial",
};

const rarityStyle: Record<string, string> = {
  COMMON: "bg-white/10 text-white/65",
  UNCOMMON: "bg-[#74e2b0]/15 text-[#a6f0c9]",
  RARE: "bg-[#67e5e0]/15 text-[#9af2ed]",
  EPIC: "bg-violet/20 text-violet-200",
};

function requestId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

export function CollectionDashboard() {
  const { identity } = usePlayerProgress();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [coins, setCoins] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadAccountCollection = useCallback(async () => {
    if (!identity.authenticated) { setCoins(null); setInventory([]); return; }
    const [walletResponse, inventoryResponse] = await Promise.all([fetch("/api/economy/wallet"), fetch("/api/economy/inventory")]);
    if (walletResponse.ok) {
      const wallet = await walletResponse.json() as { adventureCoins: number };
      setCoins(wallet.adventureCoins);
    }
    if (inventoryResponse.ok) {
      const data = await inventoryResponse.json() as { items: InventoryItem[] };
      setInventory(data.items);
    }
  }, [identity.authenticated]);

  useEffect(() => {
    let active = true;
    void (async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/economy/store");
        if (!response.ok) throw new Error("La tienda no está disponible ahora.");
        const data = await response.json() as { items: StoreItem[] };
        if (!active) return;
        setItems(data.items);
        await loadAccountCollection();
      } catch (error) {
        if (active) setNotice(error instanceof Error ? error.message : "No pudimos cargar la colección.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [loadAccountCollection]);

  const purchase = async (slug: string) => {
    setBusySlug(slug);
    setNotice(null);
    try {
      const response = await fetch("/api/economy/purchase", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug, idempotencyKey: requestId() }) });
      const data = await response.json() as { error?: string; alreadyOwned?: boolean; item?: StoreItem };
      if (!response.ok) throw new Error(data.error ?? "No se pudo completar la compra.");
      setNotice(data.alreadyOwned ? "Ese objeto ya estaba en tu colección." : `${data.item?.name ?? "Objeto"} se añadió a tu colección.`);
      await loadAccountCollection();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo completar la compra.");
    } finally {
      setBusySlug(null);
    }
  };

  const owned = new Set(inventory.map((item) => item.slug));
  return <section className="av-page"><div className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8"><section className="av-panel relative overflow-hidden rounded-[2rem] p-6 shadow-lift sm:p-9"><div className="absolute -right-16 top-0 h-64 w-64 rounded-full bg-[#f5bd4d]/10 blur-3xl" /><div className="relative flex flex-wrap items-start justify-between gap-5"><div><p className="av-kicker text-xs font-black uppercase tracking-[.2em]">Colección de aventura</p><h1 className="av-title mt-3 font-display text-4xl font-black sm:text-5xl">Tienda e inventario</h1><p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-white/70">Las Monedas de Aventura se gestionan en el servidor. Compra objetos de colección con tu saldo real; el navegador no puede cambiar precios ni concederse objetos.</p></div><div className="rounded-2xl border border-[#f5bd4d]/30 bg-[#061923]/65 px-5 py-4"><p className="text-xs font-black uppercase tracking-[.15em] text-white/55">Monedas de Aventura</p><p className="mt-1 font-display text-3xl font-black text-[#f5cf74]">{identity.authenticated ? coins?.toLocaleString("es-ES") ?? "…" : "—"}</p></div></div>{!identity.authenticated && <div className="relative mt-6 rounded-2xl border border-teal-100/15 bg-[#061923]/55 p-4 text-sm font-bold leading-6 text-white/70">Crea o inicia sesión para guardar Monedas de Aventura, compras e inventario en tu cuenta. <Link href="/registro" className="font-extrabold text-[#f5cf74] hover:underline">Crear cuenta</Link></div>}</section>{notice && <p role="status" className="mt-6 rounded-xl border border-teal-100/15 bg-[#0b3542] p-4 text-sm font-bold text-[#f5e5b9]">{notice}</p>}<div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_.8fr]"><section><div><p className="text-xs font-black uppercase tracking-[.17em] text-[#67e5e0]">Tienda</p><h2 className="av-title mt-2 font-display text-3xl font-black">Desbloquea mientras juegas</h2></div>{loading ? <p className="mt-5 rounded-2xl bg-white/5 p-5 text-sm font-bold text-white/65">Cargando objetos disponibles…</p> : items.length === 0 ? <p className="mt-5 rounded-2xl bg-white/5 p-5 text-sm font-bold leading-6 text-white/65">Todavía no hay objetos publicados. La economía, cartera e inventario ya están conectados y el panel administrativo podrá añadir contenido sin cambiar los juegos.</p> : <div className="mt-5 grid gap-4 sm:grid-cols-2">{items.map((item) => { const isOwned = owned.has(item.slug); const disabled = !identity.authenticated || isOwned || busySlug === item.slug; return <article key={item.slug} className="av-card rounded-2xl p-5"><div className="flex items-start justify-between gap-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${rarityStyle[item.rarity] ?? rarityStyle.COMMON}`}>{item.rarity}</span><span className="text-xs font-black text-white/45">{typeLabel[item.type] ?? item.type}</span></div><h3 className="mt-4 font-display text-2xl font-black text-[#f5e5b9]">{item.name}</h3><p className="mt-2 min-h-12 text-sm font-semibold leading-5 text-white/60">{item.description}</p>{item.criteria?.minLevel && <p className="mt-3 text-xs font-bold text-[#67e5e0]">Nivel {item.criteria.minLevel} requerido</p>}<div className="mt-5 flex items-center justify-between gap-3"><strong className="font-display text-xl text-[#f5cf74]">◉ {item.coinPrice}</strong><button type="button" disabled={disabled} onClick={() => void purchase(item.slug)} className="av-gold-button rounded-xl px-4 py-2.5 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f5bd4d]/30">{isOwned ? "En colección" : busySlug === item.slug ? "Comprando…" : "Obtener"}</button></div></article>; })}</div>}</section><aside className="av-panel-soft rounded-[1.8rem] p-5 sm:p-6"><p className="text-xs font-black uppercase tracking-[.17em] text-[#f5bd4d]">Mi inventario</p><h2 className="mt-2 font-display text-3xl font-black text-[#f5e5b9]">Objetos ganados</h2>{!identity.authenticated ? <p className="mt-5 text-sm font-bold leading-6 text-white/65">Tu inventario seguro se activa con una cuenta. Los avatares oficiales siguen disponibles desde tu perfil.</p> : inventory.length === 0 ? <p className="mt-5 rounded-xl bg-[#061923]/55 p-4 text-sm font-bold leading-6 text-white/65">Aún no tienes objetos. Completa juegos y duelos para ganar recursos, luego vuelve aquí para desbloquearlos.</p> : <div className="mt-5 grid gap-2">{inventory.map((item) => <div key={item.slug} className="rounded-xl border border-white/10 bg-[#061923]/55 p-3"><p className="font-bold text-[#f5e5b9]">{item.name}</p><p className="mt-1 text-xs font-semibold text-white/50">{typeLabel[item.type] ?? item.type} · {item.source === "STORE" ? "Tienda" : item.source}</p></div>)}</div>}<Link href="/perfil/avatares" className="mt-6 inline-flex text-sm font-extrabold text-[#67e5e0] hover:underline">Cambiar mi avatar →</Link></aside></div></div></section>;
}
