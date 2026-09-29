"use client";

import { useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { Label, Input, FieldError } from "@/components/ui/Field";
import { api, errorMessage, ApiError } from "@/lib/client/api";

export function ChangePasswordForm() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [fieldsError, setFieldsError] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldsError({});
    setSuccess(false);
    if (form.newPassword !== form.confirmPassword) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }
    setBusy(true);
    try {
      await api("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError && err.fields) setFieldsError(err.fields);
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-bone-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 font-display text-lg font-semibold text-ink-900">Contraseña</h2>
      <p className="mb-5 text-sm text-ink-500">
        Al cambiarla se cierran tus otras sesiones, pero esta se mantiene.
      </p>

      {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {success && (
        <p className="mb-4 rounded-xl bg-pine-900/5 px-4 py-3 text-sm text-pine-800">Contraseña actualizada.</p>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="pw-current">Contraseña actual *</Label>
          <Input
            id="pw-current"
            type="password"
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
            invalid={Boolean(fieldsError.currentPassword)}
          />
          <FieldError message={fieldsError.currentPassword?.[0]} />
        </div>
        <div>
          <Label htmlFor="pw-new">Nueva contraseña *</Label>
          <Input
            id="pw-new"
            type="password"
            autoComplete="new-password"
            value={form.newPassword}
            onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
            invalid={Boolean(fieldsError.newPassword)}
          />
          <FieldError message={fieldsError.newPassword?.[0]} />
        </div>
        <div>
          <Label htmlFor="pw-confirm">Repite la nueva contraseña *</Label>
          <Input
            id="pw-confirm"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-pine-950 px-7 text-sm font-medium text-bone-50 hover:bg-pine-800 disabled:opacity-60"
      >
        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <KeyRound className="size-4" aria-hidden />}
        Cambiar contraseña
      </button>
    </form>
  );
}