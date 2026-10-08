"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { CharacterAvatar } from "@/components/character-avatar";
import { usePlayerProgress } from "@/components/player-progress-provider";
import { avatarFallbackFor } from "@/lib/characters/catalog";
import { xpProgressFor } from "@/types/player-progress";

const navItems = [
  { href: "/", label: "Inicio", icon: "⌂" },
  { href: "/juegos", label: "Juegos", icon: "🎮" },
  { href: "/aventuras", label: "Aventura", icon: "🗺" },
  { href: "/juegos/preguntas-de-aventura/jugar", label: "PvP", icon: "⚔" },
  { href: "/ranking", label: "Ranking", icon: "♜" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { identity, progress, hydrated } = usePlayerProgress();
  const xp = xpProgressFor(progress.level, progress.xp);
  const active = (href: string) => href === "/" ? pathname === href : pathname.startsWith(href);
  return <header className="sticky top-0 z-50 border-b border-sun/20 bg-[#061923]/95 text-white shadow-[0_8px_28px_rgba(0,0,0,.28)] backdrop-blur-xl"><div className="mx-auto flex h-[74px] max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"><Logo /><nav className="hidden items-center gap-1 xl:flex" aria-label="Navegación principal">{navItems.map((item) => <Link key={item.href} href={item.href} className={`rounded-xl px-3 py-2 text-sm font-bold transition-colors outline-none focus-visible:ring-4 focus-visible:ring-sun/25 ${active(item.href) ? "bg-teal-400/15 text-[#f5cf74] ring-1 ring-teal-300/35" : "text-white/70 hover:bg-white/10 hover:text-white"}`}><span className="mr-1.5 text-base" aria-hidden="true">{item.icon}</span>{item.label}</Link>)}</nav><div className="hidden items-center gap-3 lg:flex"><div className="hidden min-w-44 rounded-xl border border-teal-300/20 bg-black/20 px-3 py-2 xl:block"><div className="flex justify-between text-[10px] font-black uppercase tracking-wide text-white/55"><span>Nivel {hydrated ? progress.level : "…"}</span><span>XP</span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full av-progress"><span style={{ width: `${Math.min(100, (xp.current / xp.needed) * 100)}%` }} /></div></div><Link href="/perfil" className="group flex items-center gap-2 rounded-xl border border-sun/25 bg-white/5 py-1.5 pl-1.5 pr-3 outline-none transition hover:bg-white/10 focus-visible:ring-4 focus-visible:ring-sun/25" aria-label={`Ver perfil de ${identity.nickname}`}><CharacterAvatar avatarKey={identity.avatarKey} fallback={avatarFallbackFor(identity.avatarKey)} alt={`Avatar de ${identity.nickname}`} imageSizes="36px" className="grid h-9 w-9 place-items-center rounded-lg bg-sun text-lg" /><span className="max-w-24 truncate text-xs font-extrabold text-[#f5e5b9]">{identity.nickname}</span></Link><Link href="/juegos" className="av-gold-button rounded-xl px-4 py-2 text-sm font-extrabold outline-none focus-visible:ring-4 focus-visible:ring-sun/30">Jugar</Link></div><button type="button" aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open} onClick={() => setOpen(!open)} className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 text-[#f5e5b9] outline-none hover:bg-white/10 focus-visible:ring-4 focus-visible:ring-sun/25 xl:hidden">{open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}</button></div>{open && <nav className="border-t border-white/10 bg-[#082331] px-4 pb-4 pt-2 shadow-card xl:hidden" aria-label="Navegación móvil"><div className="mx-auto grid max-w-7xl gap-1">{navItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`rounded-xl px-4 py-3 font-bold ${active(item.href) ? "bg-teal-400/15 text-[#f5cf74]" : "text-white/75 hover:bg-white/10"}`}><span className="mr-2">{item.icon}</span>{item.label}</Link>)}<Link href="/perfil" onClick={() => setOpen(false)} className="mt-1 rounded-xl bg-[#d89b20] px-4 py-3 text-center font-extrabold text-ink">Ver perfil</Link></div></nav>}<nav className="fixed inset-x-0 bottom-0 z-50 grid h-[68px] grid-cols-5 border-t border-sun/20 bg-[#061923]/95 px-2 pb-[max(0px,env(safe-area-inset-bottom))] shadow-[0_-8px_22px_rgba(0,0,0,.3)] backdrop-blur-xl lg:hidden" aria-label="Navegación rápida">{navItems.slice(0, 4).map((item) => <Link key={item.href} href={item.href} className={`grid place-items-center gap-0.5 text-[10px] font-black ${active(item.href) ? "text-[#f5cf74]" : "text-white/60"}`}><span className="text-lg" aria-hidden="true">{item.icon}</span>{item.label}</Link>)}<Link href="/perfil" className={`grid place-items-center gap-0.5 text-[10px] font-black ${pathname.startsWith("/perfil") ? "text-[#f5cf74]" : "text-white/60"}`}><CharacterAvatar avatarKey={identity.avatarKey} fallback={avatarFallbackFor(identity.avatarKey)} alt="" imageSizes="24px" className="grid h-6 w-6 place-items-center rounded-md bg-sun text-[11px]" />Perfil</Link></nav></header>;
}
