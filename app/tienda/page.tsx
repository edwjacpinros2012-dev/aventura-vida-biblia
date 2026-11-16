"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePlayerProgress } from "@/components/player-progress-provider";

type ShopItem = {
  slug: string; name: string; description: string; type: string; rarity: string;
  coinPrice: number; minLevel: number; owned: boolean; unlocked: boolean; equipmentSlot?: string | null;
};
type InventoryEntry = { id: string; item: { slug: string; name: string; description: string; type: string; rarity: string; equipmentSlot?: string | null }; acquiredAt: string };
type ShopData = { authenticated: boolean; level: number; adventureCoins: number; items: ShopItem[]; inventory: InventoryEntry[] };

const typeLabels: Record<string, string> = { AVATAR: "Avatar", CHARACTER_STYLE: "Estilo", EFFECT: "Efecto", SCENERY: "Escenario", COSMETIC: "Cosmético", SPECIAL_CONTENT: "Contenido especial" };
const rarityLabels: Record<string, string> = { COMMON: "Común", UNCOMMON: "Poco común", RARE: "Raro", EPIC: "Épico" };
const icons: Record<string, string> = { AVATAR: "🧑‍🚀", CHARACTER_STYLE: "🧥", EFFECT: "✨", SCENERY: "🌌", COSMETIC: "🎨", SPECIAL_CONTENT: "🗺️" };

