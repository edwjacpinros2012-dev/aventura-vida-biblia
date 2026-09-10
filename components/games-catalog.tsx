"use client";

import { useMemo, useState } from "react";
import { GameCard } from "@/components/game-card";
import { SearchIcon } from "@/components/icons";
import { categories } from "@/lib/content";
import type { Game } from "@/types/content";

type FeaturedFilter = "todos" | "nuevos" | "populares";

export function GamesCatalog({ initialGames, initialCategory, initialFilter }: { initialGames: Game[]; initialCategory?: string; initialFilter?: string }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory ?? "Todas");
  const [difficulty, setDifficulty] = useState("Todas");
  const [age, setAge] = useState("Todas");
  const [featured, setFeatured] = useState<FeaturedFilter>(initialFilter === "nuevos" || initialFilter === "populares" ? initialFilter : "todos");

  const visibleGames = useMemo(() => initialGames.filter((game) => {
    const matchesQuery = `${game.name} ${game.description} ${game.category}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
    const matchesCategory = category === "Todas" || game.category === category;
    const matchesDifficulty = difficulty === "Todas" || game.difficulty === difficulty;
    const matchesAge = age === "Todas" || game.suggestedAge === age;
    const matchesFeatured = featured === "todos" || (featured === "nuevos" ? game.isNew : game.isPopular);
    return matchesQuery && matchesCategory && matchesDifficulty && matchesAge && matchesFeatured;
  }), [age, category, difficulty, featured, initialGames, query]);

  const clearFilters = () => { setQuery(""); setCategory("Todas"); setDifficulty("Todas"); setAge("Todas"); setFeatured("todos"); };

  return (
    <div>
      <div className="rounded-[1.5rem] border border-ink/5 bg-white p-4 shadow-card sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_160px]">
          <label className="relative block"><span className="sr-only">Buscar juegos</span><SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/45" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="h-12 w-full rounded-xl border border-ink/10 bg-sky/50 pl-11 pr-4 text-sm font-semibold text-ink outline-none placeholder:text-ink/40 focus:border-violet focus:ring-4 focus:ring-violet/15" placeholder="Busca por nombre o categoría" /></label>
          <label className="relative"><span className="sr-only">Filtrar por categoría</span><select value={category} onChange={(event) => setCategory(event.target.value)} className="h-12 w-full appearance-none rounded-xl border border-ink/10 bg-white px-4 text-sm font-bold text-ink outline-none focus:border-violet focus:ring-4 focus:ring-violet/15"><option>Todas</option>{categories.map((item) => <option key={item.name}>{item.name}</option>)}</select><span className="pointer-events-none absolute right-4 top-3.5 text-ink/45">⌄</span></label>
          <label className="relative"><span className="sr-only">Filtrar por dificultad</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="h-12 w-full appearance-none rounded-xl border border-ink/10 bg-white px-4 text-sm font-bold text-ink outline-none focus:border-violet focus:ring-4 focus:ring-violet/15"><option>Todas</option><option>Inicial</option><option>Explorador</option><option>Aventurero</option></select><span className="pointer-events-none absolute right-4 top-3.5 text-ink/45">⌄</span></label>
          <label className="relative"><span className="sr-only">Filtrar por edad</span><select value={age} onChange={(event) => setAge(event.target.value)} className="h-12 w-full appearance-none rounded-xl border border-ink/10 bg-white px-4 text-sm font-bold text-ink outline-none focus:border-violet focus:ring-4 focus:ring-violet/15"><option>Todas</option><option>5–9 años</option><option>6–10 años</option><option>7–12 años</option><option>8–13 años</option></select><span className="pointer-events-none absolute right-4 top-3.5 text-ink/45">⌄</span></label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2"><span className="mr-1 text-xs font-black uppercase tracking-wide text-ink/50">Mostrar</span>{([ ["todos", "Todos"], ["nuevos", "Nuevos"], ["populares", "Populares"] ] as const).map(([value, label]) => <button type="button" key={value} onClick={() => setFeatured(value)} className={`rounded-full px-3.5 py-2 text-xs font-extrabold outline-none transition-colors focus-visible:ring-4 focus-visible:ring-violet/25 ${featured === value ? "bg-ink text-white" : "bg-sky text-ink/65 hover:bg-violet/10 hover:text-violet"}`}>{label}</button>)}</div>
      </div>
      <div className="mt-7 flex items-center justify-between gap-4"><p className="text-sm font-bold text-ink/60"><span className="text-ink">{visibleGames.length}</span> {visibleGames.length === 1 ? "aventura encontrada" : "aventuras encontradas"}</p>{(query || category !== "Todas" || difficulty !== "Todas" || age !== "Todas" || featured !== "todos") && <button type="button" onClick={clearFilters} className="text-sm font-extrabold text-violet hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/25">Limpiar filtros</button>}</div>
      {visibleGames.length ? <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visibleGames.map((game) => <GameCard key={game.id} game={game} />)}</div> : <div className="mt-5 rounded-[1.5rem] border border-dashed border-ink/15 bg-white p-10 text-center"><span className="text-4xl">🧭</span><h2 className="mt-3 font-display text-2xl font-black text-ink">No encontramos esa ruta</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-ink/65">Prueba con otra palabra o elimina algunos filtros para descubrir más aventuras.</p><button type="button" onClick={clearFilters} className="mt-5 rounded-xl bg-violet px-4 py-2.5 text-sm font-extrabold text-white outline-none focus-visible:ring-4 focus-visible:ring-violet/25">Ver todos los juegos</button></div>}
    </div>
  );
}
