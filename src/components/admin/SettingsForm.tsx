"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Label, Input, Textarea } from "@/components/ui/Field";
import { api, errorMessage, ApiError } from "@/lib/client/api";

const FIELDS: { key: string; label: string; hint?: string; textarea?: boolean }[] = [
  { key: "contact_email", label: "Correo de contacto", hint: "Se muestra en la página de contacto." },
  { key: "contact_phone", label: "Teléfono de contacto" },
  { key: "contact_city", label: "Ciudad / cobertura" },
  { key: "seo_title", label: "Título genérico SEO" },
  { key: "seo_description", label: "Meta descripción genérica", textarea: true },
  { key: "legal_disclaimer", label: "Aviso legal (asesoría jurídica)", textarea: true },
];

export function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const [values, setValues] = useState<Record<string, string>>({ ...initial });
  const [error, setError] = useState("");
  const [fieldsError, setFieldsError] = useState<Record<string, string[]>>({});
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldsError({});
    setSaved(false);
    setBusy(true);
    try {
      const payload: Record<string, string> = {};
      for (const [k, v] of Object.entries(values)) {
        if (FIELDS.some((f) => f.key === k) && v.trim() !== "") payload[k] = v.trim();
      }
      await api("/api/admin/settings", { method: "PUT", body: JSON.stringify(payload) });
      setSaved(true);
    } catch (err) {
      if (err instanceof ApiError && err.fields) setFieldsError(err.fields);
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="rounded-2xl border border-bone-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 font-display text-lg font-semibold text-ink-900">Ajustes del sitio</h2>
      <p className="mb-5 text-sm text-ink-500">Campos vacíos usan los valores por defecto.</p>

      {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {saved && <p className="mb-4 rounded-xl bg-pine-900/5 px-4 py-3 text-sm text-pine-800">Ajustes guardados.</p>}

      <div className="space-y-4">
        {FIELDS.map((f) => {
          const val = values[f.key] ?? "";
          const isBool = f.key === "demo_banner_enabled";
          return (
            <div key={f.key}>
              <Label htmlFor={`set-${f.key}`} className="flex">
                {f.label}
                {isBool && (
                  <input
                    id={`set-${f.key}`}
                    type="checkbox"
                    checked={val === "true"}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [f.key]: e.target.checked ? "true" : "false" }))
                    }
                    className="ml-2 size-4 accent-pine-800"
                  />
                )}
              </Label>
              {!isBool &&
                (f.textarea ? (
                  <Textarea
                    id={`set-${f.key}`}
                    value={val}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                    className="min-h-20"
                    invalid={Boolean(fieldsError[f.key])}
                  />
                ) : (
                  <Input
                    id={`set-${f.key}`}
                    value={val}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                    invalid={Boolean(fieldsError[f.key])}
                  />
                ))}
              {f.hint && <p className="mt-1 text-xs text-ink-400">{f.hint}</p>}
              {isBool && <p className="mt-1 text-xs text-ink-400">{f.hint}</p>}
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        disabled={busy}
        className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-pine-950 px-7 text-sm font-medium text-bone-50 hover:bg-pine-800 disabled:opacity-60"
      >
        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
        Guardar ajustes
      </button>
    </form>
  );
}