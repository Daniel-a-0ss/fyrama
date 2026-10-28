import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { ImageManager } from "@/components/admin/ImageManager";
import { StatusBadge } from "@/components/ui/Badge";

export default async function EditarViviendaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await prisma.property.findFirst({
    where: { id, deletedAt: null },
    include: {
      features: { orderBy: { name: "asc" } },
      images: { orderBy: { sortOrder: "asc" }, include: { mediaAsset: true } },
    },
  });
  if (!property) notFound();

  const initial = {
    title: property.title,
    slug: property.slug,
    description: property.description,
    operation: property.operation,
    type: property.type,
    status: property.status,
    featured: property.featured,
    price: property.price === null ? "" : String(property.price),
    currency: property.currency,
    city: property.city ?? "",
    zone: property.zone ?? "",
    neighborhood: property.neighborhood ?? "",
    address: property.address ?? "",
    latitude: property.latitude === null ? "" : String(property.latitude),
    longitude: property.longitude === null ? "" : String(property.longitude),
    area: property.area === null ? "" : String(property.area),
    builtArea: property.builtArea === null ? "" : String(property.builtArea),
    bedrooms: property.bedrooms === null ? "" : String(property.bedrooms),
    bathrooms: property.bathrooms === null ? "" : String(property.bathrooms),
    parking: property.parking === null ? "" : String(property.parking),
    estrato: property.estrato === null ? "" : String(property.estrato),
    features: property.features.map((f) => f.name).join(", "),
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/viviendas" className="text-sm font-medium text-pine-800 hover:underline">
            ← Volver a inmuebles
          </Link>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink-900">
            {property.title}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-ink-500">
            {property.slug} · <StatusBadge status={property.status} />
          </div>
        </div>
        <Link
          href={`/viviendas/${property.slug}`}
          className="inline-flex h-10 items-center rounded-xl border border-ink-900/12 px-4 text-sm font-medium text-ink-700 hover:bg-white"
        >
          Ver en el sitio ↗
        </Link>
      </div>

      {property.status === "PUBLISHED" && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-gold-300 bg-gold-100/40 px-4 py-3 text-sm text-ink-700">
          Este inmueble está publicado; los cambios se reflejan de inmediato en el sitio.
        </div>
      )}

      <div className="space-y-6">
        <PropertyForm initial={initial} isEdit />
        <ImageManager
          propertyId={property.id}
          initialImages={property.images.map((i) => ({
            id: i.id,
            alt: i.alt,
            isCover: i.isCover,
            sortOrder: i.sortOrder,
            mediaAsset: {
              id: i.mediaAsset.id,
              url: i.mediaAsset.url,
              thumbUrl: i.mediaAsset.thumbUrl,
              alt: i.mediaAsset.alt,
              originalName: i.mediaAsset.originalName,
            },
          }))}
        />
      </div>
    </div>
  );
}