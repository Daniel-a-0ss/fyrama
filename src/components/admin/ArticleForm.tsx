"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, Loader2, Save } from "lucide-react";
import { Label, Input, Select, Textarea, FieldError } from "@/components/ui/Field";
import { api, errorMessage, ApiError } from "@/lib/client/api";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { ArticleBody } from "@/components/article/ArticleBody";

export type ArticleInitial = {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverMediaId?: string;
  coverAlt?: string;
  categoryId?: string;
  author?: string;
  publishedAt?: string | null;
  status?: string;
  seoTitle?: string;
  metaDescription?: string;
  categories?: { id: string; name: string }[];
};

function toLocal(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocal(value: string): string | null {
  if (!value) return null;
  return new Date(value).toISOString();
}

export function ArticleForm({ initial }: { initial: ArticleInitial }) {
  const router = useRouter();
  const [values, setValues] = useState({
    title: initial.title ?? "",
    slug: initial.slug ?? "",
    excerpt: initial.excerpt ?? "",
    content: initial.content ?? "",
    coverMediaId: initial.coverMediaId ?? "",
    coverAlt: initial.coverAlt ?? "",
    categoryId: initial.categoryId ?? "",
    author: initial.author ?? "Fyrama",
    status: initial.status ?? "DRAFT",
    publishedAt: toLocal(initial.publishedAt ?? (initial.status === "PUBLISHED" ? new Date().toISOString() : "")),
    seoTitle: initial.seoTitle ?? "",
    metaDescription: initial.metaDescription ?? "",
  });
  const categories = initial.categories ?? [];
  const [error, setError] = useState("");
  const [fieldsError, setFieldsError] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug));

  useEffect(() => {
    if (slugTouched) return;
    const slug = values.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setValues((v) => ({ ...v, slug: v.slug || slug }));
  }, [values.title, slugTouched]);

  const set =
    (key: keyof typeof values) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldsError({});
    setLoading(true);
    try {
      const payload = {
        ...values,
        slug: values.slug || undefined,
        coverMediaId: values.coverMediaId || undefined,
        categoryId: values.categoryId || undefined,
        coverAlt: values.coverAlt || undefined,
        seoTitle: values.seoTitle || undefined,
        metaDescription: values.metaDescription || undefined,
        publishedAt: fromLocal(values.publishedAt),
      };
      const method = initial.id ? "PUT" : "POST";
      const url = initial.id ? `/api/admin/articles/${initial.id}` : "/api/admin/articles";
      await api(url, { method, body: JSON.stringify(payload) });
      router.push("/admin/contenido");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && err.fields) setFieldsError(err.fields);
      setError(errorMessage(err));
      setLoading(false);
    }
  }

  const grid = "grid grid-cols-1 gap-4 sm:grid-cols-2";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <section className="rounded-2xl border border-bone-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink-900">Datos del artículo</h2>
        <div className={grid}>
          <div className="sm:col-span-2">
            <Label htmlFor="a-title">Título *</Label>
            <Input id="a-title" value={values.title} onChange={set("title")} invalid={Boolean(fieldsError.title)} />
            <FieldError message={fieldsError.title?.[0]} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="a-slug">Slug (URL)</Label>
            <Input
              id="a-slug"
              value={values.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setValues((v) => ({ ...v, slug: e.target.value }));
              }}
            />
            <FieldError message={fieldsError.slug?.[0]} />
          </div>
          <div>
            <Label htmlFor="a-status">Estado *</Label>
            <Select id="a-status" value={values.status} onChange={set("status")}>
              <option value="DRAFT">Borrador</option>
              <option value="PUBLISHED">Publicado</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="a-category">Categoría</Label>
            <Select id="a-category" value={values.categoryId} onChange={set("categoryId")}>
              <option value="">Sin categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="a-author">Autor</Label>
            <Input id="a-author" value={values.author} onChange={set("author")} />
          </div>
          <div>
            <Label htmlFor="a-publishedAt">Fecha de publicación</Label>
            <Input id="a-publishedAt" type="datetime-local" value={values.publishedAt} onChange={set("publishedAt")} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-bone-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-900">Portada</h2>
          {values.coverMediaId && (
            <button
              type="button"
              onClick={() => setValues((v) => ({ ...v, coverMediaId: "" }))}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Quitar portada
            </button>
          )}
        </div>
        {values.coverMediaId ? (
          <p className="text-sm text-ink-500">Portada seleccionada ✓ (id: {values.coverMediaId}). Guarda para aplicarla.</p>
        ) : (
          <div>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="inline-flex h-10 items-center rounded-xl border border-ink-900/12 px-4 text-sm font-medium text-ink-700 hover:bg-bone-100"
            >
              Seleccionar imagen de la biblioteca
            </button>
            <div className="mt-3">
              <Label htmlFor="a-coverAlt">Texto alternativo (SEO)</Label>
              <Input id="a-coverAlt" value={values.coverAlt} onChange={set("coverAlt")} />
            </div>
          </div>
        )}
        <div className="mt-4">
          <Label htmlFor="a-excerpt">Extracto (se muestra en el listado)</Label>
          <Textarea id="a-excerpt" value={values.excerpt} onChange={set("excerpt")} className="min-h-20" invalid={Boolean(fieldsError.excerpt)} />
          <FieldError message={fieldsError.excerpt?.[0]} />
        </div>
      </section>

      <section className="rounded-2xl border border-bone-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-900">Contenido</h2>
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink-900/12 px-3 text-sm font-medium text-ink-700 hover:bg-bone-100"
          >
            <Eye className="size-4" aria-hidden />
            {preview ? "Escribir" : "Vista previa"}
          </button>
        </div>
        <p className="mb-2 text-xs text-ink-400">
          Formato Markdown (se renderiza de forma segura, sin HTML crudo). Para borradores puedes dejar la fecha vacía.
        </p>
        {preview ? (
          <div className="min-h-[28rem] rounded-xl border border-bone-200 bg-bone-50/60 p-4">
            <ArticleBody content={values.content || "*(sin contenido)*"} />
          </div>
        ) : (
          <Textarea
            id="a-content"
            value={values.content}
            onChange={set("content")}
            className="min-h-[28rem] font-mono text-sm"
            invalid={Boolean(fieldsError.content)}
          />
        )}
        <FieldError message={fieldsError.content?.[0]} />
      </section>

      <section className="rounded-2xl border border-bone-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink-900">SEO (opcional)</h2>
        <div className={grid}>
          <div>
            <Label htmlFor="a-seoTitle">Título SEO</Label>
            <Input id="a-seoTitle" value={values.seoTitle} onChange={set("seoTitle")} maxLength={120} />
          </div>
          <div>
            <Label htmlFor="a-metaDescription">Meta descripción</Label>
            <Input id="a-metaDescription" value={values.metaDescription} onChange={set("metaDescription")} maxLength={200} />
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between gap-3">
        <Link href="/admin/contenido" className="inline-flex h-11 items-center rounded-xl border border-ink-900/12 px-5 text-sm font-medium text-ink-700 hover:bg-white">
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-pine-950 px-7 text-sm font-medium text-bone-50 hover:bg-pine-800 disabled:opacity-60"
        >
          {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
          {initial.id ? "Guardar cambios" : "Crear artículo"}
        </button>
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(ids) => {
          if (ids[0]) setValues((v) => ({ ...v, coverMediaId: ids[0] }));
        }}
        single
        kindFilter="ARTICLE"
      />
    </form>
  );
}