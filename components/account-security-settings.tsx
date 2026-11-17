"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePlayerProgress } from "@/components/player-progress-provider";

export function AccountSecuritySettings() {
  const router = useRouter();
  const { identity, identityReady } = usePlayerProgress();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(""); setError("");
    if (newPassword !== confirmation) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/auth/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const result = await response.json() as { error?: string; message?: string };
      if (!response.ok) throw new Error(result.error ?? "No se pudo actualizar la contraseña.");
      setCurrentPassword(""); setNewPassword(""); setConfirmation("");
      setNotice(result.message ?? "Contraseña actualizada.");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo actualizar la contraseña.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (!identityReady) return <section className="av-page min-h-screen p-10 text-center text-white/60">Preparando tu cuenta…</section>;
  if (!identity.authenticated) return <section className="av-page min-h-screen"><div className="mx-auto max-w-xl px-4 py-16 text-center"><h1 className="av-title font-display text-3xl font-black">Inicia sesión para proteger tu cuenta</h1><p className="mt-3 text-sm text-white/60">Esta sección solo está disponible para cuentas registradas.</p><Link href="/login" className="av-teal-button mt-6 inline-flex rounded-xl px-5 py-3 font-bold">Iniciar sesión</Link></div></section>;

  return <section className="av-page min-h-screen">
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <a href="/perfil" className="text-sm font-bold text-cyan-200 hover:underline">← Volver al perfil</a>
      <div className="av-panel mt-5 rounded-3xl p-6 sm:p-8">
        <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-200">Seguridad de la cuenta</p>
        <h1 className="av-title mt-2 font-display text-3xl font-black">Protege tu aventura</h1>
        <p className="mt-3 text-sm leading-6 text-white/65">Puedes cambiar tu contraseña sin añadir correo, teléfono ni otros datos personales. Usa una contraseña larga que no compartas con nadie.</p>
        <form onSubmit={changePassword} className="mt-7 grid gap-4">
          <label className="grid gap-2 text-sm font-bold text-[#f5e5b9]">Contraseña actual
            <input required type="password" autoComplete="current-password" maxLength={128} value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="rounded-xl border border-white/15 bg-[#061923] px-4 py-3 text-white outline-none focus:border-cyan-200" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-[#f5e5b9]">Nueva contraseña
            <input required type="password" minLength={12} maxLength={128} autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="rounded-xl border border-white/15 bg-[#061923] px-4 py-3 text-white outline-none focus:border-cyan-200" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-[#f5e5b9]">Repite la nueva contraseña
            <input required type="password" minLength={12} maxLength={128} autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="rounded-xl border border-white/15 bg-[#061923] px-4 py-3 text-white outline-none focus:border-cyan-200" />
          </label>
          {error && <p role="alert" className="rounded-xl bg-rose-300/10 p-3 text-sm font-bold text-rose-100">{error}</p>}
          {notice && <p role="status" className="rounded-xl bg-emerald-300/10 p-3 text-sm font-bold text-emerald-100">{notice}</p>}
          <button disabled={busy} className="av-teal-button rounded-xl px-5 py-3 text-sm font-black disabled:opacity-50">{busy ? "Guardando…" : "Actualizar contraseña"}</button>
        </form>
        <div className="mt-8 border-t border-white/10 pt-6">
          <h2 className="font-display text-xl font-black text-[#f5e5b9]">Cerrar sesión</h2>
          <p className="mt-2 text-sm text-white/60">Cierra esta sesión de forma segura en este dispositivo.</p>
          <button type="button" disabled={busy} onClick={() => void logout()} className="mt-4 rounded-xl border border-rose-200/25 px-5 py-3 text-sm font-bold text-rose-100 hover:bg-rose-300/10 disabled:opacity-50">Cerrar sesión</button>
        </div>
      </div>
    </div>
  </section>;
}
