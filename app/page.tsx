import { HomeDashboard } from "@/components/home-dashboard";
import { PlatformShareButton } from "@/components/platform-share-button";

export default function HomePage() {
  return <>
    <HomeDashboard />
    <section className="av-page border-y border-sun/15 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 rounded-2xl border border-teal-200/20 bg-[#082b39] p-5 text-center sm:flex-row sm:text-left">
        <div><p className="font-display text-2xl font-black text-[#f5e5b9]">Invita a tu familia a la aventura</p><p className="mt-1 text-sm font-semibold text-white/65">La plataforma se abre sin cuenta; cada jugador puede crear la suya para guardar su progreso.</p></div>
        <PlatformShareButton />
      </div>
    </section>
  </>;
}
