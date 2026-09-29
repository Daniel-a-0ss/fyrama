import { describe, it, expect } from "vitest";
import {
  absoluteUrl,
  buildSrcSet,
  clamp,
  formatArea,
  formatCurrency,
  getClientIp,
  normalizeWhitespace,
  pluralize,
  safeSlugSegment,
  slugify,
} from "@/lib/utils";

describe("slugify", () => {
  it("normaliza acentos y caracteres especiales", () => {
    expect(slugify("Casa Campestre Águilas")).toBe("casa-campestre-aguilas");
    expect(slugify("  Apartamento & 101  ")).toBe("apartamento-101");
  });

  it("colapsa separadores y limpia extremos", () => {
    expect(slugify("A   B---C___D")).toBe("a-b-c-d");
    expect(slugify("---bien---")).toBe("bien");
  });

  it("devuelve cadena vacía si no queda nada", () => {
    expect(slugify("¿?")).toBe("");
  });
});

describe("safeSlugSegment", () => {
  it("devuelve 'item' cuando el slug queda vacío", () => {
    expect(safeSlugSegment("???")).toBe("item");
    expect(safeSlugSegment("Hogar de 2")).toBe("hogar-de-2");
  });
});

describe("formatCurrency", () => {
  it("formatea en COP sin decimales", () => {
    expect(formatCurrency(250_000_000)).toBe("$\u00a0250.000.000");
  });

  it("devuelve — para nulos", () => {
    expect(formatCurrency(null)).toBe("—");
    expect(formatCurrency(undefined)).toBe("—");
  });
});

describe("formatArea", () => {
  it("formatea m²", () => {
    expect(formatArea(128)).toBe("128 m²");
  });

  it("devuelve — para nulos", () => {
    expect(formatArea(null)).toBe("—");
  });
});

describe("pluralize", () => {
  it("usa singular para 1 y plural para el resto", () => {
    expect(pluralize(1, "baño")).toBe("1 baño");
    expect(pluralize(3, "baño")).toBe("3 baños");
    expect(pluralize(null, "baño")).toBe("0 baños");
  });
});

describe("absoluteUrl", () => {
  it("une la base con la ruta sin duplicar barras", () => {
    expect(absoluteUrl("/viviendas/casa1")).toBe(
      "http://localhost:3000/viviendas/casa1"
    );
    expect(absoluteUrl()).toBe("http://localhost:3000");
  });
});

describe("getClientIp", () => {
  const h = (obj: Record<string, string>) => new Headers(obj);

  it("toma el primer valor de x-forwarded-for", () => {
    expect(getClientIp(h({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" }))).toBe("1.2.3.4");
  });

  it("usa x-real-ip como respaldo", () => {
    expect(getClientIp(h({ "x-real-ip": "9.9.9.9" }))).toBe("9.9.9.9");
  });

  it("devuelve null si no hay cabecera", () => {
    expect(getClientIp(new Headers())).toBeNull();
  });
});

describe("buildSrcSet", () => {
  it("construye srcset con los anchos disponibles", () => {
    const variants = { 320: "/m/320.jpg", 480: "/m/480.jpg", 1200: "/m/1200.jpg" };
    expect(buildSrcSet(variants)).toBe("/m/320.jpg 320w, /m/480.jpg 480w, /m/1200.jpg 1200w");
  });

  it("devuelve vacío sin variantes", () => {
    expect(buildSrcSet(null)).toBe("");
  });
});

describe("normalizeWhitespace y clamp", () => {
  it("colapsa espacios", () => {
    expect(normalizeWhitespace("hola    mundo")).toBe("hola mundo");
  });

  it("limita rango", () => {
    expect(clamp(150, 0, 100)).toBe(100);
    expect(clamp(-5, 0, 100)).toBe(0);
    expect(clamp(50, 0, 100)).toBe(50);
  });
});