import { COLOMBIA_CITIES, mergeCityOptions } from "@/lib/colombia";
import { stripAccents } from "@/lib/search";
import { describe, it, expect } from "vitest";
import {
  buildOrderBy,
  buildWhereClause,
  normalizeQuery,
  normalizeSearchParams,
  searchUrl,
} from "@/lib/search";

describe("normalizeSearchParams", () => {
  it("conserva solo parámetros conocidos y recorta vacíos", () => {
    const out = normalizeSearchParams({
      ciudad: "  Armenia ",
      operacion: "VENTA",
      page: "2",
      inyectado: "x",
      "": "",
    });
    expect(out).toEqual({ ciudad: "Armenia", operacion: "VENTA" });
  });

  it("soporta URLSearchParams y arrays", () => {
    const out = normalizeSearchParams(
      new URLSearchParams("ciudad=armenia&zona=norte&barrio=centro+1")
    );
    expect(out).toEqual({ ciudad: "armenia", zona: "norte", barrio: "centro 1" });

    expect(normalizeSearchParams({ zona: ["norte", "sur"] })).toEqual({ zona: "norte" });
  });

  it("devuelve vacío sin parámetros", () => {
    expect(normalizeSearchParams({})).toEqual({});
  });
});

describe("searchUrl", () => {
  it("construye URL con query", () => {
    expect(searchUrl("/viviendas", { ciudad: "armenia", operacion: "VENTA" })).toBe(
      "/viviendas?ciudad=armenia&operacion=VENTA"
    );
  });

  it("omite valores vacíos y base por defecto", () => {
    expect(searchUrl(undefined, { ciudad: "", zona: "norte" })).toBe("/viviendas?zona=norte");
    expect(searchUrl(undefined, {})).toBe("/viviendas");
  });
});

describe("normalizeQuery", () => {
  it("convierte parámetros numéricos", () => {
    const q = normalizeQuery({
      operacion: "VENTA",
      precio_min: "100000000",
      precio_max: "500000000",
      habitaciones: "3",
      caracteristicas: "Balcón, Terraza",
      ciudad: "armenia",
    });
    expect(q.operacion).toBe("VENTA");
    expect(q.precioMin).toBe(100_000_000);
    expect(q.precioMax).toBe(500_000_000);
    expect(q.habitaciones).toBe(3);
    expect(q.caracteristicas).toEqual(["Balcón", "Terraza"]);
    expect(q.ciudad).toBe("armenia");
  });

  it("ignora valores numéricos malformados sin romperse", () => {
    const q = normalizeQuery({
      precio_min: "abc",
      precio_max: "",
      habitaciones: "3x",
      zona: "norte",
    });
    expect(q.precioMin).toBeUndefined();
    expect(q.precioMax).toBeUndefined();
    expect(q.habitaciones).toBeUndefined();
    expect(q.zona).toBe("norte");
  });

  it("ignora operación/sort/tipo inválidos", () => {
    const q = normalizeQuery({
      operacion: "COMPRAR",
      tipo: "NAVE",
      sort: "bogus",
      page: "no-numero",
      zona: "centro",
    });
    expect(q.operacion).toBeUndefined();
    expect(q.tipo).toBeUndefined();
    expect(q.zona).toBe("centro");
  });
});

