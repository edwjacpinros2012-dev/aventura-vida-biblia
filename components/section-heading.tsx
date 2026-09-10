import Link from "next/link";
import { ArrowRight } from "@/components/icons";

export function SectionHeading({ eyebrow, title, description, href, action = "Ver todo" }: { eyebrow?: string; title: string; description?: string; href?: string; action?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-violet">{eyebrow}</p>}
        <h2 className="font-display text-3xl font-black tracking-tight text-ink sm:text-4xl">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65 sm:text-base">{description}</p>}
      </div>
      {href && <Link href={href} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-extrabold text-violet outline-none hover:bg-violet/10 focus-visible:ring-4 focus-visible:ring-violet/25">{action} <ArrowRight className="h-4 w-4" /></Link>}
    </div>
  );
}
