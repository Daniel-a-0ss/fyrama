import { buildMapEmbedUrl, buildMapLink } from "@/lib/map";

/**
 * Mapa desacoplado: la URL de embed se genera desde lib/map.ts
 * y no se exponen coordenadas privadas (ubicación aproximada).
 */
export function MapEmbed({
  lat,
  lng,
  title,
}: {
  lat: number;
  lng: number;
  title: string;
}) {
  if (!lat || !lng) return null;
  const embedUrl = buildMapEmbedUrl(lat, lng);
  return (
    <div className="overflow-hidden rounded-2xl border border-bone-200 bg-bone-100">
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <p className="text-sm font-medium text-ink-700">Ubicación aproximada</p>
        <a
          href={buildMapLink(lat, lng)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-pine-800 hover:underline underline-offset-2"
        >
          Ver en mapa
        </a>
      </div>
      <iframe
        src={embedUrl}
        title={`Mapa de ${title}`}
        className="h-72 w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}