import type { Metadata } from "next";
import { ViviendasListing } from "@/components/search/ViviendasListing";
import { buildMetadata } from "@/lib/seo";
import { normalizeSearchParams } from "@/lib/search";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = normalizeSearchParams(await searchParams);
  const op = sp.operacion?.toLowerCase();
  const opLabel = op === "venta" ? "en venta" : op === "arriendo" ? "en arrendamiento" : "";
  const ciudad = sp.ciudad;
  const hayFiltros = Object.keys(sp).length > 0;

  const title = ciudad
    ? `Viviendas ${opLabel} en ${ciudad}`
    : `Viviendas ${opLabel}`.trim().replace(/\s+/g, " ");
  return buildMetadata({
    title: title + " — Casas y apartamentos",
    description: `Conoce casas y apartamentos ${opLabel || "en venta y arrendamiento"}${ciudad ? ` en ${ciudad}` : " en Colombia"}. Fyrama selecciona viviendas con acompañamiento jurídico profesional.`,
    path: "/viviendas",
    noindex: hayFiltros,
  });
}

export default async function ViviendasPage({ searchParams }: Props) {
  const sp = await searchParams;
  return <ViviendasListing searchParams={sp} />;
}