export default function StorePage() {
  const { identity, identityReady } = usePlayerProgress();
  const [data, setData] = useState<ShopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [equippedItems, setEquippedItems] = useState<Array<{ slug: string; name: string; slot: string }>>([]);
  const [equipping, setEquipping] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const [storeResponse, equipmentResponse] = await Promise.all([
      fetch("/api/economy/store", { cache: "no-store" }),
      fetch("/api/economy/equip", { cache: "no-store" }),
    ]);
    if (!storeResponse.ok) throw new Error("No pudimos cargar la tienda.");
    setData(await storeResponse.json() as ShopData);
    if (equipmentResponse.ok) {
      const equipment = await equipmentResponse.json() as { equipped?: Array<{ slug: string; name: string; slot: string }> };
      setEquippedItems(equipment.equipped ?? []);
    }
  }, []);

  useEffect(() => {
    if (!identityReady) return;
    let active = true;
    void refresh().catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : "Ocurrió un error.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [identityReady, refresh]);

  async function buy(item: ShopItem) {
    if (!identity.authenticated || buying) return;
    setBuying(item.slug); setNotice(""); setError("");
    try {
      const response = await fetch("/api/economy/store", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: item.slug, idempotencyKey: crypto.randomUUID() }),
      });
      const result = await response.json() as { error?: string; alreadyOwned?: boolean; item?: { name: string } };
      if (!response.ok) throw new Error(result.error ?? "No se pudo completar el canje.");
      setNotice(result.alreadyOwned ? "Ese objeto ya estaba en tu colección." : `¡${result.item?.name ?? "Objeto"} añadido a tu inventario!`);
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo completar el canje.");
    } finally { setBuying(null); }
  }

  return (
    <main className="av-page min-h-screen overflow-hidden pb-24">
      <section className="border-b border-sun/20 bg-[radial-gradient(ellipse_at_50%_0%,rgba(115,91,220,.24),transparent_48%),linear-gradient(145deg,#173e52,#082b39_58%,#061923)] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="inline-flex rounded-full border border-violet-200/25 bg-violet-300/10 px-3 py-1 text-xs font-black uppercase tracking-[.16em] text-violet-200">🛍️ Comercio de aventura</p>
          <h1 className="av-title mt-5 font-display text-4xl font-black sm:text-6xl">La tienda de los exploradores</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">Canjea las monedas que ganas jugando por objetos de colección. Las compras se validan en tu cuenta y quedan guardadas en tu inventario.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/10 bg-[#061923]/70 px-5 py-4"><p className="text-xs font-bold text-white/55">Monedas de aventura</p><p className="mt-1 text-3xl font-black text-amber-200">{data?.authenticated ? data.adventureCoins.toLocaleString("es-EC") : "—"} 🪙</p></div>
            <div className="rounded-2xl border border-white/10 bg-[#061923]/70 px-5 py-4"><p className="text-xs font-bold text-white/55">Objetos en inventario</p><p className="mt-1 text-3xl font-black text-cyan-200">{data?.authenticated ? data.inventory.length : "—"} 🎒</p></div>
            <div className="rounded-2xl border border-white/10 bg-[#061923]/70 px-5 py-4"><p className="text-xs font-bold text-white/55">Nivel de explorador</p><p className="mt-1 text-3xl font-black text-emerald-200">{data?.authenticated ? data.level : "—"}</p></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-9 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.16em] text-cyan-200">Catálogo</p><h2 className="mt-1 font-display text-3xl font-black text-[#f5e5b9]">Objetos para descubrir</h2></div><Link href="/recompensas" className="text-sm font-bold text-amber-200 hover:text-amber-100">Ver recompensas →</Link></div>
        {notice && <p role="status" className="mb-4 rounded-xl border border-emerald-300/25 bg-emerald-300/10 p-4 text-sm font-bold text-emerald-100">{notice}</p>}
        {error && <p role="alert" className="mb-4 rounded-xl border border-rose-300/25 bg-rose-300/10 p-4 text-sm font-bold text-rose-100">{error}</p>}
        {loading && <p className="py-10 text-center text-white/60">Preparando la tienda…</p>}
        {!loading && data?.items.length === 0 && <p className="rounded-2xl border border-white/10 p-8 text-center text-white/60">Pronto habrá nuevos objetos en el catálogo.</p>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.items.map((item) => (
            <article key={item.slug} className={`rounded-3xl border p-5 ${item.owned ? "border-emerald-200/30 bg-emerald-300/[.06]" : "border-white/10 bg-[#092633]/80"}`}>
              <div className="flex items-start justify-between gap-3"><span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/[.07] text-4xl">{icons[item.type] ?? "🎁"}</span><span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase text-white/65">{rarityLabels[item.rarity] ?? item.rarity}</span></div>
              <p className="mt-4 text-[10px] font-black uppercase tracking-[.15em] text-cyan-200">{typeLabels[item.type] ?? item.type}</p>
              <h3 className="mt-1 font-display text-xl font-black text-[#f5e5b9]">{item.name}</h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-white/60">{item.description}</p>
              <p className="mt-4 text-xs font-bold text-white/45">{item.minLevel > 1 ? `Requiere nivel ${item.minLevel}` : "Disponible desde el nivel 1"}</p>
              <div className="mt-4 flex items-center justify-between gap-3"><span className="font-display text-xl font-black text-amber-200">{item.coinPrice} 🪙</span>
                {item.owned ? (item.equipmentSlot ? (equippedItems.some((entry) => entry.slug === item.slug)
                    ? <button type="button" disabled={equipping !== null} onClick={() => void unequip(item.equipmentSlot!)} className="rounded-xl bg-emerald-300/15 px-3 py-2 text-xs font-black text-emerald-200 disabled:opacity-50">✓ Equipado · retirar</button>
                    : <button type="button" disabled={equipping !== null} onClick={() => void equip(item.slug)} className="rounded-xl bg-cyan-300 px-4 py-2.5 text-xs font-black text-[#092633] disabled:opacity-50">{equipping === item.slug ? "Equipando…" : "Equipar"}</button>)
                    : <span className="rounded-xl bg-emerald-300/15 px-3 py-2 text-xs font-black text-emerald-200">✓ En tu colección</span>)
                  : !identity.authenticated ? <span className="text-right text-xs font-bold text-white/45">Inicia sesión para canjear</span>
                  : !item.unlocked ? <span className="text-right text-xs font-bold text-white/45">🔒 Nivel {item.minLevel}</span>
                  : <button type="button" disabled={buying !== null || (data?.adventureCoins ?? 0) < item.coinPrice} onClick={() => void buy(item)} className="rounded-xl bg-amber-300 px-4 py-2.5 text-xs font-black text-[#14252a] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40">{buying === item.slug ? "Canjeando…" : (data?.adventureCoins ?? 0) < item.coinPrice ? "Faltan monedas" : "Canjear"}</button>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mb-5"><p className="text-xs font-black uppercase tracking-[.16em] text-amber-200">Inventario</p><h2 className="mt-1 font-display text-3xl font-black text-[#f5e5b9]">Tu colección guardada</h2><p className="mt-2 max-w-2xl text-sm text-white/55">Los objetos equipables se activan desde su tarjeta del catálogo. El yelmo, la túnica y la capa se reflejan en tu personaje oficial del Mundo 3D; los demás siguen como piezas de colección.</p></div>
        {!identity.authenticated ? <p className="rounded-2xl border border-white/10 p-6 text-sm text-white/55">Inicia sesión para guardar y consultar tu inventario.</p>
          : !data?.inventory.length ? <p className="rounded-2xl border border-white/10 p-6 text-sm text-white/55">Tu mochila está vacía. Completa juegos y retos para ganar monedas.</p>
          : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{data.inventory.map((entry) => <article key={entry.id} className="av-panel-soft flex items-center gap-4 rounded-2xl p-4"><span className="text-3xl">{icons[entry.item.type] ?? "🎁"}</span><div className="min-w-0"><h3 className="truncate font-bold text-[#f5e5b9]">{entry.item.name}</h3><p className="text-xs text-white/50">{typeLabels[entry.item.type] ?? entry.item.type} · {rarityLabels[entry.item.rarity] ?? entry.item.rarity}</p></div></article>)}</div>}
      </section>
      <div className="mx-auto flex max-w-6xl flex-wrap gap-3 px-4 sm:px-6 lg:px-8"><Link href="/juegos" className="av-gold-button rounded-xl px-5 py-3 text-sm font-black">Jugar y ganar monedas</Link><Link href="/perfil" className="av-teal-button rounded-xl px-5 py-3 text-sm font-black">Volver al perfil</Link></div>
    </main>
  );
}
