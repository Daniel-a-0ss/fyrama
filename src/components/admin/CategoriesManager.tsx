"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Label, Input, FieldError } from "@/components/ui/Field";
import { api, errorMessage } from "@/lib/client/api";

type Category = { id: string; name: string; slug: string; _count?: { articles: number } };

export function CategoriesManager({ initial }: { initial: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initial);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);

  function openNew() {
    setEditing(null);
    setName("");
    setSlug("");
    setError("");
    setFieldErrors({});
    setOpen(true);
  }

  function openEdit(c: Category) {
    setEditing(c);
    setName(c.name);
    setSlug(c.slug);
    setError("");
    setFieldErrors({});
    setOpen(true);
  }

  async function save() {
    setBusy(true);
    setError("");
    setFieldErrors({});
    try {
      const url = editing ? `/api/admin/categories/${editing.id}` : "/api/admin/categories";
      await api(url, {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify({ name, slug }),
      });
      const reload = await api<{ items: Category[] }>("/api/admin/categories");
      setCategories(reload.items);
      setOpen(false);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove(c: Category) {
    if (!confirm(`¿Eliminar la categoría "${c.name}"?`)) return;
    try {
      await api(`/api/admin/categories/${c.id}`, { method: "DELETE" });
      setCategories((prev) => prev.filter((x) => x.id !== c.id));
    } catch (err) {
      alert(errorMessage(err));
    }
  }

  return (
    <section className="rounded-2xl border border-bone-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ink-900">Categorías del blog</h2>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-pine-950 px-3 text-sm font-medium text-bone-50 hover:bg-pine-800"
        >
          <Plus className="size-4" aria-hidden /> Nueva
        </button>
      </div>

      {categories.length === 0 ? (
        <p className="text-sm text-ink-500">Aún no hay categorías.</p>
      ) : (
        <ul className="divide-y divide-bone-100">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="font-medium text-ink-800">{c.name}</p>
                <p className="truncate text-xs text-ink-400">
                  /blog/categoria/{c.slug} · {c._count?.articles ?? 0} artículos
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(c)}
                  className="inline-flex size-8 items-center justify-center rounded-lg text-ink-500 hover:bg-bone-100"
                  aria-label={`Editar ${c.name}`}
                >
                  <Pencil className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => remove(c)}
                  className="inline-flex size-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                  aria-label={`Eliminar ${c.name}`}
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Editar categoría" : "Nueva categoría"}>
        <div className="space-y-4">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div>
            <Label htmlFor="cat-name">Nombre *</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!editing && !slug) {
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .trim()
                      .replace(/[^a-z0-9\s-]/g, "")
                      .replace(/[\s_-]+/g, "-")
                  );
                }
              }}
              invalid={Boolean(fieldErrors.name)}
            />
            <FieldError message={fieldErrors.name?.[0]} />
          </div>
          <div>
            <Label htmlFor="cat-slug">Slug (URL)</Label>
            <Input id="cat-slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
            <FieldError message={fieldErrors.slug?.[0]} />
          </div>
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-pine-950 text-sm font-medium text-bone-50 hover:bg-pine-800 disabled:opacity-60"
          >
            {busy ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </Modal>
    </section>
  );
}