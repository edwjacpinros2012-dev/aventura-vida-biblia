import type { Metadata } from "next";
import { CreationWorld } from "@/components/creation-world";

export const metadata: Metadata = {
  title: "Mundo 3D · Jardín de la Creación",
  description: "Explora, reúne recursos y construye pequeñas estructuras en el primer territorio 3D de Aventura Vida.",
};

const features = [
  { icon: "🧭", title: "Exploración", text: "Recorre el valle en tercera persona, usa el salto y acércate al guardián para conversar." },
  { icon: "✨", title: "Misión de luz", text: "Encuentra cuatro destellos dorados y completa la primera misión del Jardín." },
  { icon: "🪵", title: "Recolectar recursos", text: "Busca madera y piedra por el territorio. Cada nodo se puede recoger una sola vez en este dispositivo." },
  { icon: "🏡", title: "Construcción inicial", text: "Usa los materiales para colocar cabañas y lámparas decorativas en el valle." },
];

export default function Mundo3DPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#061923] px-3 py-8 text-white sm:px-6 sm:py-12">
      <div className="mx-auto max-w-[1500px]">
        <header className="relative mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0d3945] via-[#092833] to-[#071b28] p-5 sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
          <p className="text-xs font-black uppercase tracking-[.24em] text-amber-300">Aventura Vida · Universo 3D</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-black leading-tight sm:text-5xl">El Reino de la Creación</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/70 sm:text-base">
            Una primera zona jugable para explorar el valle, encontrar materiales, completar una misión y empezar a construir.
            Este es el prototipo inicial de un mundo mayor.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full border border-emerald-200/20 bg-emerald-300/10 px-3 py-2 text-emerald-100">Zona: Jardín de la Creación</span>
            <span className="rounded-full border border-amber-200/20 bg-amber-300/10 px-3 py-2 text-amber-100">Objetivo: reunir y construir</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-white/70">Controles PC + móvil</span>
          </div>
        </header>

        <CreationWorld />

        <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-2xl border border-white/10 bg-white/[.04] p-4">
              <span className="text-2xl" aria-hidden="true">{feature.icon}</span>
              <h2 className="mt-2 font-black text-amber-100">{feature.title}</h2>
              <p className="mt-2 text-sm leading-5 text-white/65">{feature.text}</p>
            </article>
          ))}
        </section>

        <section className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
          <article className="rounded-2xl border border-white/10 bg-[#0a2631] p-5">
            <h2 className="text-lg font-black">Controles</h2>
            <div className="mt-3 grid gap-2 text-sm text-white/70 sm:grid-cols-2">
              <p><kbd className="rounded-md border border-white/15 bg-white/5 px-2 py-1 font-bold text-white">W A S D</kbd> o flechas para moverte</p>
              <p><kbd className="rounded-md border border-white/15 bg-white/5 px-2 py-1 font-bold text-white">Espacio</kbd> para saltar</p>
              <p className="sm:col-span-2">En teléfono usa el pad táctil y los botones de salto y construcción que aparecen en el juego.</p>
            </div>
          </article>
          <article className="rounded-2xl border border-amber-200/15 bg-amber-200/[.05] p-5">
            <h2 className="text-lg font-black text-amber-100">Estado de esta versión</h2>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Las luces, los materiales y las estructuras se guardan en el almacenamiento local del navegador. Todavía no son inventario sincronizado con la cuenta ni construcción en multijugador; esa conexión requiere backend y pruebas.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
