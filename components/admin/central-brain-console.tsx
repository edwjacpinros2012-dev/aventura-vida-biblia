"use client";

import { useEffect, useState } from "react";

type BrainStatus = {
  config: { enabled: boolean; autoPublishAi: false; maxProposalsPerDay: 1 };
  provider: { configured: boolean; provider?: string; model?: string; reason?: string };
  latestRun: { dateKey: string; status: string; attempt: number; error: string | null; startedAt: string; finishedAt: string | null } | null;
  content: { drafts: number; published: number; failedRuns: number };
  schedule: string;
};

export function CentralBrainConsole() {
  const [status, setStatus] = useState<BrainStatus | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const load = async () => {
    try {
      const response = await fetch("/api/admin/brain");
      const body = await response.json() as BrainStatus & { error?: string };
      if (!response.ok) throw new Error(body.error ?? "No pudimos cargar el cerebro central.");
      setStatus(body);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No pudimos cargar el cerebro central.");
    }
  };
  useEffect(() => { void load(); }, []);
  const toggle = async () => {
    if (!status) return;
    setSaving(true); setMessage(null);
    try {
      const response = await fetch("/api/admin/brain", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ enabled: !status.config.enabled }) });
      const body = await response.json() as BrainStatus & { error?: string };
      if (!response.ok) throw new Error(body.error ?? "No pudimos actualizar la automatización.");
      setStatus(body);
      setMessage(body.config.enabled ? "Automatización editorial reanudada." : "Automatización editorial pausada.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "No pudimos actualizar la automatización."); }
    finally { setSaving(false); }
  };

  return <section className="mt-8 rounded-2xl bg-[#071e2b] p-5 text-white shadow-card"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.16em] text-[#67e5e0]">Cerebro central editorial</p><h2 className="mt-2 font-display text-2xl font-black">Automatización de contenido</h2><p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/65">Lee solo catálogos y retos curados. Genera borradores; nunca concede premios, controla PvP ni publica IA sin revisión humana.</p></div><button type="button" disabled={!status || saving} onClick={toggle} className="rounded-xl bg-[#f5bd4d] px-4 py-3 text-sm font-extrabold text-[#132c3a] disabled:opacity-60">{status?.config.enabled ? "Pausar automatización" : "Reanudar automatización"}</button></div>{message && <p role="status" className="mt-4 rounded-xl bg-white/10 p-3 text-sm font-bold">{message}</p>} {!status ? <p className="mt-5 text-sm font-bold text-white/65">Cargando estado privado…</p> : <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><article className="rounded-xl bg-white/10 p-3"><p className="text-xs font-black uppercase text-white/55">Proveedor</p><p className="mt-1 font-bold">{status.provider.configured ? `Configurado · ${status.provider.model}` : "No configurado"}</p></article><article className="rounded-xl bg-white/10 p-3"><p className="text-xs font-black uppercase text-white/55">Borradores</p><p className="mt-1 font-display text-2xl font-black">{status.content.drafts}</p></article><article className="rounded-xl bg-white/10 p-3"><p className="text-xs font-black uppercase text-white/55">Publicado jugable</p><p className="mt-1 font-display text-2xl font-black">{status.content.published}</p></article><article className="rounded-xl bg-white/10 p-3"><p className="text-xs font-black uppercase text-white/55">Fallos registrados</p><p className="mt-1 font-display text-2xl font-black">{status.content.failedRuns}</p></article></div>}{status?.latestRun && <p className="mt-4 text-xs font-semibold text-white/60">Última ejecución: {status.latestRun.dateKey} · {status.latestRun.status} · intento {status.latestRun.attempt}</p>}<p className="mt-3 text-xs font-semibold text-white/50">{status?.schedule ?? "El horario se comprobará al cargar el panel."}</p></section>;
}
