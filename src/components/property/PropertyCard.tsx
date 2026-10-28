import Link from "next/link";
import { Bath, BedDouble, Grid3X3, MapPin, SquareDashed } from "lucide-react";
import type { PropertyCardView } from "@/lib/services/property";
import { buildSrcSet, formatArea, formatCurrency } from "@/lib/utils";
import { OPERATION_LABEL, PROPERTY_TYPE_LABEL } from "@/lib/constants";
import { FavoriteButton } from "@/components/property/FavoriteButton";
import { OperationBadge } from "@/components/ui/Badge";

export function PropertyCard({ property }: { property: PropertyCardView }) {
  const cover = property.cover;
  const href = `/viviendas/${property.slug}`;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-bone-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-fyrama-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-bone-100">
        {cover ? (
          <img
            src={cover.cardUrl ?? cover.url}
            srcSet={buildSrcSet(cover.variants, [320, 480, 800, 1200])}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            alt={cover.alt ?? `${property.title} en ${property.city ?? "Colombia"}`}
            loading="lazy"
            decoding="async"
            width={cover.width ?? 800}
            height={cover.height ?? 600}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-pine-800 to-pine-950">
            <span className="font-display text-lg text-bone-50/60">Fyrama</span>
          </div>
        )}

        <div className="absolute inset-x-3 top-3 flex items-start justify-between">
          <OperationBadge operation={property.operation} />
          <FavoriteButton slug={property.slug} title={property.title} />
        </div>

        {property.featured && (
          <span className="absolute bottom-3 left-3 rounded-full bg-gold-500/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-pine-950">
            Destacada
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 text-xs text-ink-500">
          <span className="rounded-md bg-bone-100 px-2 py-0.5 font-medium text-ink-600">
            {PROPERTY_TYPE_LABEL[property.type] ?? property.type}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5 text-pine-700" aria-hidden />
            {property.city ?? "Colombia"}
            {property.zone ? ` · ${property.zone}` : ""}
          </span>
        </div>

        <h3 className="mt-2 truncate font-display text-lg font-semibold leading-snug text-ink-900">
          {property.title}
        </h3>

        <p className="mt-1 font-display text-xl font-semibold text-pine-900">
          {formatCurrency(property.price, property.currency)}
        </p>

        <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-bone-100 pt-3 text-sm text-ink-600">
          <li className="inline-flex items-center gap-1.5" title={`${property.bedrooms ?? 0} habitaciones`}>
            <BedDouble className="size-4" aria-hidden />
            {property.bedrooms ?? "—"}
          </li>
          <li className="inline-flex items-center gap-1.5" title={`${property.bathrooms ?? 0} baños`}>
            <Bath className="size-4" aria-hidden />
            {property.bathrooms ?? "—"}
          </li>
          <li className="inline-flex items-center gap-1.5" title={`${formatArea(property.area)} de área`}>
            <SquareDashed className="size-4" aria-hidden />
            {formatArea(property.area)}
          </li>
          {property.parking ? (
            <li className="inline-flex items-center gap-1.5" title={`${property.parking} parqueaderos`}>
              <Grid3X3 className="size-4" aria-hidden />
              {property.parking}
            </li>
          ) : null}
          <li className="ml-auto text-ink-400" aria-hidden>
            {OPERATION_LABEL[property.operation] ?? property.operation}
          </li>
        </ul>

        <div className="mt-4">
          <Link
            href={href}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-pine-900/15 text-sm font-medium text-pine-900 transition-colors hover:bg-pine-950 hover:text-bone-50 active:scale-[0.99] group-hover:bg-pine-950 group-hover:text-bone-50"
          >
            Ver detalles
          </Link>
        </div>
      </div>
    </article>
  );
}