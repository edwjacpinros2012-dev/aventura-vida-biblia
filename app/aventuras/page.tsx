import type { Metadata } from "next";
import { AdventureCard } from "@/components/adventure-card";
import { adventures } from "@/lib/content";

export const metadata: Metadata = { title: "Aventuras | Aventura Vida Biblia", description: "Historias largas para explorar capítulo a capítulo." };

export default function AdventuresPage() { return <section className="av-page"><div className="mx-auto max-w-[1500px] px-4 pb-12 pt-12 sm:px-6 sm:pt-16 lg:px-8"><div className="av-panel rounded-[2rem] p-6 sm:p-10"><p className="av-kicker text-xs font-black uppercase tracking-[.2em]">Mapas, historias y desafíos</p><h1 className="av-title mt-3 font-display text-5xl font-black tracking-tight sm:text-6xl">La Gran Aventura</h1><p className="mt-4 max-w-2xl text-base leading-7 text-white/70">Cada aventura une capítulos, objetivos y juegos reales. El mapa visual acompaña el progreso sin inventar desbloqueos.</p></div><div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{adventures.map((adventure) => <AdventureCard key={adventure.slug} adventure={adventure} />)}</div></div></section>; }
