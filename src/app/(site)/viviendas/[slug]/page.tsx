import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Bath,
  BedDouble,
  Grid3X3,
  MapPin,
  Ruler,
  Tag,
} from "lucide-react";
import {
  getPropertyBySlug,
  getRelatedProperties,
  imageFor,
  type MediaImage,
} from "@/lib/services/property";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { MapEmbed } from "@/components/property/MapEmbed";
import { ContactForm } from "@/components/contact/ContactForm";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { OperationBadge } from "@/components/ui/Badge";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl, formatArea, formatCurrency, normalizeWhitespace } from "@/lib/utils";
import { OPERATION_LABEL, PROPERTY_TYPE_LABEL } from "@/lib/constants";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property)
    return buildMetadata({
      title: "Vivienda no encontrada",
      description: "El inmueble que buscas no existe o no está publicado.",
      path: "/viviendas",
    });
  const image = imageFor(property);
  const city = property.city;
  const desc = normalizeWhitespace(property.description || `${property.title} en ${city ?? "Colombia"}.`)
    .slice(0, 160);
  return buildMetadata({
    title: `${property.title} | ${OPERATION_LABEL[property.operation]} · ${PROPERTY_TYPE_LABEL[property.type]}`,
    description: desc,
    path: `/viviendas/${property.slug}`,
    ogImage: image?.url,
    type: "website",
  });
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const images: Array<MediaImage> = property.images.map((i) => ({
    url: i.mediaAsset.url,
    thumbUrl: i.mediaAsset.thumbUrl,
    cardUrl: i.mediaAsset.cardUrl,
    variants: safeVariants(i.mediaAsset.variants),
    alt: i.alt || i.mediaAsset.alt || altFor(property.title, i.mediaAsset.width, i.mediaAsset.height),
    width: i.mediaAsset.width,
    height: i.mediaAsset.height,
  }));

  const galleryItems = images.map((image, idx) => ({
    image,
    alt:
      image.alt ??
      `${property.title} — fotografía ${idx + 1}${property.city ? `, ${property.city}` : ""}`,
  }));

  const related = await getRelatedProperties(property, 3);
  const url = absoluteUrl(`/viviendas/${property.slug}`);

  const detailSpec = [
    { icon: MapPin, label: "Ubicación", value: [property.city, property.zone, property.neighborhood].filter(Boolean).join(", ") || "—" },
    { icon: Ruler, label: "Área", value: formatArea(property.area) },
    { icon: BedDouble, label: "Habitaciones", value: property.bedrooms ?? "—" },
    { icon: Bath, label: "Baños", value: property.bathrooms ?? "—" },
    { icon: Grid3X3, label: "Parqueaderos", value: property.parking ?? "—" },
    { icon: Tag, label: "Estrato", value: property.estrato ? `Estrato ${property.estrato}` : "—" },
  ];

  const realEstateSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": url,
    name: property.title,
    description: normalizeWhitespace(
      property.description || `${property.title} en ${property.city ?? "Colombia"}`
    ).slice(0, 500),
    url,
    image: images.map((i) => absoluteUrl(i.url)),
    datePosted: property.createdAt?.toISOString?.() ?? new Date().toISOString(),
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: property.currency,
      availability: "https://schema.org/InStock",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: property.city ?? undefined,
      addressRegion: property.zone ?? undefined,
      addressCountry: "CO",
    },
    ...(property.latitude && property.longitude
      ? {
          contentLocation: {
            "@type": "Place",
            geo: {
              "@type": "GeoCoordinates",
              latitude: property.latitude,
              longitude: property.longitude,
            },
          },
        }
      : {}),
    ...(property.area
      ? {
          floorSize: {
            "@type": "QuantitativeValue",
            value: property.area,
            unitCode: "MTK",
          },
        }
      : {}),
    numberOfRooms: property.bedrooms ?? undefined,
    numberOfBathroomsTotal: property.bathrooms ?? undefined,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <JsonLd data={realEstateSchema} />
      <Breadcrumbs
        items={[
          { label: "Viviendas", href: "/viviendas" },
          { label: property.title },
        ]}
      />

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <OperationBadge operation={property.operation} />
            <span className="text-sm text-ink-500">
              {PROPERTY_TYPE_LABEL[property.type] ?? property.type}
            </span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
            {property.title}
          </h1>
          <p className="mt-2 inline-flex items-center gap-1.5 text-ink-500">
            <MapPin className="size-4 text-pine-700" aria-hidden />
            {[property.zone, property.neighborhood, property.city].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm uppercase tracking-wide text-ink-400">
            {property.operation === "VENTA" ? "Precio de venta" : "Canon de arrendamiento"}
          </p>
          <p className="font-display text-3xl font-semibold text-pine-900">
            {formatCurrency(property.price, property.currency)}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <PropertyGallery items={galleryItems} />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
        <article className="min-w-0">
          {/* Características rápidas */}
          <section aria-labelledby="caracteristicas-title">
            <h2 id="caracteristicas-title" className="visually-hidden">
              Características principales
            </h2>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {detailSpec.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-3 rounded-xl border border-bone-200/80 bg-white px-4 py-3.5 shadow-sm"
                >
                  <s.icon className="size-5 shrink-0 text-pine-700" aria-hidden />
                  <div className="min-w-0">
                    <dt className="text-xs text-ink-500">{s.label}</dt>
                    <dd className="truncate text-sm font-semibold text-ink-900">
                      {String(s.value)}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </section>

          {/* Descripción */}
          <section aria-labelledby="desc-title" className="mt-10">
            <h2 id="desc-title" className="font-display text-2xl font-semibold text-ink-900">
              Descripción
            </h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-700">
              {property.description || "Esta vivienda no tiene descripción todavía."}
            </p>
          </section>

          {/* Características adicionales */}
          {property.features.length > 0 && (
            <section aria-labelledby="features-title" className="mt-10">
              <h2 id="features-title" className="font-display text-2xl font-semibold text-ink-900">
                Características
              </h2>
              <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {property.features.map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center gap-2 rounded-lg bg-bone-100 px-3 py-2 text-sm text-ink-700"
                  >
                    <span className="size-1.5 rounded-full bg-gold-500" aria-hidden />
                    {f.name}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Mapa */}
          {property.latitude && property.longitude && (
            <section aria-labelledby="mapa-title" className="mt-10">
              <h2 id="mapa-title" className="font-display text-2xl font-semibold text-ink-900">
                Ubicación
              </h2>
              <p className="mt-2 mb-4 text-sm text-ink-500">
                La ubicación se muestra de forma aproximada por privacidad.
              </p>
              <MapEmbed
                lat={property.latitude}
                lng={property.longitude}
                title={property.title}
              />
            </section>
          )}

          {/* Información adicional */}
          <section className="mt-10 rounded-2xl border border-bone-200/80 bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl font-semibold text-ink-900">
              Información adicional
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-600">
              <li>
                <span className="font-medium text-ink-800">Operación:</span>{" "}
                {OPERATION_LABEL[property.operation]}
              </li>
              <li>
                <span className="font-medium text-ink-800">Tipo de inmueble:</span>{" "}
                {PROPERTY_TYPE_LABEL[property.type]}
              </li>
              {property.builtArea ? (
                <li>
                  <span className="font-medium text-ink-800">Área construida:</span>{" "}
                  {formatArea(property.builtArea)}
                </li>
              ) : null}
            </ul>
          </section>
        </article>

        {/* Sidebar contacto */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-bone-200/80 bg-white p-6 shadow-fyrama">
            <div className="flex items-end justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-ink-400">
                  {property.operation === "VENTA" ? "Precio" : "Arrendamiento mensual"}
                </p>
                <p className="font-display text-2xl font-semibold text-pine-900">
                  {formatCurrency(property.price, property.currency)}
                </p>
              </div>
              <OperationBadge operation={property.operation} />
            </div>

            <hr className="my-5 border-bone-100" />

            <h2 className="font-display text-xl font-semibold text-ink-900">
              Quiero información
            </h2>
            <p className="mt-1.5 text-sm text-ink-500">
              Déjanos tus datos y te contactaremos con los detalles de esta vivienda.
            </p>
            <ContactForm
              className="mt-4"
              type="PROPERTY"
              propertyId={property.id}
              submitLabel="Enviar solicitud"
              title="¡Recibimos tu solicitud!"
              description="Te contactaremos pronto con la información de esta vivienda. (DEMO: la solicitud se almacena en el dashboard.)"
            />
          </div>
        </aside>
      </div>

      {/* Viviendas relacionadas */}
      {related.length > 0 && (
        <section aria-labelledby="relacionadas-title" className="mt-16">
          <h2
            id="relacionadas-title"
            className="mb-6 font-display text-2xl font-semibold text-ink-900"
          >
            Viviendas similares
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function safeVariants(json: string | null): Record<string, string> | null {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function altFor(title: string, width?: number | null, height?: number | null): string {
  return `${title}${width && height ? ` (${width}×${height})` : ""}`;
}