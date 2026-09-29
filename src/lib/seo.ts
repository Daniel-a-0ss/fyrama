import type { Metadata } from "next";
import { absoluteUrl } from "./utils";

type PageMeta = {
  title: string;
  description: string;
  path?: string;
  noindex?: boolean;
  ogImage?: string;
  type?: "website" | "article";
  publishedTime?: string;
};

const DEFAULT_OG_IMAGE = "/media/brand/og-fyrama.webp";

export function buildMetadata({
  title,
  description,
  path = "/",
  noindex = false,
  ogImage = DEFAULT_OG_IMAGE,
  type = "website",
  publishedTime,
}: PageMeta): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: noindex ? undefined : url },
    robots: noindex
      ? { index: false, follow: true, nocache: true }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: "Fyrama",
      type,
      locale: "es_CO",
      images: [{ url: absoluteUrl(ogImage), width: 1200, height: 630, alt: title }],
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(ogImage)],
    },
  };
}

export function metaFromSettings(
  defaults: {
    title: string;
    description: string;
    path?: string;
    noindex?: boolean;
    ogImage?: string;
    type?: "website" | "article";
    publishedTime?: string;
  },
  settings: Partial<Record<string, string>> | null | undefined
) {
  const meta = defaults;
  const seoTitle = settings?.seo_title;
  const seoDesc = settings?.seo_description;
  const og = settings?.og_image;
  return buildMetadata({
    ...meta,
    title: seoTitle ? `${seoTitle} | ${meta.title}` : meta.title,
    description: seoDesc ?? meta.description,
    ogImage: og ?? meta.ogImage,
  });
}

export { absoluteUrl };