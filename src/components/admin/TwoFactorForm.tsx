"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import { Label, Input } from "@/components/ui/Field";
import { api, errorMessage } from "@/lib/client/api";

type Status = { enabled: boolean; confirmedAt: string | null };
type SetupData = { secret: string; uri: string };
type ConfirmData = { enabled: boolean; recoveryCodes: string[] };

type Steps = "loading" | "ready" | "setup" | "confirm" | "done";

export function TwoFactorForm() {
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const [step, setStep] = useState<Steps>("loading");
  const [secret, setSecret] = useState("");
  const [uri, setUri] = useState("");
  const [code, setCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  useEffect(() => {
    api<Status>("/api/admin/2fa/status")
      .then((s) => setStatus(s))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setStep("ready"));
  }, []);

  async function startSetup() {
    setError("");
    setBusy(true);
    try {
      const data = await api<SetupData>("/api/admin/2fa/setup", { method: "GET" });
      setSecret(data.secret);
      setUri(data.uri);
      setStep("confirm");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    setError("");
    setBusy(true);
    try {
      const data = await api<ConfirmData>("/api/admin/2fa/confirm", {
        method: "POST",
        body: JSON.stringify({ secret, code }),
      });
      setRecoveryCodes(data.recoveryCodes);
      setStatus({ enabled: true, confirmedAt: new Date().toISOString() });
      setStep("done");
    } catch (err) {
      setError(errorMessage(err));
      setCode("");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setError("");
    setBusy(true);
    try {
      await api("/api/admin/2fa/disable", {
        method: "POST",
        body: JSON.stringify({ code }),
      });
      setStatus({ enabled: false, confirmedAt: null });
      setCode("");
      setSecret("");
      setUri("");
      setStep("ready");
    } catch (err) {
      setError(errorMessage(err));
      setCode("");
    } finally {
      setBusy(false);
    }
  }

  async function copySecret() {
    let text = secret;
    try {
      await navigator.clipboard.writeText(secret);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = secret;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      text = secret;
    }
    void text;
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  async function copyRecoveryCodes() {
    const text = recoveryCodes.join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  if (step === "loading") {
    return (
      <div className="flex items-center gap-2 text-sm text-ink-500">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Cargando estado de seguridad…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {status?.enabled && step === "ready" && (
        <div className="rounded-2xl border border-bone-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-ink-900">
                Verificación en dos pasos
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                Cada inicio de sesión requiere un código de 6 dígitos. Activa desde{" "}
                {status.confirmedAt ? new Date(status.confirmedAt).toLocaleDateString("es-CO") : "—"}.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-pine-100 px-3 py-1 text-xs font-medium text-pine-800">
              <ShieldCheck className="size-3.5" aria-hidden /> Activa
            </span>
          </div>

          <div className="mt-5 space-y-3">
            <Label htmlFor="disable-code">Código actual para desactivar</Label>
            <div className="flex flex-wrap gap-3">
              <Input
                id="disable-code"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                className="w-40 text-center font-mono tracking-widest"
                value={code}
                disabled={busy}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
              />
              <button
                type="button"
                onClick={disable}
                disabled={busy || code.length !== 6}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-ink-900/15 px-5 text-sm font-medium text-ink-700 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
              >
                {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <ShieldOff className="size-4" aria-hidden />}
                Desactivar
              </button>
            </div>
          </div>
        </div>
      )}

      {(!status?.enabled || step === "setup" || step === "confirm") && step !== "done" && (
        <div className="rounded-2xl border border-bone-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-ink-900">
            Verificación en dos pasos
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            Añade una app de autenticación (Google Authenticator, Authy, 1Password…) para proteger tu cuenta.
          </p>

          {step === "ready" && (
            <button
              type="button"
              onClick={startSetup}
              disabled={busy}
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-pine-950 px-7 text-sm font-medium text-bone-50 hover:bg-pine-800 disabled:opacity-60"
            >
              {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <ShieldCheck className="size-4" aria-hidden />}
              Activar
            </button>
          )}

          {step === "setup" && !secret && (
            <p className="mt-4 text-sm text-ink-400">Generando clave…</p>
          )}

          {step === "confirm" && secret && (
            <div className="mt-5 space-y-4">
              <div className="rounded-xl bg-pine-50 p-4">
                <p className="mb-2 text-xs font-medium text-pine-900">
                  Escanea este código con tu app de autenticación:
                </p>
                <a
                  href={uri}
                  className="break-all text-xs font-mono text-pine-800 underline decoration-pine-300 underline-offset-2 hover:text-pine-900"
                  title="Abrir en la app"
                >
                  {uri}
                </a>
                <p className="mt-3 mb-1 text-xs font-medium text-pine-900">
                  O ingresa esta clave manualmente:
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <code className="rounded-lg bg-white px-3 py-1.5 font-mono text-sm tracking-[0.2em] text-pine-950">
                    {secret.match(/.{1,4}/g)?.join(" ") ?? secret}
                  </code>
                  <button
                    type="button"
                    onClick={copySecret}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-pine-200 bg-white px-3 text-xs font-medium text-pine-800 hover:bg-pine-100"
                  >
                    {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
                    {copied ? "Copiada" : "Copiar"}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="setup-code">Código de 6 dígitos</Label>
                <div className="flex flex-wrap gap-3">
                  <Input
                    id="setup-code"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    className="w-40 text-center font-mono tracking-widest"
                    value={code}
                    disabled={busy}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                  />
                  <button
                    type="button"
                    onClick={confirm}
                    disabled={busy || code.length !== 6}
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-pine-950 px-6 text-sm font-medium text-bone-50 hover:bg-pine-800 disabled:opacity-50"
                  >
                    {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <ShieldCheck className="size-4" aria-hidden />}
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {step === "done" && (
        <div className="rounded-2xl border border-gold-300 bg-gold-50 p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-ink-900">
            Guarda tus códigos de recuperación
          </h2>
          <p className="mt-1 text-sm text-ink-600">
            Si pierdes el acceso a tu app, usa cualquiera de estos códigos{" "}
            <strong>una sola vez</strong>. Guárdalos en un lugar seguro.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {recoveryCodes.map((rc) => (
              <code
                key={rc}
                className="rounded-lg bg-white px-3 py-2 text-center font-mono text-sm tracking-widest text-pine-950"
              >
                {rc}
              </code>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={copyRecoveryCodes}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-pine-950 px-5 text-sm font-medium text-bone-50 hover:bg-pine-800"
            >
              {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
              {copied ? "Copiados" : "Copiar códigos"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("ready");
                setCode("");
                setSecret("");
                setUri("");
              }}
              className="inline-flex h-10 items-center rounded-xl border border-ink-900/15 px-5 text-sm font-medium text-ink-700 hover:bg-bone-100"
            >
              Hecho
            </button>
          </div>
        </div>
      )}
    </div>
  );
}