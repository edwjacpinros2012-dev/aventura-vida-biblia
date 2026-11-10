import type { Metadata } from "next";
import Link from "next/link";
import { CarreraDeLaFeGame } from "@/components/games/carrera-de-la-fe-game";

export const metadata: Metadata = { title: "Jugar La Carrera de la Fe | Aventura Vida Biblia" };

export default function PlayCarreraDeLaFePage() {
  return <main className="av-page"><section className="mx-auto max-w-5xl px-4 py-8 sm:px-6"><Link href="/juegos/la-carrera-de-la-fe" className="text-sm font-extrabold text-[#67e5e0] hover:underline">← Volver a la aventura</Link><div className="my-5"><p className="text-xs font-black uppercase tracking-[.2em] text-[#67e5e0]">Aventura arcade · 3D</p><h1 className="av-title mt-2 font-display text-4xl font-black sm:text-5xl">La Carrera de la Fe</h1><p className="mt-2 text-sm text-white/65">Esquiva, salta y persevera. ¡Tu récord te espera!</p></div><CarreraDeLaFeGame /></section></main>;
}
