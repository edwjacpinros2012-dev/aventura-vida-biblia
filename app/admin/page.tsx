import { redirect } from "next/navigation";
import { currentAccount } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { CommunityConsole } from "@/components/admin/community-console";

export default async function AdminPage() {
  const account = await currentAccount();
  if (!account) redirect("/login");
  if (account.role !== "ADMIN" && account.role !== "MODERATOR") redirect("/");
  const [players, reports, activeRooms, sanctions] = await Promise.all([
    prisma.profile.count(),
    prisma.communityReport.count({ where: { status: { in: ["OPEN", "IN_REVIEW"] } } }),
    prisma.multiplayerRoom.count({ where: { status: { in: ["LOBBY", "PLAYING"] }, expiresAt: { gt: new Date() } } }),
    prisma.moderationSanction.count({ where: { status: "ACTIVE", OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }] } }),
  ]);
  return <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6"><p className="text-xs font-black uppercase tracking-[.2em] text-violet">Zona privada del creador</p><h1 className="mt-3 font-display text-4xl font-black text-ink">Comunidad y seguridad</h1><p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-ink/65">Solo se muestran datos de moderación necesarios. Los nombres, direcciones y datos de contacto nunca forman parte de esta vista.</p><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[[players, "Cuentas con perfil"], [reports, "Reportes abiertos"], [activeRooms, "Salas activas"], [sanctions, "Sanciones activas"]].map(([value, label]) => <article key={String(label)} className="rounded-2xl bg-white p-5 shadow-card"><p className="font-display text-3xl font-black text-violet">{value}</p><p className="mt-2 text-sm font-bold text-ink/60">{label}</p></article>)}</div><CommunityConsole /></section>;
}
