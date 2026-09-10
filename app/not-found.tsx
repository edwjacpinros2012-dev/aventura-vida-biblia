import Link from "next/link";

export default function NotFound() {
  return <section className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6"><span className="text-6xl">🧭</span><p className="mt-5 text-xs font-black uppercase tracking-[.2em] text-violet">Ruta no encontrada</p><h1 className="mt-3 font-display text-4xl font-black text-ink">Parece que este mapa se perdió.</h1><p className="mt-4 text-ink/65">Volvamos a un sendero conocido para seguir la aventura.</p><Link href="/" className="mt-7 inline-flex rounded-xl bg-ink px-5 py-3 text-sm font-extrabold text-white transition-colors hover:bg-violet focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/25">Ir al inicio</Link></section>;
}
