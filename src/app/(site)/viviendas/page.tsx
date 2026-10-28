import type { Metadata } from "next";
import { ViviendasListing } from "@/components/search/ViviendasListing";
import { buildMetadata } from "@/lib/seo";
import { normalizeSearchParams } from "@/lib/search";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = normalizeSearchParams(await searchParams);
  const op = sp.operacion?.toLowerCase();
  const opLabel =
    op === "venta"
      ? "en venta"
      : op === "arriendo"
        ? "en arrendamiento"
        : op === "permuta"
          ? "en permuta"
          : "";
  const ciudad = sp.ciudad;
  // Solo la operación (enlaces del menú) merece indexarse; el resto de filtros
  // genera variantes que no aportan valor SEO.
  const noindex = Object.keys(sp).some((k) => k !== "operacion");

  const title = ciudad
    ? `Inmuebles ${opLabel} en ${ciudad}`
    : `Inmuebles ${opLabel}`.trim().replace(/\s+/g, " ");
  return buildMetadata({
    title: title + " — Casas y apartamentos",
    description: `Conoce ${opLabel ? `inmuebles ${opLabel}` : "inmuebles disponibles"}${ciudad ? ` en ${ciudad}` : " en Colombia"}. Fyrama selecciona inmuebles con acompañamiento jurídico profesional.`,
    path: "/viviendas",
    noindex,
  });
}

export default async function ViviendasPage({ searchParams }: Props) {
  const sp = await searchParams;
  return <ViviendasListing searchParams={sp} />;
}