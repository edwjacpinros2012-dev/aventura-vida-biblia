import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-ink/5 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr] lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-ink/65">Un mundo de juegos y aventuras para descubrir, aprender y vivir buenos valores en familia.</p>
        </div>
        <div>
          <h2 className="font-display text-sm font-black uppercase tracking-wider text-ink">Explora</h2>
          <div className="mt-4 grid gap-2 text-sm font-bold text-ink/65">
            <Link className="hover:text-violet" href="/juegos">Juegos</Link>
            <Link className="hover:text-violet" href="/aventuras">Aventuras</Link>
            <Link className="hover:text-violet" href="/mision">Misión diaria</Link>
            <Link className="hover:text-violet" href="/ranking">Ranking</Link>
          </div>
        </div>
        <div>
          <h2 className="font-display text-sm font-black uppercase tracking-wider text-ink">Un espacio seguro</h2>
          <p className="mt-4 text-sm leading-6 text-ink/65">Los rankings muestran apodos y avatares, nunca información privada. No hay chat entre jugadores.</p>
        </div>
      </div>
      <div className="border-t border-ink/5 px-4 py-5 text-center text-xs font-semibold text-ink/50">© {new Date().getFullYear()} Aventura Vida · Proyecto Vida Kids · Demo de Fase 1</div>
    </footer>
  );
}
