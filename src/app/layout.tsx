import { Fraunces, Inter } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { absoluteUrl } from "@/lib/utils";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import { JsonLd } from "@/components/seo/JsonLd";
import "@/app/globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: `${SITE_NAME} | Inmueble y asesoría inmobiliaria`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "inmobiliaria",
    "inmueble",
    "comprar casa",
    "arrendar apartamento",
    "asesoría jurídica inmobiliaria",
    "Armenia Quindío",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    siteName: SITE_NAME,
    locale: "es_CO",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbfaf6",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/media/brand/og-fyrama.webp"),
    description: SITE_DESCRIPTION,
  };

  return (
    <html lang="es" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-screen">
        <JsonLd data={orgSchema} />
        {children}
      </body>
    </html>
  );
}