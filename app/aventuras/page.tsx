import type { Metadata } from "next";
import { AdventureCard } from "@/components/adventure-card";
import { adventures } from "@/lib/content";

export const metadata: Metadata = { title: "Aventuras | Aventura Vida", description: "Historias largas para explorar capítulo a capítulo." };

export default function AdventuresPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 sm:pt-16 lg:px-8"><div className="max-w-2xl"><p className="text-xs font-black uppercase tracking-[.2em] text-violet">Mapas, historias y desafíos</p><h1 className="mt-3 font-display text-5xl font-black tracking-tight text-ink sm:text-6xl">Aventuras grandes</h1><p className="mt-4 text-base leading-7 text-ink/65">Las aventuras unen varios capítulos, objetivos y juegos relacionados. Explora a tu ritmo y ve descubriendo el mapa.</p></div><div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{adventures.map((adventure) => <AdventureCard key={adventure.slug} adventure={adventure} />)}</div><div className="mt-10 rounded-2xl bg-sky p-5 text-sm leading-6 text-ink/70"><span className="font-extrabold text-ink">Fase 1:</span> el mapa y la estructura de capítulos están presentados como contenido de demostración. El desbloqueo y el progreso persistente llegarán con el sistema de cuentas y Game SDK.</div></section>
  );
}
