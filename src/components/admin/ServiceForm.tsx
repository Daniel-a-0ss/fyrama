"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, Loader2, Save } from "lucide-react";
import { Label, Input, Select, Textarea, FieldError } from "@/components/ui/Field";
import { api, errorMessage, ApiError } from "@/lib/client/api";
import { ArticleBody } from "@/components/article/ArticleBody";

const ICONS = ["scale", "file-text", "home", "key", "shield", "pen-line", "handshake", "book"];

export type ServiceInitial = {
  id?: string;
  title?: string;
  slug?: string;
  description?: string;
  content?: string;
  icon?: string;
  active?: boolean;
  sortOrder?: number;
};

export function ServiceForm({ initial }: { initial: ServiceInitial }) {
  const router = useRouter();
  const [values, setValues] = useState({
    title: initial.title ?? "",
    slug: initial.slug ?? "",
    description: initial.description ?? "",
    content: initial.content ?? "",
    icon: initial.icon ?? "scale",
    active: initial.active ?? true,
    sortOrder: String(initial.sortOrder ?? 0),
  });
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");
  const [fieldsError, setFieldsError] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug));

  const makeSlug = (v: string) =>
    v
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldsError({});
    setLoading(true);
    try {
      const payload = {
        ...values,
        slug: values.slug || undefined,
        active: values.active,
        sortOrder: Number(values.sortOrder) || 0,
      };
      const method = initial.id ? "PUT" : "POST";
      const url = initial.id ? `/api/admin/legal-services/${initial.id}` : "/api/admin/legal-services";
      await api(url, { method, body: JSON.stringify(payload) });
      router.push("/admin/asesoria");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && err.fields) setFieldsError(err.fields);
      setError(errorMessage(err));
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <section className="rounded-2xl border border-bone-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink-900">Servicio de asesoría</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="s-title">Título *</Label>
            <Input
              id="s-title"
              value={values.title}
              onChange={(e) => {
                const v = e.target.value;
                setValues((s) => ({ ...s, title: v, slug: slugTouched ? s.slug : s.slug || makeSlug(v) }));
              }}
              invalid={Boolean(fieldsError.title)}
            />
            <FieldError message={fieldsError.title?.[0]} />
          </div>
          <div>
            <Label htmlFor="s-slug">Slug (URL)</Label>
            <Input
              id="s-slug"
              value={values.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setValues((s) => ({ ...s, slug: e.target.value }));
              }}
            />
          </div>
          <div>
            <Label htmlFor="s-icon">Ícono</Label>
            <Select id="s-icon" value={values.icon} onChange={(e) => setValues((s) => ({ ...s, icon: e.target.value }))}>
              {ICONS.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="s-sortOrder">Orden</Label>
            <Input id="s-sortOrder" type="number" min={0} value={values.sortOrder} onChange={(e) => setValues((s) => ({ ...s, sortOrder: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="s-active" className="flex items-center gap-2">
              <input
                id="s-active"
                type="checkbox"
                checked={values.active}
                onChange={(e) => setValues((s) => ({ ...s, active: e.target.checked }))}
                className="size-4 accent-pine-800"
              />
              Visible en el sitio
            </Label>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="s-description">Descripción corta (tarjeta)</Label>
            <Textarea id="s-description" value={values.description} onChange={(e) => setValues((s) => ({ ...s, description: e.target.value }))} className="min-h-20" invalid={Boolean(fieldsError.description)} />
            <FieldError message={fieldsError.description?.[0]} />
          </div>
          <div className="sm:col-span-2">
            <div className="mb-2 flex items-center justify-between">
              <Label htmlFor="s-content" className="mb-0">Contenido (Markdown)</Label>
              <button
                type="button"
                onClick={() => setPreview((p) => !p)}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-ink-900/12 px-3 text-xs font-medium text-ink-700 hover:bg-bone-100"
              >
                <Eye className="size-3.5" aria-hidden />
                {preview ? "Escribir" : "Vista previa"}
              </button>
            </div>
            {preview ? (
              <div className="min-h-40 rounded-xl border border-bone-200 bg-bone-50/60 p-4">
                <ArticleBody content={values.content || "*(sin contenido)*"} />
              </div>
            ) : (
              <Textarea id="s-content" value={values.content} onChange={(e) => setValues((s) => ({ ...s, content: e.target.value }))} className="min-h-48 font-mono text-sm" />
            )}
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between gap-3">
        <Link href="/admin/asesoria" className="inline-flex h-11 items-center rounded-xl border border-ink-900/12 px-5 text-sm font-medium text-ink-700 hover:bg-white">
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-pine-950 px-7 text-sm font-medium text-bone-50 hover:bg-pine-800 disabled:opacity-60"
        >
          {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
          {initial.id ? "Guardar cambios" : "Crear servicio"}
        </button>
      </div>
    </form>
  );
}