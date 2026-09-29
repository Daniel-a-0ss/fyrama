import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fyrama — Vivienda y asesoría inmobiliaria",
    short_name: "Fyrama",
    description: "Plataforma inmobiliaria con acompañamiento jurídico profesional.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfaf6",
    theme_color: "#0b2019",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}