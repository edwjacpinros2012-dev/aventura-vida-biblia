"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CharacterAvatar } from "@/components/character-avatar";
import { usePlayerProgress } from "@/components/player-progress-provider";
import { avatarFallbackFor, officialCharacters } from "@/lib/characters/catalog";

export function AvatarCatalog() {
  const { identity, identityReady, selectAvatar } = usePlayerProgress();
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const choose = async (avatarKey: string) => {
    setSaving(avatarKey);
    setError(null);
    try {
      await selectAvatar(avatarKey);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No pudimos guardar tu avatar.");
    } finally {
      setSaving(null);
    }
  };

  return <section className="mx-auto max-w-6xl px-4 pb-14 pt-10 sm:px-6 sm:pt-14">
    <Link href="/perfil" className="text-sm font-extrabold text-violet hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/25">← Volver al perfil</Link>
    <div className="mt-5 overflow-hidden rounded-[2rem] bg-ink p-6 text-white shadow-lift sm:p-9">
      <div className="flex flex-wrap items-center gap-5"><CharacterAvatar avatarKey={identity.avatarKey} fallback={avatarFallbackFor(identity.avatarKey)} alt={`Avatar actual de ${identity.nickname}`} imageSizes="84px" className="grid h-20 w-20 place-items-center rounded-[1.5rem] bg-sun text-4xl" /><div><p className="text-xs font-black uppercase tracking-[.2em] text-sun">Tu identidad global</p><h1 className="mt-2 font-display text-3xl font-black sm:text-4xl">Elige tu avatar</h1><p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">Tu elección se guarda una sola vez y se reutiliza en perfil, ranking, juegos, aventuras, salas, PvP y recompensas.</p></div></div>
    </div>
    <div className="mt-9 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-violet">Proyecto Vida Kids</p><h2 className="mt-2 font-display text-3xl font-black text-ink">Avatares oficiales</h2></div><p className="rounded-full bg-sky px-4 py-2 text-xs font-bold text-ink/65">6 variantes disponibles</p></div>
    {error && <p role="alert" className="mt-5 rounded-2xl bg-coral/10 p-4 text-sm font-bold text-coral">{error}</p>}
    <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {officialCharacters.map((character) => {
        const selected = identity.avatarKey === character.id;
        const isSaving = saving === character.id;
        return <article key={character.id} className={`overflow-hidden rounded-[1.7rem] border-2 bg-white shadow-card transition ${selected ? "border-violet ring-4 ring-violet/10" : "border-transparent hover:-translate-y-1"}`}>
          <div className="relative aspect-[4/5] overflow-hidden bg-sky"><Image src={character.asset} alt="Avatar oficial de Proyecto Vida Kids" fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw" className="object-contain" priority={character.id === officialCharacters[0]?.id} /></div>
          <div className="p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-display text-xl font-black text-ink">{character.name}</h3><p className="mt-1 text-xs font-semibold leading-5 text-ink/55">{character.description}</p></div>{selected && <span className="rounded-full bg-leaf px-3 py-1 text-xs font-black text-white">Seleccionado</span>}</div><p className="mt-4 rounded-lg bg-sky/60 px-3 py-2 font-mono text-[11px] font-bold text-ink/60">{character.id}</p><button type="button" disabled={!identityReady || selected || saving !== null} onClick={() => { void choose(character.id); }} className={`mt-4 w-full rounded-xl px-4 py-3 text-sm font-extrabold outline-none transition focus-visible:ring-4 focus-visible:ring-violet/25 disabled:cursor-not-allowed disabled:opacity-60 ${selected ? "bg-violet/10 text-violet" : "bg-ink text-white hover:bg-violet"}`}>{selected ? "Este es tu avatar" : isSaving ? "Guardando…" : "Elegir este avatar"}</button></div>
        </article>;
      })}
    </div>
  </section>;
}
