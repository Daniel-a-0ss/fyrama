"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Save,
  Star,
} from "lucide-react";
import { Label, Input, Select, Textarea, FieldError } from "@/components/ui/Field";
import { api, errorMessage, ApiError } from "@/lib/client/api";
import {
  FEATURE_PRESETS,
  PROPERTY_OPERATIONS,
  PROPERTY_TYPES,
  STRATO_OPTIONS,
} from "@/lib/constants";

type FormValues = {
  title: string;
  slug?: string;
  description: string;
  operation: string;
  type: string;
  status: string;
  featured: boolean;
  price: string;
  currency: string;
  city: string;
  zone: string;
  neighborhood: string;
  address: string;
  latitude: string;
  longitude: string;
  area: string;
  builtArea: string;
  bedrooms: string;
  bathrooms: string;
  parking: string;
  estrato: string;
  features: string;
};

export type PropertyInitial = Partial<FormValues> & { id?: string };

const empty: FormValues = {
  title: "",
  description: "",
  operation: "VENTA",
  type: "APARTAMENTO",
  status: "DRAFT",
  featured: false,
  price: "",
  currency: "COP",
  city: "",
  zone: "",
  neighborhood: "",
  address: "",
  latitude: "",
  longitude: "",
  area: "",
  builtArea: "",
  bedrooms: "",
  bathrooms: "",
  parking: "",
  estrato: "",
  features: "",
};

