import type { MetadataRoute } from "next";

export const runtime = "nodejs";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Los medios públicos (/media/...) SÍ son indexables (imágenes SEO).
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}