import { prisma } from "@/lib/prisma";

export async function getSiteSettings(): Promise<Record<string, string>> {
  const rows = await prisma.siteSetting.findMany();
  const out: Record<string, string> = {};
  for (const r of rows) out[r.key] = r.value;
  return out;
}

export const DEFAULT_SETTINGS: Record<string, string> = {
  contact_email: "fyramajuridicoeinmobiliario@gmail.com",
  contact_phone: "+57 311 8870533",
  contact_city: "Armenia, Quindío",
  legal_disclaimer:
    "El contenido de este sitio tiene fines informativos y no constituye ni reemplaza la asesoría jurídica profesional. Cada operación inmobiliaria es diferente: consulta siempre con un profesional calificado antes de firmar.",
  hero_image: "/media/brand/hero.webp",
  og_image: "/media/brand/og-fyrama.webp",
  demo_banner_enabled: "true",
  seo_title: "",
  seo_description: "",
};

export function mergeSettings(db: Record<string, string>): Record<string, string> {
  return { ...DEFAULT_SETTINGS, ...db };
}