"use client";

import { FormEvent, useEffect, useState } from "react";

type Overview = {
  players: Array<{ nickname: string; avatarKey: string; level: number; points: number }>;
  reports: Array<{ id: string; reason: string; status: string; createdAt: string }>;
  rooms: Array<{ code: string; gameKey: string; status: string; maxPlayers: number }>;
  matches: Array<{ id: string; gameKey: string; mode: string; status: string }>;
  sanctions: Array<{ id: string; type: string; status: string; reason: string; user: { profile: { nickname: string; avatarKey: string } | null } }>;
  audit: Array<{ action: string; entity: string; createdAt: string }>;
};

export function CommunityConsole() {
  const [data, setData] = useState<Overview | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    try { const response = await fetch("/api/admin/overview"); const result = await response.json() as Overview & { error?: string }; if (!response.ok) throw new Error(result.error); setData(result); }
    catch (error) { setMessage(error instanceof Error ? error.message : "No pudimos cargar el panel."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const resolve = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/reports", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ reportId: form.get("reportId"), status: form.get("status"), resolution: form.get("resolution") }) });
    const result = await response.json() as { error?: string }; setMessage(response.ok ? "Reporte actualizado." : result.error ?? "No pudimos actualizar el reporte."); if (response.ok) void load();
  };
  const sanction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/sanctions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ nickname: form.get("nickname"), type: form.get("type"), reason: form.get("reason"), durationHours: Number(form.get("durationHours")) || undefined }) });
    const result = await response.json() as { error?: string }; setMessage(response.ok ? "Sanción registrada." : result.error ?? "No pudimos registrar la sanción."); if (response.ok) void load();
  };
  if (loading && !data) return <p className="mt-8 rounded-2xl bg-white p-5 text-sm font-bold text-ink/60 shadow-card">Cargando información privada…</p>;
  return <div className="mt-8 grid gap-6"><div className="grid gap-4 lg:grid-cols-2"><form onSubmit={resolve} className="rounded-2xl bg-white p-5 shadow-card"><h2 className="font-display text-xl font-black text-ink">Resolver reporte</h2><p className="mt-1 text-xs font-semibold text-ink/55">La resolución queda solo en el historial interno.</p><input name="reportId" required placeholder="ID de reporte" className="mt-4 w-full rounded-xl border border-ink/10 px-3 py-2 text-sm" /><select name="status" className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"><option value="RESOLVED">Resuelto</option><option value="DISMISSED">Descartado</option></select><input name="resolution" maxLength={500} placeholder="Nota privada" className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2 text-sm" /><button className="mt-3 rounded-xl bg-violet px-4 py-2 text-sm font-extrabold text-white">Guardar resolución</button></form><form onSubmit={sanction} className="rounded-2xl bg-white p-5 shadow-card"><h2 className="font-display text-xl font-black text-ink">Advertir o sancionar</h2><input name="nickname" required placeholder="Apodo del jugador" className="mt-4 w-full rounded-xl border border-ink/10 px-3 py-2 text-sm" /><select name="type" className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2 text-sm"><option value="WARNING">Advertencia</option><option value="SHORT_SUSPENSION">Suspensión corta</option><option value="LONG_SUSPENSION">Suspensión prolongada</option><option value="BAN">Expulsión</option></select><input name="durationHours" type="number" min="1" placeholder="Horas (solo suspensión)" className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2 text-sm" /><input name="reason" required minLength={3} maxLength={500} placeholder="Motivo privado" className="mt-2 w-full rounded-xl border border-ink/10 px-3 py-2 text-sm" /><button className="mt-3 rounded-xl bg-coral px-4 py-2 text-sm font-extrabold text-white">Aplicar acción</button></form></div>{message && <p role="status" className="rounded-xl bg-sky p-3 text-sm font-bold text-ink">{message}</p>}<div className="grid gap-6 lg:grid-cols-2"><section className="rounded-2xl bg-white p-5 shadow-card"><h2 className="font-display text-xl font-black text-ink">Reportes recientes</h2><div className="mt-4 grid gap-2">{data?.reports.length ? data.reports.map((report) => <p key={report.id} className="rounded-xl bg-sky/50 p-3 text-xs font-bold text-ink"><span className="block text-violet">{report.status} · {report.reason}</span><span className="mt-1 block break-all text-ink/55">{report.id}</span></p>) : <p className="text-sm font-bold text-ink/55">No hay reportes.</p>}</div></section><section className="rounded-2xl bg-white p-5 shadow-card"><h2 className="font-display text-xl font-black text-ink">Salas y partidas</h2><div className="mt-4 grid gap-2">{data?.rooms.map((room) => <p key={room.code} className="rounded-xl bg-sky/50 p-3 text-xs font-bold text-ink">Sala {room.code} · {room.gameKey} · {room.status}</p>)}{data?.matches.map((match) => <p key={match.id} className="rounded-xl bg-[#e9fbf5] p-3 text-xs font-bold text-ink">{match.mode} · {match.gameKey} · {match.status}</p>)}</div></section></div><section className="rounded-2xl bg-white p-5 shadow-card"><h2 className="font-display text-xl font-black text-ink">Jugadores y sanciones</h2><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{data?.players.map((player) => <p key={player.nickname} className="rounded-xl bg-sky/50 p-3 text-sm font-bold text-ink">{player.avatarKey} {player.nickname}<span className="mt-1 block text-xs text-ink/55">Nivel {player.level} · {player.points} puntos</span></p>)}{data?.sanctions.map((sanction) => <p key={sanction.id} className="rounded-xl bg-coral/10 p-3 text-xs font-bold text-ink">{sanction.user.profile?.nickname ?? "Jugador"} · {sanction.type}<span className="mt-1 block text-ink/55">{sanction.status}: {sanction.reason}</span></p>)}</div></section></div>;
}
