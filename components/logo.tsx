import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className="group inline-flex items-center gap-2.5 rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-sun/40" aria-label="Aventura Vida Biblia, ir al inicio"><span className="relative grid h-10 w-10 place-items-center rounded-xl border border-sun/60 bg-[#082734] text-xl text-sun shadow-[0_0_18px_rgba(245,189,77,.18)] transition-transform group-hover:-rotate-6 group-hover:scale-105" aria-hidden="true"><span className="absolute h-5 w-5 rotate-45 border border-sun/70" /><span className="relative text-base">✦</span></span>{!compact && <span className="leading-none"><span className="block font-display text-lg font-black tracking-tight text-[#f5e5b9]">AVENTURA VIDA</span><span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#5edddb]">Proyecto Vida Kids</span></span>}</Link>;
}
