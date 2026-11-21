import type { Metadata } from "next";
import ThreeKidsPortalsWorld from "@/components/three-kids-portals-world";

export const metadata: Metadata = {
  title: "Los 3 niños y los portales poderosos · Aventura de la Fe",
  description: "Prototipo 3D jugable con los avatares oficiales existentes de Proyecto Vida Kids.",
};

export default function PortalesPoderososPage() {
  return <main className="min-h-screen bg-[#04121f] px-3 py-8 text-white sm:px-6">
    <div className="mx-auto max-w-7xl">
      <p className="text-xs font-black uppercase tracking-[.24em] text-cyan-200">Proyecto Vida Kids · Aventura de la Fe</p>
      <h1 className="mt-2 text-3xl font-black sm:text-5xl">Los 3 niños y los portales poderosos</h1>
      <p className="my-4 max-w-3xl text-sm leading-6 text-white/70">Una aventura de exploración, rescate, amistad, valentía, oración y esperanza. Los protagonistas son los avatares oficiales que ya existen en el proyecto.</p>
      <ThreeKidsPortalsWorld />
      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border border-white/10 bg-white/[.04] p-4"><b className="text-cyan-100">Explorar y descubrir</b><p className="mt-1 text-sm text-white/65">Recorre el mundo 3D, busca luces y activa el portal.</p></article>
        <article className="rounded-2xl border border-white/10 bg-white/[.04] p-4"><b className="text-cyan-100">Tres amigos</b><p className="mt-1 text-sm text-white/65">Tu avatar elegido y dos compañeros te siguen por el escenario.</p></article>
        <article className="rounded-2xl border border-white/10 bg-white/[.04] p-4"><b className="text-cyan-100">Fe y colaboración</b><p className="mt-1 text-sm text-white/65">Las misiones se resuelven con oración, cuidado, observación y trabajo en equipo.</p></article>
      </section>
    </div>
  </main>;
}
