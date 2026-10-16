"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, KeyRound, LogIn, ShieldCheck } from "lucide-react";
import { api, errorMessage, ApiError } from "@/lib/client/api";

type LoginResponse = {
  user?: { id: string; name: string; email: string; role: string };
  requires2FA?: boolean;
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"password" | "code">("password");
  const [code, setCode] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (data.requires2FA) {
        setPassword("");
        setCode("");
        setStep("code");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
      if (err instanceof ApiError && err.status === 401) setPassword("");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmitCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api<LoginResponse>("/api/auth/2fa/verify", {
        method: "POST",
        body: JSON.stringify({ code }),
      });
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
      setCode("");
    } finally {
      setLoading(false);
    }
  }

  async function onCancel2fa() {
    setError("");
    setLoading(true);
    try {
      await api("/api/auth/2fa/cancel", { method: "POST" });
    } catch {
      // la cookie se limpia igualmente en el navegador al volver al paso previo
    } finally {
      setLoading(false);
      setStep("password");
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-pine-950 via-pine-900 to-pine-800 px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-3xl bg-white p-8 shadow-fyrama">
          <p className="text-center font-display text-2xl font-semibold tracking-tight text-pine-950">
            fyrama<span className="text-gold-600">.</span>
          </p>
          <p className="mt-1 text-center text-sm text-ink-500">
            Panel administrativo
          </p>

          {step === "password" ? (
            <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink-700">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-ink-900/15 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none transition focus:border-pine-700 focus:ring-2 focus:ring-pine-700/20"
                  placeholder="admin@fyrama.co"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink-700">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={show ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border border-ink-900/15 bg-white px-3.5 py-2.5 pr-10 text-sm text-ink-900 outline-none transition focus:border-pine-700 focus:ring-2 focus:ring-pine-700/20"
                    placeholder="••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-ink-400 hover:text-ink-600"
                  >
                    {show ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-pine-950 px-6 text-sm font-medium text-bone-50 transition-colors hover:bg-pine-800 disabled:opacity-60"
              >
                {loading ? "Ingresando…" : (
                  <>
                    <LogIn className="size-4" aria-hidden />
                    Ingresar
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={onSubmitCode} className="mt-6 space-y-4" noValidate>
              <div className="flex items-center gap-2 rounded-xl bg-pine-50 px-3 py-2.5 text-sm text-pine-900">
                <ShieldCheck className="size-4 shrink-0" aria-hidden />
                <span>
                  Verificación en dos pasos activa en{" "}
                  <span className="font-semibold">{email}</span>.
                </span>
              </div>

              <div>
                <label htmlFor="code" className="mb-1 block text-sm font-medium text-ink-700">
                  Código de 6 dígitos
                </label>
                <div className="relative">
                  <input
                    id="code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoFocus
                    required
                    maxLength={12}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9A-Za-z-]/g, ""))}
                    placeholder="123456"
                    className="block w-full rounded-xl border border-ink-900/15 bg-white px-3.5 py-2.5 pr-10 text-center font-mono text-lg tracking-widest text-ink-900 outline-none transition focus:border-pine-700 focus:ring-2 focus:ring-pine-700/20"
                  />
                  <KeyRound className="absolute inset-y-0 right-3 my-auto size-4 text-ink-400" aria-hidden />
                </div>
                <p className="mt-2 text-xs text-ink-400">
                  Ingresa el código de tu app de autenticación o un código de recuperación.
                </p>
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-pine-950 px-6 text-sm font-medium text-bone-50 transition-colors hover:bg-pine-800 disabled:opacity-60"
              >
                {loading ? "Verificando…" : (
                  <>
                    <ShieldCheck className="size-4" aria-hidden />
                    Verificar
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onCancel2fa}
                disabled={loading}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-ink-900/15 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-50 disabled:opacity-60"
              >
                <ArrowLeft className="size-4" aria-hidden />
                Cambiar contraseña
              </button>
            </form>
          )}

          {/* Demo credentials removed for production security */}
        </div>
        <Link href="/" className="mt-4 block text-center text-sm text-bone-50/70 hover:text-bone-50">
          ← Volver al sitio
        </Link>
      </div>
    </main>
  );
}