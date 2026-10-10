"use client";

import { useEffect, useMemo, useState } from "react";
import { CharacterAvatar } from "@/components/character-avatar";
import type { GlobalPlayerIdentity } from "@/components/player-progress-provider";
import {
  customAvatarConfigFromKey,
  customAvatarKeyFor,
  customAvatarOptions,
  defaultCustomAvatar,
  type CustomAvatarConfig,
} from "@/lib/characters/custom-avatar";

const optionGroups = [
  { key: "skinTone", label: "Tono de piel", options: customAvatarOptions.skinTone },
  { key: "hairStyle", label: "Cabello", options: customAvatarOptions.hairStyle },
  { key: "hairColor", label: "Color de cabello", options: customAvatarOptions.hairColor },
  { key: "eyeColor", label: "Ojos", options: customAvatarOptions.eyeColor },
  { key: "outfit", label: "Ropa", options: customAvatarOptions.outfit },
  { key: "outfitColor", label: "Color de ropa", options: customAvatarOptions.outfitColor },
  { key: "accessory", label: "Accesorio", options: customAvatarOptions.accessory },
] as const;

type AvatarCreatorProps = {
  identity: GlobalPlayerIdentity;
  identityReady: boolean;
  saving: boolean;
  onSave: (avatarKey: string) => void;
};

export function AvatarCreator({ identity, identityReady, saving, onSave }: AvatarCreatorProps) {
  const [draft, setDraft] = useState<CustomAvatarConfig>(() => customAvatarConfigFromKey(identity.avatarKey) ?? defaultCustomAvatar);
  const avatarKey = useMemo(() => customAvatarKeyFor(draft), [draft]);
  const selected = identity.avatarKey === avatarKey;

  useEffect(() => {
    const saved = customAvatarConfigFromKey(identity.avatarKey);
    if (saved) setDraft(saved);
  }, [identity.avatarKey]);

  const setOption = (key: keyof CustomAvatarConfig, value: string) => {
    setDraft((current) => ({ ...current, [key]: value } as CustomAvatarConfig));
  };

  return <section className="av-panel-soft mt-12 rounded-[2rem] p-5 shadow-card sm:p-8">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#67e5e0]">Mi avatar</p><h2 className="mt-2 font-display text-3xl font-black text-[#f5e5b9]">Crear mi avatar</h2><p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/65">Elige solo opciones visuales seguras. No subimos fotos, no pedimos nombres y no guardamos texto personal.</p></div><span className="rounded-full bg-[#061923]/70 px-4 py-2 font-mono text-[11px] font-bold text-white/55">{avatarKey}</span></div>
    <div className="mt-7 grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]"><div className="flex flex-col items-center justify-center rounded-[1.7rem] border border-teal-100/20 bg-[#061923]/70 p-5 shadow-card"><CharacterAvatar avatarKey={avatarKey} fallback="🧑" alt={`Vista previa del avatar de ${identity.nickname}`} imageSizes="180px" variant="full" className="grid h-44 w-36 place-items-center rounded-[1.5rem] bg-[#0d5d70] text-5xl" /><p className="mt-4 text-center text-sm font-black text-[#f5e5b9]">Vista previa</p><p className="mt-1 text-center text-xs font-semibold leading-5 text-white/55">Este avatar será tu personaje global.</p></div><div className="grid gap-5">{optionGroups.map((group) => <fieldset key={group.key}><legend className="text-sm font-extrabold text-[#f5e5b9]">{group.label}</legend><div className="mt-2 flex flex-wrap gap-2">{group.options.map((option) => { const active = draft[group.key] === option.id; return <button key={option.id} type="button" aria-pressed={active} onClick={() => setOption(group.key, option.id)} className={`inline-flex min-h-11 items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-bold outline-none transition focus-visible:ring-4 focus-visible:ring-teal-100/25 ${active ? "border-[#f5bd4d] bg-[#f5bd4d] text-[#061923]" : "border-white/15 bg-[#061923]/60 text-white/80 hover:border-teal-200/50"}`}>{"color" in option && option.color && <span aria-hidden="true" className="h-4 w-4 rounded-full border border-white/20" style={{ backgroundColor: option.color }} />}{option.label}</button>; })}</div></fieldset>)}</div></div>
    <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-teal-100/15 bg-[#061923]/65 p-4"><p className="max-w-xl text-sm font-semibold leading-6 text-white/65">Al guardar, este diseño se codifica de forma validada en tu <code className="rounded bg-white/10 px-1">avatarKey</code> actual. Perfil, juegos, aventuras, salas y PvP usan la misma selección.</p><button type="button" disabled={!identityReady || selected || saving} onClick={() => onSave(avatarKey)} className="av-gold-button rounded-xl px-5 py-3 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f5bd4d]/30">{selected ? "Este es tu avatar" : saving ? "Guardando…" : "Guardar cambios"}</button></div>
  </section>;
}
