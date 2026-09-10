import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5 rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-violet/25" aria-label="Aventura Vida, ir al inicio">
      <span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-ink text-xl shadow-card transition-transform group-hover:-rotate-6 group-hover:scale-105" aria-hidden="true">
        <span className="absolute h-5 w-5 rounded-full bg-sun" />
        <span className="relative text-base">✦</span>
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block font-display text-lg font-black tracking-tight text-ink">AVENTURA VIDA</span>
          <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-violet">Proyecto Vida Kids</span>
        </span>
      )}
    </Link>
  );
}
