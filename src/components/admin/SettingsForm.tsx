"use client";

import { useRef, useState } from "react";
import { Loader2, RotateCcw, Save, Upload } from "lucide-react";
import { Label, Input, Textarea } from "@/components/ui/Field";
import { api, errorMessage, ApiError } from "@/lib/client/api";

const DEFAULT_HERO_IMAGE = "/media/brand/hero.webp";

const FIELDS: {
  key: string;
  label: string;
  hint?: string;
  textarea?: boolean;
  image?: boolean;
}[] = [
  {
    key: "hero_image",
    label: "Imagen del banner (hero)",
    hint: "JPG, PNG, WebP o AVIF. Se recomienda una foto horizontal de al menos 1600 px de ancho.",
    image: true,
  },
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
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadHero(file: File) {
    setError("");
    setFieldsError({});
    setSaved(false);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("kind", "GENERAL");
      const data = await api<{ url: string }>("/api/admin/media", {
        method: "POST",
        body: form,
      });
      setValues((v) => ({ ...v, hero_image: data.url }));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

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

      <div className="space-y-5">
        {FIELDS.map((f) => {
          const val = values[f.key] ?? "";
          return (
            <div key={f.key}>
              <Label htmlFor={`set-${f.key}`} className="flex">
                {f.label}
              </Label>
              {f.image ? (
                <div className="mt-2 space-y-3">
                  <div className="relative aspect-[16/7] overflow-hidden rounded-xl border border-bone-200 bg-bone-100">
                    <img
                      src={val || DEFAULT_HERO_IMAGE}
                      alt="Vista previa del banner"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <label
                      className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-pine-950 px-4 text-sm font-medium text-bone-50 transition-colors hover:bg-pine-800 ${
                        uploading || busy ? "pointer-events-none opacity-60" : ""
                      }`}
                    >
                      {uploading ? (
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                      ) : (
                        <Upload className="size-4" aria-hidden />
                      )}
                      {uploading ? "Subiendo…" : "Subir imagen"}
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        className="sr-only"
                        disabled={uploading || busy}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void uploadHero(file);
                        }}
                      />
                    </label>
                    {val && val !== DEFAULT_HERO_IMAGE && (
                      <button
                        type="button"
                        disabled={uploading || busy}
                        onClick={() => setValues((v) => ({ ...v, hero_image: DEFAULT_HERO_IMAGE }))}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-ink-900/12 px-4 text-sm font-medium text-ink-600 transition-colors hover:bg-bone-100 disabled:opacity-60"
                      >
                        <RotateCcw className="size-4" aria-hidden />
                        Restaurar
                      </button>
                    )}
                  </div>
                </div>
              ) : f.textarea ? (
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
              )}
              {f.hint && <p className="mt-1 text-xs text-ink-400">{f.hint}</p>}
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        disabled={busy || uploading}
        className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-pine-950 px-7 text-sm font-medium text-bone-50 hover:bg-pine-800 disabled:opacity-60"
      >
        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
        Guardar ajustes
      </button>
    </form>
  );
}
