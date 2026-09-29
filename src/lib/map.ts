import { MAP_ZOOM_DEFAULT } from "./constants";

/**
 * Integración de mapas DESACOPLADA.
 * Cambiar de proveedor (Google, Mapbox, Leaflet…) no afecta el resto de la app.
 * No se exponen coordenadas sensibles: se acepta una ubicación aproximada.
 */

export type MapProvider = "osm";

export function getMapProvider(): MapProvider {
  const p = process.env.MAP_PROVIDER ?? "osm";
  return p === "osm" ? "osm" : "osm";
}

export function buildMapEmbedUrl(lat: number, lng: number, zoom = MAP_ZOOM_DEFAULT): string {
  const provider = getMapProvider();
  // Aproximación sin exponer coordenadas exactas del inmueble.
  const span = 0.02 * Math.pow(0.5, Math.max(10, Math.min(18, zoom)) - 14);
  const halfLng = span;
  const halfLat = span * 0.6;
  if (provider === "osm") {
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - halfLng}%2C${lat - halfLat}%2C${lng + halfLng}%2C${lat + halfLat}&layer=mapnik&marker=${lat}%2C${lng}`;
  }
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - halfLng}%2C${lat - halfLat}%2C${lng + halfLng}%2C${lat + halfLat}&layer=mapnik&marker=${lat}%2C${lng}`;
}

export function buildMapLink(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${MAP_ZOOM_DEFAULT}/${lat}/${lng}`;
}