import { describe, expect, it } from "vitest";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { WHATSAPP_DEFAULT_MESSAGE, WHATSAPP_NUMBER } from "@/lib/constants";

describe("buildWhatsAppUrl", () => {
  it("construye el enlace con el número central configurado", () => {
    const url = buildWhatsAppUrl("¿Tienen apartamentos en venta?");
    expect(url).toBe(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        "¿Tienen apartamentos en venta?"
      )}`
    );
  });

  it("usa el mensaje por defecto cuando no se escribe nada", () => {
    const url = buildWhatsAppUrl("");
    expect(url.startsWith(`https://wa.me/${WHATSAPP_NUMBER}?text=`)).toBe(true);
    expect(decodeURIComponent(url.split("text=")[1])).toBe(
      WHATSAPP_DEFAULT_MESSAGE
    );
  });

  it("codifica los caracteres especiales del mensaje", () => {
    const url = buildWhatsAppUrl("Hola & saludos % áéíóú");
    expect(url).toContain(encodeURIComponent("%"));
  });
});