export function PropertyForm({
  initial,
  isEdit = false,
}: {
  initial: PropertyInitial;
  isEdit?: boolean;
}) {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(() => ({
    ...empty,
    ...Object.fromEntries(
      Object.entries(initial).filter(([, v]) => v !== undefined && v !== null)
    ),
  }));
  const [featuresList, setFeaturesList] = useState<string[]>(
    String(initial.features ?? "")
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean)
  );
  const [fieldsError, setFieldsError] = useState<Record<string, string[]>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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

  const set = (key: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  function toggleFeature(name: string) {
    setFeaturesList((prev) =>
      prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name]
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldsError({});
    setLoading(true);
    try {
      const payload = {
        ...values,
        price: values.price || null,
        latitude: values.latitude || null,
        longitude: values.longitude || null,
        area: values.area || undefined,
        builtArea: values.builtArea || undefined,
        bedrooms: values.bedrooms || undefined,
        bathrooms: values.bathrooms || undefined,
        parking: values.parking || undefined,
        estrato: values.estrato || undefined,
        slug: values.slug || undefined,
        features: featuresList,
      };
      const method = isEdit && initial.id ? "PUT" : "POST";
      const url = isEdit && initial.id ? `/api/admin/properties/${initial.id}` : "/api/admin/properties";
      await api(url, { method, body: JSON.stringify(payload) });
      router.push("/admin/viviendas");
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
        <h2 className="mb-4 font-display text-lg font-semibold text-ink-900">Datos básicos</h2>
        <div className={grid}>
          <div className="sm:col-span-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={values.title}
              onChange={set("title")}
              placeholder="Apartamento luminoso en el centro"
              invalid={Boolean(fieldsError.title)}
            />
            <FieldError message={fieldsError.title?.[0]} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              value={values.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setValues((v) => ({ ...v, slug: e.target.value }));
              }}
              placeholder="apartamento-luminoso-centro"
            />
            <FieldError message={fieldsError.slug?.[0]} />
          </div>
          <div>
            <Label htmlFor="operation">Operación *</Label>
            <Select id="operation" value={values.operation} onChange={set("operation")} invalid={Boolean(fieldsError.operation)}>
              {PROPERTY_OPERATIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
            <FieldError message={fieldsError.operation?.[0]} />
          </div>
          <div>
            <Label htmlFor="type">Tipo de inmueble *</Label>
            <Select id="type" value={values.type} onChange={set("type")} invalid={Boolean(fieldsError.type)}>
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
            <FieldError message={fieldsError.type?.[0]} />
          </div>
          <div>
            <Label htmlFor="status">Estado *</Label>
            <Select id="status" value={values.status} onChange={set("status")} invalid={Boolean(fieldsError.status)}>
              <option value="DRAFT">Borrador</option>
              <option value="PUBLISHED">Publicado</option>
              <option value="HIDDEN">Oculto</option>
            </Select>
            <FieldError message={fieldsError.status?.[0]} />
          </div>
          <div>
            <Label htmlFor="price">
              Precio {values.operation === "VENTA" ? "de venta" : values.operation === "ARRIENDO" ? "de arrendamiento" : "de permuta"} (COP)
            </Label>
            <Input id="price" type="number" min={0} step={10000} value={values.price} onChange={set("price")} placeholder="450000000" invalid={Boolean(fieldsError.price)} />
            <FieldError message={fieldsError.price?.[0]} />
          </div>
          <div>
            <Label htmlFor="currency">Moneda</Label>
            <Input id="currency" value={values.currency} onChange={set("currency")} maxLength={8} />
          </div>
          <div>
            <Label htmlFor="featured" className="flex items-center gap-2">
              <input
                id="featured"
                type="checkbox"
                checked={values.featured}
                onChange={(e) => setValues((v) => ({ ...v, featured: e.target.checked }))}
                className="size-4 accent-pine-800"
              />
              Destacada
            </Label>
            <p className="text-xs text-ink-400">Aparece en la portada del sitio.</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-bone-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink-900">Descripción</h2>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={values.description}
          onChange={set("description")}
          className="min-h-40"
          placeholder="Cuenta los detalles del inmueble: luz, distribución, sector, usos…"
          invalid={Boolean(fieldsError.description)}
        />
        <FieldError message={fieldsError.description?.[0]} />
      </section>

      <section className="rounded-2xl border border-bone-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink-900">Ubicación</h2>
        <div className={grid}>
          <div>
            <Label htmlFor="city">Ciudad</Label>
            <Input id="city" value={values.city} onChange={set("city")} placeholder="Armenia" invalid={Boolean(fieldsError.city)} />
            <FieldError message={fieldsError.city?.[0]} />
          </div>
          <div>
            <Label htmlFor="zone">Zona</Label>
            <Input id="zone" value={values.zone} onChange={set("zone")} placeholder="Norte" />
          </div>
          <div>
            <Label htmlFor="neighborhood">Barrio</Label>
            <Input id="neighborhood" value={values.neighborhood} onChange={set("neighborhood")} />
          </div>
          <div>
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" value={values.address} onChange={set("address")} />
          </div>
          <div>
            <Label htmlFor="latitude">Latitud</Label>
            <Input id="latitude" type="number" step="0.000001" min={-90} max={90} value={values.latitude} onChange={set("latitude")} />
          </div>
          <div>
            <Label htmlFor="longitude">Longitud</Label>
            <Input id="longitude" type="number" step="0.000001" min={-180} max={180} value={values.longitude} onChange={set("longitude")} />
            <p className="mt-1 text-xs text-ink-400">Se muestra aproximada por privacidad.</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-bone-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink-900">Características</h2>
        <div className={grid}>
          <div>
            <Label htmlFor="area">Área total (m²)</Label>
            <Input id="area" type="number" min={0} value={values.area} onChange={set("area")} />
          </div>
          <div>
            <Label htmlFor="builtArea">Área construida (m²)</Label>
            <Input id="builtArea" type="number" min={0} value={values.builtArea} onChange={set("builtArea")} />
          </div>
          <div>
            <Label htmlFor="bedrooms">Habitaciones</Label>
            <Input id="bedrooms" type="number" min={0} max={50} value={values.bedrooms} onChange={set("bedrooms")} />
          </div>
          <div>
            <Label htmlFor="bathrooms">Baños</Label>
            <Input id="bathrooms" type="number" min={0} max={50} value={values.bathrooms} onChange={set("bathrooms")} />
          </div>
          <div>
            <Label htmlFor="parking">Parqueaderos</Label>
            <Input id="parking" type="number" min={0} max={50} value={values.parking} onChange={set("parking")} />
          </div>
          <div>
            <Label htmlFor="estrato">Estrato</Label>
            <Select id="estrato" value={values.estrato} onChange={set("estrato")}>
              <option value="">Sin estrato</option>
              {STRATO_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="mt-5">
          <Label>Características adicionales</Label>
          <div className="flex flex-wrap gap-2">
            {FEATURE_PRESETS.map((f) => {
              const active = featuresList.includes(f);
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleFeature(f)}
                  aria-pressed={active}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "border-pine-900 bg-pine-950 text-bone-50"
                      : "border-ink-900/12 bg-white text-ink-700 hover:border-pine-700"
                  }`}
                >
                  {active && <Star className="mr-1 inline size-3.5 text-gold-400" aria-hidden />}
                  {f}
                </button>
              );
            })}
          </div>
          <div className="mt-3">
            <Label htmlFor="features">O personaliza tu lista (separada por comas)</Label>
            <Input
              id="features"
              value={featuresList.join(", ")}
              onChange={(e) =>
                setFeaturesList(
                  e.target.value
                    .split(",")
                    .map((f) => f.trim())
                    .filter(Boolean)
                )
              }
              placeholder="Terraza privada, Zona BBQ"
            />
            <FieldError message={fieldsError.features?.[0]} />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/viviendas"
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-ink-900/12 px-5 text-sm font-medium text-ink-700 hover:bg-white"
        >
          <ArrowLeft className="size-4" aria-hidden /> Cancelar
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-pine-950 px-7 text-sm font-medium text-bone-50 transition-colors hover:bg-pine-800 disabled:opacity-60"
        >
          {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
          {isEdit ? "Guardar cambios" : "Crear inmueble"}
        </button>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-ink-400">
        <CheckCircle2 className="size-3.5" aria-hidden />
        Los cambios se auditan y quedan registrados en el panel de auditoría.
      </p>
    </form>
  );
}