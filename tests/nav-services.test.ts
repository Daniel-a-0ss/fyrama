import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import {
  getNavItems,
  legalServiceAnchor,
  realEstateServiceAnchor,
} from "@/lib/services/nav";
import { slugify } from "@/lib/utils";

/**
 * El menú de la barra superior muestra servicios, y cada opción debe llevar a
 * una sección que exista de verdad en la página. Estas pruebas sembrando la
 * base de prueba y comprueban que el ancla del menú coincide con el id que la
 * página genera para ese servicio.
 */

const SERVICIOS_JURIDICOS = [
  { title: "Asesoría y consultoría", icon: "scale" },
  { title: "Representación judicial y extrajudicial", icon: "gavel" },
  { title: "Acciones de tutela", icon: "shield" },
  { title: "Estudio de títulos", icon: "filesearch" },
];

const SERVICIOS_INMOBILIARIOS = [
  { title: "Inmuebles en venta", icon: "home", href: "/viviendas?operacion=venta" },
  { title: "Trámites notariales y registrales", icon: "stamp", href: "" },
];

beforeAll(async () => {
  for (let i = 0; i < SERVICIOS_JURIDICOS.length; i++) {
    const s = SERVICIOS_JURIDICOS[i];
    await prisma.legalService.create({
      data: {
        title: s.title,
        slug: `test-legal-${i}`,
        description: "Descripción de prueba.",
        content: "",
        icon: s.icon,
        sortOrder: i,
        active: true,
      },
    });
  }

  for (let i = 0; i < SERVICIOS_INMOBILIARIOS.length; i++) {
    const s = SERVICIOS_INMOBILIARIOS[i];
    await prisma.realEstateService.create({
      data: {
        title: s.title,
        slug: `test-inmob-${i}`,
        description: "Descripción de prueba.",
        content: "",
        icon: s.icon,
        href: s.href,
        sortOrder: i,
        active: true,
      },
    });
  }
});

afterAll(async () => {
  await prisma.legalService.deleteMany({ where: { slug: { startsWith: "test-legal-" } } });
  await prisma.realEstateService.deleteMany({ where: { slug: { startsWith: "test-inmob-" } } });
  await prisma.$disconnect();
});

function groupOf(items: Awaited<ReturnType<typeof getNavItems>>, label: string) {
  return items.find((i) => i.label === label);
}

describe("menú de servicios", () => {
  it("lista los servicios jurídicos que existen en la base", async () => {
    const items = await getNavItems();
    const group = groupOf(items, "Servicios jurídicos");

    expect(group?.children).toBeDefined();
    const labels = group!.children!.map((c) => c.label);

    for (const s of SERVICIOS_JURIDICOS) {
      expect(labels).toContain(s.title);
    }
  });

  it("el ancla del menúJurídico es la misma que pinta la página", async () => {
    const items = await getNavItems();
    const children = groupOf(items, "Servicios jurídicos")!.children!;

    for (const s of SERVICIOS_JURIDICOS) {
      const child = children.find((c) => c.label === s.title);
      expect(child).toBeDefined();
      expect(child!.href).toBe(`/asesoria-juridica#${legalServiceAnchor(s.title)}`);
    }
  });

  it("el ancla del menú inmobiliario es la misma que pinta la página", async () => {
    const items = await getNavItems();
    const children = groupOf(items, "Servicios inmobiliarios")!.children!;

    for (const s of SERVICIOS_INMOBILIARIOS) {
      const child = children.find((c) => c.label === s.title);
      expect(child).toBeDefined();
      expect(child!.href).toBe(
        `/servicios-inmobiliarios#${realEstateServiceAnchor(s.title)}`
      );
    }
  });

  it("nunca muestra un servicio que esté oculto en la base", async () => {
    await prisma.legalService.create({
      data: {
        title: "Servicio oculto de prueba",
        slug: "test-legal-oculto",
        description: "",
        content: "",
        icon: "scale",
        sortOrder: 99,
        active: false,
      },
    });

    const items = await getNavItems();
    const labels = groupOf(items, "Servicios jurídicos")!.children!.map((c) => c.label);

    expect(labels).not.toContain("Servicio oculto de prueba");

    await prisma.legalService.delete({ where: { slug: "test-legal-oculto" } });
  });

  it("no repite opciones cuando hay títulos iguales", async () => {
    await prisma.realEstateService.create({
      data: {
        title: "Inmuebles en venta",
        slug: "test-inmob-duplicado",
        description: "Duplicado de prueba.",
        content: "",
        icon: "home",
        href: "",
        sortOrder: 50,
        active: true,
      },
    });

    const items = await getNavItems();
    const children = groupOf(items, "Servicios inmobiliarios")!.children!;
    const veces = children.filter((c) => c.label === "Inmuebles en venta").length;

    expect(veces).toBe(1);

    await prisma.realEstateService.delete({ where: { slug: "test-inmob-duplicado" } });
  });

  it("los anclas no chocan con los ids fijos de cada página", () => {
    // Ids que ya existen como secciones estáticas en las páginas.
    const idsFijos = new Set([
      "areas-del-derecho",
      "servicios",
      "solicitar",
      "quienes-somos",
      "mision",
      "vision",
      "por-que-elegirnos",
    ]);

    for (const s of [...SERVICIOS_JURIDICOS, ...SERVICIOS_INMOBILIARIOS]) {
      expect(idsFijos.has(legalServiceAnchor(s.title))).toBe(false);
      expect(idsFijos.has(realEstateServiceAnchor(s.title))).toBe(false);
      expect(slugify(s.title)).toBe(slugify(s.title));
    }
  });
});
