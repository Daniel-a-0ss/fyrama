import { describe, it, expect } from "vitest";
import {
  articleCategorySchema,
  articleSchema,
  changePasswordSchema,
  contactSchema,
  legalServiceSchema,
  loginSchema,
  makeSlug,
  propertySchema,
  settingsSchema,
  userSchema,
} from "@/lib/validation/schemas";

describe("loginSchema", () => {
  it("acepta credenciales válidas", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.co", password: "1234567890" }).success
    ).toBe(true);
  });

  it("rechaza email inválido y password vacío", () => {
    expect(loginSchema.safeParse({ email: "nope", password: "x" }).success).toBe(false);
  });
});

describe("contactSchema", () => {
  const base = {
    name: "María",
    email: "maria@example.com",
    message: "Quiero un apartamento en Armenia",
  };

  it("acepta una solicitud mínima", () => {
    expect(contactSchema.safeParse(base).success).toBe(true);
  });

  it("normaliza valores opcionales", () => {
    const ok = contactSchema.safeParse({ ...base, phone: "", propertyId: "" });
    expect(ok.success).toBe(true);
    if (ok.success) {
      expect(ok.data.phone).toBe("");
      expect(ok.data.type).toBe("GENERAL");
    }
  });

  it("rechaza nombre corto y texto demasiado breve", () => {
    expect(contactSchema.safeParse({ ...base, name: "A" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...base, message: "corto" }).success).toBe(false);
  });

  it("rechaza el honeypot rellenado", () => {
    expect(contactSchema.safeParse({ ...base, company: "bot" }).success).toBe(false);
  });
});

describe("propertySchema", () => {
  const base = {
    title: "Apartamento en Armenia",
    operation: "VENTA",
    type: "APARTAMENTO",
    price: "250000000",
    area: "85",
    bedrooms: "3",
    bathrooms: "2",
    parking: "1",
    estrato: "4",
    features: ["Balcón", "Terraza"],
  };

  it("coerce números recibidos como cadena", () => {
    const ok = propertySchema.safeParse(base);
    expect(ok.success).toBe(true);
    if (ok.success) {
      expect(ok.data.price).toBe(250_000_000);
      expect(ok.data.area).toBe(85);
      expect(ok.data.bedrooms).toBe(3);
      expect(ok.data.estrato).toBe(4);
    }
  });

  it("rechaza operación/tipo fuera de los enums", () => {
    expect(propertySchema.safeParse({ ...base, operation: "VENTAR" }).success).toBe(false);
    expect(propertySchema.safeParse({ ...base, type: "NAVE" }).success).toBe(false);
  });

  it("permite dejar vacíos opcionales", () => {
    const ok = propertySchema.safeParse({ ...base, price: "", area: "", bedrooms: null });
    expect(ok.success).toBe(true);
    if (ok.success) {
      expect(ok.data.price).toBeNull();
      expect(ok.data.bedrooms).toBeNull();
    }
  });
});

describe("articleSchema y categorías", () => {
  it("acepta un artículo mínimo", () => {
    expect(
      articleSchema.safeParse({ title: "Cómo comprar tu primera vivienda" }).success
    ).toBe(true);
  });

  it("rechaza status inválido", () => {
    expect(
      articleSchema.safeParse({
        title: "x",
        status: "PUBLICADO",
      }).success
    ).toBe(false);
  });

  it("categoría: nombre mínimo 2", () => {
    expect(articleCategorySchema.safeParse({ name: "Guías" }).success).toBe(true);
    expect(articleCategorySchema.safeParse({ name: "G" }).success).toBe(false);
  });
});

describe("legalServiceSchema", () => {
  it("acepta valores por defecto", () => {
    const ok = legalServiceSchema.safeParse({ title: "Promesa de compraventa" });
    expect(ok.success).toBe(true);
    if (ok.success) {
      expect(ok.data.icon).toBe("scale");
      expect(ok.data.active).toBe(true);
    }
  });
});

describe("userSchema y política de contraseña", () => {
  const base = {
    name: "Pepe",
    email: "pepe@example.com",
    password: "ClaveSegura1",
  };

  it("acepta una contraseña que cumple la política", () => {
    expect(userSchema.safeParse(base).success).toBe(true);
  });

  it("aplica la política al changePasswordSchema", () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: "a",
        newPassword: "solominusculas",
      }).success
    ).toBe(false);
    expect(
      changePasswordSchema.safeParse({
        currentPassword: "a",
        newPassword: "MinuSculas2026",
      }).success
    ).toBe(true);
  });

  it("rechaza contraseñas débiles", () => {
    expect(userSchema.safeParse({ ...base, password: "abc123" }).success).toBe(false);
    expect(userSchema.safeParse({ ...base, password: "SINNUMEROS" }).success).toBe(false);
  });
});

describe("settingsSchema y makeSlug", () => {
  it("permite hasta 60 claves", () => {
    const many: Record<string, string> = {};
    for (let i = 0; i < 61; i++) many[`k${i}`] = "v";
    expect(settingsSchema.safeParse(many).success).toBe(false);
  });

  it("makeSlug produce slugs", () => {
    expect(makeSlug("Zona Norte Colombia")).toBe("zona-norte-colombia");
  });
});