describe("buildWhereClause", () => {
  it("siempre filtra publicados y no eliminados", () => {
    const w = buildWhereClause({
      operacion: undefined,
      ciudad: undefined,
      zona: undefined,
      barrio: undefined,
      caracteristicas: [],
    });
    expect(w.status).toBe("PUBLISHED");
    expect(w.deletedAt).toBeNull();
    expect(w.city).toBeUndefined();
    expect(w.zone).toBeUndefined();
    expect(w.neighborhood).toBeUndefined();
  });

  it("mapea ciudad/zona/barrio a contains en la clave correcta", () => {
    const w = buildWhereClause({
      operacion: undefined,
      ciudad: "armenia",
      zona: "norte",
      barrio: "centro",
      caracteristicas: [],
    });
    expect(w.city).toEqual({ contains: "armenia" });
    expect(w.zone).toEqual({ contains: "norte" });
    expect(w.neighborhood).toEqual({ contains: "centro" });
  });

  it("une rangos de precio en un solo filtro", () => {
    const w = buildWhereClause({
      operacion: undefined,
      ciudad: undefined,
      zona: undefined,
      barrio: undefined,
      precioMin: 100,
      precioMax: 500,
      caracteristicas: [],
    });
    expect(w.price).toEqual({ gte: 100, lte: 500 });
  });

  it("aplica límites mínimos y estrato", () => {
    const w = buildWhereClause({
      operacion: undefined,
      ciudad: undefined,
      zona: undefined,
      barrio: undefined,
      habitaciones: 3,
      banos: 2,
      areaMin: 50,
      areaMax: 200,
      parqueaderos: 1,
      estrato: 4,
      caracteristicas: [],
    });
    expect(w.bedrooms).toEqual({ gte: 3 });
    expect(w.bathrooms).toEqual({ gte: 2 });
    expect(w.area).toEqual({ gte: 50, lte: 200 });
    expect(w.parking).toEqual({ gte: 1 });
    expect(w.estrato).toBe(4);
  });

  it("crea AND por cada característica", () => {
    const w = buildWhereClause({
      operacion: undefined,
      ciudad: undefined,
      zona: undefined,
      barrio: undefined,
      caracteristicas: ["Balcón", "Piscina"],
    });
    expect(w.AND).toEqual([
      { features: { some: { name: { contains: "Balcón" } } } },
      { features: { some: { name: { contains: "Piscina" } } } },
    ]);
  });

  it("mapea operación y tipo", () => {
    const w = buildWhereClause({
      operacion: "ARRIENDO",
      tipo: "CASA",
      ciudad: undefined,
      zona: undefined,
      barrio: undefined,
      caracteristicas: [],
    });
    expect(w.operation).toBe("ARRIENDO");
    expect(w.type).toBe("CASA");
  });
});

describe("buildOrderBy", () => {
  it("mapea cada orden", () => {
    expect(buildOrderBy("precio-asc")).toEqual([{ price: "asc" }]);
    expect(buildOrderBy("precio-desc")).toEqual([{ price: "desc" }]);
    expect(buildOrderBy("area-desc")).toEqual([{ area: "desc" }]);
    expect(buildOrderBy("recientes")).toEqual([{ updatedAt: "desc" }]);
    expect(buildOrderBy("relevancia")).toEqual([{ featured: "desc" }, { updatedAt: "desc" }]);
  });
});
describe("catálogo de ciudades de Colombia", () => {
  it("ofrece todas las ciudades del país, no solo las que tienen inmuebles", () => {
    expect(COLOMBIA_CITIES.length).toBeGreaterThan(1000);
    expect(COLOMBIA_CITIES).toContain("Bogota D.C.");
    expect(COLOMBIA_CITIES).toContain("Medellin");
    expect(COLOMBIA_CITIES).toContain("Leticia");
    expect(COLOMBIA_CITIES).toContain("Mitu");
  });

  it("no repite ciudades y viene ordenado", () => {
    expect(new Set(COLOMBIA_CITIES).size).toBe(COLOMBIA_CITIES.length);
    const orden = [...COLOMBIA_CITIES].sort((a, b) => a.localeCompare(b, "es"));
    expect(COLOMBIA_CITIES).toEqual(orden);
  });

  it("usa nombres sin tilde, como los que se guardan en los inmuebles", () => {
    const conTilde = COLOMBIA_CITIES.filter((c) => c !== stripAccents(c));
    expect(conTilde).toEqual([]);
  });

  it("une las ciudades con inventario sin duplicar", () => {
    const merged = mergeCityOptions(["Armenia", "Bogota D.C.", "Ciudad Inventada"]);
    expect(merged).toContain("Armenia");
    expect(merged).toContain("Ciudad Inventada");
    expect(merged).toContain("Medellin");
    expect(new Set(merged).size).toBe(merged.length);
    expect(merged.length).toBe(COLOMBIA_CITIES.length + 1);
  });
});

describe("operación: mayúsculas, minúsculas y permuta", () => {
  it("acepta la operación como llega del menú y del pie (minúsculas)", () => {
    expect(normalizeQuery({ operacion: "venta" }).operacion).toBe("VENTA");
    expect(normalizeQuery({ operacion: "arriendo" }).operacion).toBe("ARRIENDO");
    expect(normalizeQuery({ operacion: "Permuta" }).operacion).toBe("PERMUTA");
    expect(normalizeQuery({ operacion: "VENTA" }).operacion).toBe("VENTA");
  });

  it("mapea la operación canónica al where de Prisma", () => {
    expect(buildWhereClause(normalizeQuery({ operacion: "venta" })).operation).toBe("VENTA");
    expect(buildWhereClause(normalizeQuery({ operacion: "permuta" })).operation).toBe("PERMUTA");
  });

  it("sigue descartando operaciones que no existen", () => {
    expect(normalizeQuery({ operacion: "trueque" }).operacion).toBeUndefined();
    expect(normalizeQuery({ operacion: "COMPRAR" }).operacion).toBeUndefined();
  });
});
