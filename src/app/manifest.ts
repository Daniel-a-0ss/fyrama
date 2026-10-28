import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fyrama — Inmueble y asesoría inmobiliaria",
    short_name: "Fyrama",
    description: "Plataforma inmobiliaria con acompañamiento jurídico profesional.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfaf6",
    theme_color: "#0f2746",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}