"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/icons";
import { Logo } from "@/components/logo";

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/juegos", label: "Juegos" },
  { href: "/aventuras", label: "Aventuras" },
  { href: "/mision", label: "Misión diaria" },
  { href: "/ranking", label: "Ranking" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/5 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegación principal">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`rounded-xl px-3 py-2 text-sm font-bold transition-colors outline-none focus-visible:ring-4 focus-visible:ring-violet/25 ${pathname === item.href ? "bg-violet/10 text-violet" : "text-ink/65 hover:bg-sky hover:text-ink"}`}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/perfil" className="grid h-10 w-10 place-items-center rounded-full bg-sun text-lg outline-none transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-violet/25" aria-label="Ver perfil">🦊</Link>
          <Link href="/juegos" className="rounded-xl bg-ink px-4 py-2.5 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5 hover:bg-violet focus-visible:ring-4 focus-visible:ring-violet/25">Jugar ahora</Link>
        </div>
        <button type="button" aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open} onClick={() => setOpen(!open)} className="grid h-11 w-11 place-items-center rounded-xl text-ink outline-none hover:bg-sky focus-visible:ring-4 focus-visible:ring-violet/25 lg:hidden">
          {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-ink/5 bg-white px-4 pb-4 pt-2 shadow-card lg:hidden" aria-label="Navegación móvil">
          <div className="mx-auto grid max-w-7xl gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`rounded-xl px-4 py-3 font-bold ${pathname === item.href ? "bg-violet/10 text-violet" : "text-ink hover:bg-sky"}`}>
                {item.label}
              </Link>
            ))}
            <Link href="/perfil" onClick={() => setOpen(false)} className="mt-1 rounded-xl bg-ink px-4 py-3 text-center font-extrabold text-white">Ver perfil</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
