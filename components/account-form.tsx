"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function AccountForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [avatarKey, setAvatarKey] = useState("fox");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const registering = mode === "register";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true); setError(null);
    try {
      const response = await fetch(`/api/auth/${registering ? "register" : "login"}`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify(registering ? { nickname, avatarKey, password } : { nickname, password }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "No pudimos continuar.");
      router.push("/perfil"); router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "No pudimos continuar."); }
    finally { setSending(false); }
  }

  return <section className="mx-auto max-w-md px-4 py-12 sm:py-16"><div className="rounded-[2rem] bg-white p-6 shadow-lift sm:p-9"><p className="text-xs font-black uppercase tracking-[.2em] text-violet">Cuenta protegida</p><h1 className="mt-3 font-display text-4xl font-black text-ink">{registering ? "Crea tu aventura" : "¡Qué bueno verte!"}</h1><p className="mt-3 text-sm font-semibold leading-6 text-ink/65">Usa un apodo, un avatar y una contraseña segura. No pedimos nombre real, teléfono, dirección ni correo.</p><form className="mt-7 grid gap-4" onSubmit={submit}><label className="grid gap-2 text-sm font-extrabold text-ink">Apodo público<input required value={nickname} onChange={(event) => setNickname(event.target.value)} minLength={2} maxLength={20} autoComplete="username" className="rounded-xl border border-ink/10 bg-sky/40 px-4 py-3 font-bold outline-none focus:border-violet focus:ring-4 focus:ring-violet/15" placeholder="Ej. LuzExploradora" /></label>{registering && <label className="grid gap-2 text-sm font-extrabold text-ink">Avatar<select value={avatarKey} onChange={(event) => setAvatarKey(event.target.value)} className="rounded-xl border border-ink/10 bg-sky/40 px-4 py-3 font-bold outline-none focus:border-violet focus:ring-4 focus:ring-violet/15"><option value="fox">🦊 Zorro explorador</option><option value="spark">✦ Destello</option><option value="dove">🕊️ Paloma</option><option value="leaf">🌿 Hoja</option></select></label>}<label className="grid gap-2 text-sm font-extrabold text-ink">Contraseña<input required value={password} onChange={(event) => setPassword(event.target.value)} type="password" minLength={registering ? 12 : 1} maxLength={128} autoComplete={registering ? "new-password" : "current-password"} className="rounded-xl border border-ink/10 bg-sky/40 px-4 py-3 font-bold outline-none focus:border-violet focus:ring-4 focus:ring-violet/15" placeholder={registering ? "12 caracteres o más" : "Tu contraseña"} /></label>{error && <p role="alert" className="rounded-xl bg-coral/10 px-4 py-3 text-sm font-bold text-coral">{error}</p>}<button disabled={sending} type="submit" className="mt-2 rounded-xl bg-ink px-4 py-3 font-extrabold text-white transition hover:bg-violet disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/25">{sending ? "Guardando…" : registering ? "Crear cuenta" : "Entrar"}</button></form><p className="mt-6 text-sm font-bold text-ink/65">{registering ? "¿Ya tienes una cuenta?" : "¿Todavía no tienes cuenta?"} <Link href={registering ? "/login" : "/registro"} className="text-violet hover:underline">{registering ? "Inicia sesión" : "Crear cuenta"}</Link></p></div></section>;
}
