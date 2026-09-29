import { WHATSAPP_DEFAULT_MESSAGE, WHATSAPP_NUMBER } from "@/lib/constants";

export function buildWhatsAppUrl(message?: string): string {
  const text = (message ?? "").trim() || WHATSAPP_DEFAULT_MESSAGE;
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return `${base}?text=${encodeURIComponent(text)}`;
}