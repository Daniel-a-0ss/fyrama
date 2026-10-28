/**
 * Fyrama — Semilla de datos de demostración.
 *
 * Genera:
 *  - Usuarios admin/editor (contraseña con hash bcrypt; nunca texto plano).
 *  - Inmuebles de prueba claramente marcadas como DEMO con fotografías locales.
 *    Las fotos se descargan de Unsplash (licencia de uso gratuito) y se guardan
 *    en public/media/. Si la descarga falla, se genera un placeholder premium SVG.
 *  - Contenido: blog, categorías, servicios jurídicos, páginas de ciudad (SEO local).
 *  - Configuración del sitio, variables e imágenes de marca (hero, og).
 */

import { PrismaClient, Role, Operation, PropertyType, PropertyStatus, ArticleStatus, MediaKind } from "@prisma/client";
import { createHash, randomBytes } from "crypto";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import sharp from "sharp";

const prisma = new PrismaClient();
const PUBLIC_MEDIA = join(process.cwd(), "public", "media");
const DEMO = "Inmueble de demostración para desarrollo. ";

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@fyrama.co";
const ADMIN_NAME = process.env.SEED_ADMIN_NAME || "Administrador Fyrama";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Fyrama!2026";
const EDITOR_EMAIL = process.env.SEED_EDITOR_EMAIL || "editor@fyrama.co";
const EDITOR_PASSWORD = process.env.SEED_EDITOR_PASSWORD || "Fyrama!2026";

function assertSeedPassword(envName, value, defaultDemo) {
  if (!value || value.length < 12) {
    console.error(
      `[seed] EN PRODUCCIÓN es obligatorio definir ${envName} (mínimo 12 caracteres). Abortando.`
    );
    process.exit(1);
  }
  if (value === defaultDemo) {
    console.error(
      `[seed] EN PRODUCCIÓN NO se permite la contraseña por defecto de demo (${defaultDemo}). Abortando.`
    );
    process.exit(1);
  }
}

if (process.env.NODE_ENV === "production") {
  assertSeedPassword("SEED_ADMIN_PASSWORD", process.env.SEED_ADMIN_PASSWORD, "Fyrama!2026");
  assertSeedPassword("SEED_EDITOR_PASSWORD", process.env.SEED_EDITOR_PASSWORD, "Fyrama!2026");
}

function sha(text) {
  return createHash("sha256").update(text).digest("hex");
}

async function downloadToWebp(url, destPath, { width = 1600, quality = 80 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(url, { signal: ctrl.signal, redirect: "follow" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const image = sharp(buf, { failOn: "error" });
    const meta = await image.metadata();
    if (!meta.width || !meta.height) throw new Error("no dimensions");
    if (meta.width > 8000 || meta.height > 8000) throw new Error("too large");
    await image
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality, effort: 4 })
      .toFile(destPath);
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}

function placeholderSvg({
  label,
  width = 1200,
  height = 900,
  from = "#0b2019",
  to = "#173b2e",
}) {
  const [fr, tr] = [from.slice(1), to.slice(1)];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#${fr}"/>
      <stop offset="1" stop-color="#${tr}"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <g fill="none" stroke="#cfa25a" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" opacity="0.9">
    <path d="M ${width*0.5 - 90} ${height*0.52} L ${width*0.5} ${height*0.52 - 70} L ${width*0.5 + 90} ${height*0.52}"/>
  </g>
  <line x1="${width*0.5}" y1="${height*0.52 - 70}" x2="${width*0.5}" y2="${height*0.55}" stroke="#f4f0e7" stroke-width="10" stroke-linecap="round"/>
  <text x="${width*0.5}" y="${height*0.72}" text-anchor="middle" font-family="Georgia, serif" font-size="${Math.round(width*0.07)}" fill="#f4f0e7" opacity="0.9">Fyrama</text>
  <text x="${width*0.5}" y="${height*0.72 + Math.round(width*0.045)}" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="${Math.round(width*0.028)}" fill="#eacf9d" opacity="0.85">${label}</text>
</svg>`;
}

async function ensureImage(url, relPath, { label, width = 1600, quality = 80 }) {
  const dest = join(PUBLIC_MEDIA, ...relPath.split("/"));
  mkdirSync(join(PUBLIC_MEDIA, relPath.split("/").slice(0, -1).join("/")), { recursive: true });
  if (existsSync(dest)) return "/media/" + relPath;
  const ok = url
    ? await downloadToWebp(url, dest, { width, quality })
    : false;
  if (!ok) {
    const svg = Buffer.from(placeholderSvg({ label, width, height: Math.round(width * 0.75) }));
    await sharp(svg).resize(width, Math.round(width * 0.75)).webp({ quality: 82 }).toFile(dest);
  }
  return "/media/" + relPath;
}

// Fotos Unsplash con licencia de uso gratuito (arquitectura / inmueble).
const PHOTOS = {
  hero: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80",
  casa1: [
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=80",
  ],
  casa2: [
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=80",
  ],
  casa3: [
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1400&q=80",
  ],
  apt1: [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=80",
  ],
  apt2: [
    "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1400&q=80",
  ],
  apt3: [
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?auto=format&fit=crop&w=1400&q=80",
  ],
  ofi1: [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80",
  ],
  lote1: [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80",
  ],
  blog: {
    compra: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
    arriendo: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1200&q=80",
    legal: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
    inversion: "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80",
    consejos: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=1200&q=80",
  },
};

async function upsertSettings() {
  const settings = {
    contact_email: "fyramajuridicoeinmobiliario@gmail.com",
    contact_phone: "+57 321 7241455",
    contact_city: "Armenia, Quindío — Colombia",
    legal_disclaimer:
      "El contenido de este sitio tiene fines informativos y no constituye ni reemplaza la asesoría jurídica profesional. Cada operación inmobiliaria es distinta: consulta siempre con un profesional calificado antes de firmar cualquier documento.",
    hero_image: "/media/brand/hero.webp",
    og_image: "/media/brand/og-fyrama.webp",
    demo_banner_enabled: "true",
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
}

const FEATURES_FOR = {
  casa1: ["Jardín", "Parqueadero", "Terraza", "Chimenea", "Vigilancia", "Zona de lavandería"],
  casa2: ["Piscina", "Parqueadero", "Jardín", "BBQ", "Vigilancia", "Energía solar"],
  casa3: ["Balcón", "Parqueadero", "Chimenea", "Estudio", "Walk-in closet", "Sala de estar amplia"],
  apt1: ["Balcón", "Ascensor", "Zona social", "Vigilancia", "Área de mascotas", "Parqueadero"],
  apt2: ["Ascensor", "Zona social", "Vigilancia", "Salón comunal", "BBQ", "Smart home"],
  apt3: ["Balcón", "Ascensor", "Parqueadero", "Zona de lavandería", "Área de mascotas"],
  ofi1: ["Ascensor", "Vigilancia", "Recepción", "Zona húmeda", "Parqueadero visitante", "Fibra óptica"],
  lote1: ["Servicios cercanos", "Zona verde", "Vía de acceso pavimentada"],
};

const PROPERTIES = [
  {
    key: "casa1",
    op: Operation.VENTA,
    type: PropertyType.CASA,
    title: "Casa familiar en el barrio Uribe",
    price: 850000000,
    city: "Armenia",
    zone: "Centro",
    neighborhood: "Uribe",
    area: 165,
    builtArea: 210,
    bedrooms: 4,
    bathrooms: 3,
    parking: 2,
    estrato: 4,
    lat: 4.529,
    lng: -75.681,
    featured: true,
    desc:
      DEMO +
      "Casa de dos plantas con patio interior, sala y comedor independientes, cocina integral y zona de estudio. Ubicada a pocas cuadras del parque de la vida, en un sector consolidado y tranquilo de Armenia, Quindío.",
  },
  {
    key: "casa2",
    op: Operation.VENTA,
    type: PropertyType.CASA,
    title: "Casa campestre con piscina en El Campestre",
    price: 1250000000,
    city: "Armenia",
    zone: "Sur",
    neighborhood: "El Campestre",
    area: 320,
    builtArea: 280,
    bedrooms: 5,
    bathrooms: 4,
    parking: 3,
    estrato: 5,
    lat: 4.499,
    lng: -75.701,
    featured: true,
    desc:
      DEMO +
      "Casa campestre de estilo moderno con piscina, zona de BBQ y amplio jardín. Áreas verdes, cerca al aeropuerto y a los principales atractivos del Quindío.",
  },
  {
    key: "casa3",
    op: Operation.ARRIENDO,
    type: PropertyType.CASA,
    title: "Casa acogedora en Los Almendros",
    price: 2800000,
    city: "Armenia",
    zone: "Norte",
    neighborhood: "Los Almendros",
    area: 140,
    builtArea: 170,
    bedrooms: 3,
    bathrooms: 2,
    parking: 1,
    estrato: 3,
    lat: 4.551,
    lng: -75.672,
    featured: true,
    desc:
      DEMO +
      "Casa en arriendo con sala comedor, cocina independiente y cuarto de estudio. Ideal para familias pequeñas, cerca de vías principales y centros comerciales.",
  },
  {
    key: "apt1",
    op: Operation.VENTA,
    type: PropertyType.APARTAMENTO,
    title: "Apartamento moderno en la zona fundadores",
    price: 420000000,
    city: "Armenia",
    zone: "Norte",
    neighborhood: "Fundadores",
    area: 86,
    builtArea: 98,
    bedrooms: 3,
    bathrooms: 2,
    parking: 1,
    estrato: 4,
    lat: 4.541,
    lng: -75.665,
    featured: false,
    desc:
      DEMO +
      "Apartamento en conjunto cerrado con piscina, salón social y gimnasio. Balcón terraza con vista a la ciudad, cerca a la avenida Bolívar y universidades.",
  },
  {
    key: "apt2",
    op: Operation.ARRIENDO,
    type: PropertyType.APARTAMENTO,
    title: "Apartamento amoblado en el centro",
    price: 1850000,
    city: "Armenia",
    zone: "Centro",
    neighborhood: "Centro histórico",
    area: 65,
    builtArea: 72,
    bedrooms: 2,
    bathrooms: 1,
    parking: 0,
    estrato: 3,
    lat: 4.529,
    lng: -75.691,
    featured: false,
    desc:
      DEMO +
      "Apartamento amoblado listo para habitar, cerca de comercio, bancos y transporte público. Ideal para profesionales.",
  },
  {
    key: "apt3",
    op: Operation.VENTA,
    type: PropertyType.APARTAMENTO,
    title: "Apartamento de interés colectivo en La Patria",
    price: 380000000,
    city: "Armenia",
    zone: "Occidente",
    neighborhood: "La Patria",
    area: 92,
    builtArea: 105,
    bedrooms: 3,
    bathrooms: 2,
    parking: 1,
    estrato: 3,
    lat: 4.522,
    lng: -75.705,
    featured: false,
    desc:
      DEMO +
      "Apartamento con excelente iluminación, cocina integral recién renovada y zona de lavandería. Conjunto con zona de juegos y parqueadero de visitantes.",
  },
  {
    key: "ofi1",
    op: Operation.ARRIENDO,
    type: PropertyType.OFICINA,
    title: "Oficina ejecutiva en el centro empresarial",
    price: 2200000,
    city: "Armenia",
    zone: "Centro",
    neighborhood: "Centro empresarial",
    area: 48,
    builtArea: 54,
    bedrooms: 0,
    bathrooms: 1,
    parking: 1,
    estrato: 5,
    lat: 4.532,
    lng: -75.678,
    featured: false,
    desc:
      DEMO +
      "Oficina en torre empresarial con recepción, sala de juntas compartida y parqueadero. Terminados en muro cortina y fibra óptica.",
  },
  {
    key: "lote1",
    op: Operation.VENTA,
    type: PropertyType.LOTE,
    title: "Lote en zona de expansión del Quindío",
    price: 150000000,
    city: "Armenia",
    zone: "Vía al aeropuerto",
    neighborhood: "Sector el Edén",
    area: 600,
    builtArea: 0,
    bedrooms: 0,
    bathrooms: 0,
    parking: 0,
    estrato: 2,
    lat: 4.489,
    lng: -75.712,
    featured: false,
    desc:
      DEMO +
      "Terreno plano con servicios cercanos, apto para inmueble campestre o proyecto pequeño. Excelente potencial de valorización en la zona.",
  },
];

const SERVICES = [
  { icon: "scale", title: "Asesoría y consultoría", description: "Orientación jurídica especializada para resolver tus consultas legales y tomar decisiones informadas en tus operaciones." },
  { icon: "gavel", title: "Representación judicial y extrajudicial", description: "Acompañamiento y representación en procesos judiciales y gestiones extrajudiciales ante autoridades y particulares." },
  { icon: "handshake", title: "Negociación y conciliación jurídica", description: "Facilitamos acuerdos y conciliaciones para resolver conflictos de forma ágil y sin llegar a instancias judiciales." },
  { icon: "shield", title: "Acciones de tutela", description: "Elaboración y acompañamiento en acciones de tutela para la protección oportuna de tus derechos fundamentales." },
  { icon: "filetext", title: "Derechos de petición", description: "Redacción y seguimiento de derechos de petición ante entidades públicas y privadas." },
  { icon: "landmark", title: "Estudio de títulos", description: "Revisión del certificado de tradición y libertad y análisis jurídico de la titularidad de un inmueble." },
  { icon: "coins", title: "Cobro de cartera", description: "Gestión jurídica para el cobro de deudas y acreencias con comunicación estratégica y procesos formales." },
  { icon: "clipboard", title: "Auditoría y revisión jurídica", description: "Revisión integral de documentos, contratos y procesos para identificar riesgos y oportunidades de mejora." },
  { icon: "filesearch", title: "Estudio de riesgo jurídico", description: "Análisis preventivo del riesgo legal de operaciones, proyectos o decisiones antes de comprometer tu patrimonio." },
];

const REAL_ESTATE_SERVICES = [
  { icon: "home", title: "Inmuebles en venta", description: "Casas, apartamentos, lotes, oficinas y locales en venta, con asesoría integral para comprar o vender tu inmueble.", href: "/viviendas?operacion=venta" },
  { icon: "key", title: "Inmuebles en arrendamiento", description: "Oferta verificada de arrendamientos con contratos revisados y acompañamiento desde la visita hasta la entrega del inmueble.", href: "/viviendas?operacion=arriendo" },
  { icon: "repeat", title: "Inmuebles para permutar", description: "Selección de inmuebles disponibles para permuta y asesoría para valorar, negociar y formalizar el cambio de inmueble.", href: "/permuta" },
  { icon: "handshake", title: "Asesoría en negociación de inmuebles", description: "Acompañamiento en cada etapa de la negociación: ofertas, contrapuestas y acuerdos con respaldo profesional.", href: "" },
  { icon: "filesearch", title: "Estudio jurídico de inmuebles", description: "Revisión del certificado de tradición y libertad, gravámenes, hipotecas y situación jurídica del inmueble.", href: "" },
  { icon: "penline", title: "Elaboración de promesas y contratos inmobiliarios", description: "Redacción y revisión de promesas de compraventa y contratos de arrendamiento a medida de tu operación.", href: "" },
  { icon: "filetext", title: "Administración de contratos de arrendamiento", description: "Gestión de contratos, cánones, renovaciones, cláusulas y requerimientos legales del arrendamiento.", href: "" },
  { icon: "building", title: "Administración y gestión inmobiliaria", description: "Administramos tus inmuebles: control de ingresos, mantenimientos, pagos y gestión con arrendatarios.", href: "" },
  { icon: "trending", title: "Asesoría en inversión inmobiliaria", description: "Análisis de mercado, rentabilidad y valorización para invertir en inmueble con criterio y seguridad.", href: "" },
  { icon: "badgecheck", title: "Saneamiento jurídico de inmuebles", description: "Regularización de títulos, superación de vicios y trámites para dejar tu inmueble en orden legal.", href: "" },
  { icon: "stamp", title: "Trámites notariales y registrales", description: "Coordinación de escrituras, registro, tradición y demás trámites ante notarías y registro de instrumentos públicos.", href: "" },
  { icon: "megaphone", title: "Marketing y publicidad inmobiliaria", description: "Publicación profesional de tu inmueble en portales y redes para llegar a los compradores y arrendatarios correctos.", href: "" },
  { icon: "piggybank", title: "Subsidios y créditos inmobiliarios", description: "Acompañamiento integral en la gestión de subsidios de inmueble y créditos hipotecarios o de leasing.", href: "" },
  { icon: "ruler", title: "Avalúo y peritaje de inmuebles", description: "Avalúos comerciales y peritajes técnicos del inmueble para negociar, invertir o resolver controversias.", href: "" },
];

const CATEGORIES = {
  vivienda: "Inmueble",
  compra: "Compra",
  arriendo: "Arriendo",
  legal: "Legal",
  inversion: "Inversión inmobiliaria",
  consejos: "Consejos",
  mercado: "Mercado inmobiliario",
};

const ARTICLES = [
  {
    slug: "guia-para-comprar-vivienda-primera-vez",
    category: "compra",
    image: "compra",
    title: "Guía para comprar tu inmueble por primera vez",
    excerpt: "Del ahorro inicial a la firma de la promesa de compraventa: los pasos esenciales para comprar inmueble sin errores costosos.",
    content: `
## 1. Define tu presupuesto real

Antes de ver inmuebles, calcula tu capacidad de pago. Considera el pie, los costos de cierre, notaría, impuestos y la cuota mensual. **No te guíes solo por el precio de venta.**

## 2. Revisa la documentación del inmueble

Pide el certificado de tradición y libertad del predio y verifica que el vendedor sea el propietario. Un estudio documental previo evita sorpresas.

## 3. La promesa de compraventa

Es el contrato en el que se fijan precio, plazo y condiciones. Revisa las cláusulas con atención: arras, penalidades por incumplimiento y forma de pago.

## 4. Cuenta con acompañamiento

La parte jurídica de la operación es tan importante como el inmueble mismo. Solicita asesoría antes de firmar cualquier documento.

> Este artículo es informativo (DEMO) y no constituye asesoría jurídica.
`,
  },
  {
    slug: "arrendar-vivienda-que-revisar-antes-de-firmar",
    category: "arriendo",
    image: "arriendo",
    title: "Arrendar vivienda: qué revisar antes de firmar",
    excerpt: "Contrato, canon, administración y garantías: la lista práctica para arrendar con tranquilidad.",
    content: `
## El contrato de arrendamiento

Verifica el canon, el incremento anual, el depósito de garantía y la forma de pago. Asegúrate de que el contrato quede por escrito.

## Los servicios y administración

Confirma cuáles servicios incluye el canon y cuáles se pagan por separado. En conjuntos residenciales, revisa la cuota de administración.

## El estado del inmueble

Haz un inventario fotográfico al entrar y salir. Documenta el estado de los acabados para evitar descuentos injustificados al entregar el inmueble.

## Tu firma importa

Lee todo el contrato. Si algo no te queda claro, pide orientación antes de firmar.

> Artículo de demostración con fines informativos.
`,
  },
  {
    slug: "que-es-el-certificado-de-tradicion-y-libertad",
    category: "legal",
    image: "legal",
    title: "¿Qué es el certificado de tradición y libertad?",
    excerpt: "El documento que cuenta la historia jurídica de un inmueble: propietarios, gravámenes y limitaciones.",
    content: `
## La historia del inmueble

El certificado de tradición y libertad resume el historial de propiedad de un bien desde su primer registro. En él se identifican los propietarios actuales y anteriores.

## Qué revisar

- La **cadena de propiedad** y si el vendedor puede vender.
- Los **gravámenes** (hipotecas, embargos, limitaciones).
- La existencia de **tradición saneada**.

## Cómo obtenerlo

Se solicita en la oficina de registro de instrumentos públicos correspondiente o de forma electrónica cuando aplica.

## Por qué importa

Comprar sin revisar este documento es uno de los riesgos más comunes. Un estudio documental previo te protege.

> Contenido de demostración; no constituye asesoría jurídica profesional.
`,
  },
  {
    slug: "invertir-en-vivienda-en-el-eje-cafetero",
    category: "inversion",
    image: "inversion",
    title: "Invertir en inmueble en el Eje Cafetero",
    excerpt: "Tasas, demanda turística y valorización: claves para decidir dónde y cómo invertir en la región.",
    content: `
## Una región en crecimiento

El Eje Cafetero combina atractivo turístico, clima y calidad de vida. Esa demanda se refleja en el mercado de inmueble, tanto para venta como para arriendo.

## Qué tener en cuenta

- La **ubicación** y el potencial de valorización de la zona.
- El **tipo de demanda** (local, estudiante, turista, temporal).
- La **rentabilidad esperada** del arriendo convencional vs. temporal.

## Riesgos

Todo análisis debe incluir costos de mantenimiento, vacancia y regulación local de arriendos temporales.

## Decide con información

La combinación de análisis de mercado y asesoría jurídica reduce el riesgo de una inversión inmobiliaria.

> Contenido de demostración con fines informativos.
`,
  },
  {
    slug: "checklist-para-revisar-una-casa-antes-de-comprar",
    category: "consejos",
    image: "consejos",
    title: "Checklist para revisar una casa antes de decidir",
    excerpt: "Estructura, humedades, acabados y documentación: lo que debes revisar en cada visita a un inmueble.",
    content: `
## En la estructura

Observa muros, pisos y techos en busca de grietas o humedades. Revisa que las puertas y ventanas cierren bien.

## En los servicios

Verifica presión de agua, estado de las acometidas eléctricas y ventilación de los espacios.

## En el entorno

Consulta la zona: comercio cercano, transporte, seguridad y proyectos futuros que puedan afectar la valorización.

## En los documentos

Solicita el certificado de tradición y libertad y compáralo con lo que te explica el vendedor.

## No te apresures

Las visitas son para observar, no para decidir en el lugar. Tómate el tiempo de comparar.

> Artículo de demostración.
`,
  },
];

async function seed() {
  await prisma.auditLog.deleteMany().catch(() => {});
  await prisma.cityLanding.deleteMany().catch(() => {});

  // --- Marcas y hero ---
  await ensureImage(PHOTOS.hero, "brand/hero.webp", { label: "Bienvenido a Fyrama", width: 1920, quality: 70 });
  await ensureImage(PHOTOS.hero, "brand/og-fyrama.webp", { label: "Fyrama", width: 1200 });

  // --- Usuarios ---
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { name: ADMIN_NAME, active: true },
    create: {
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      passwordHash: sha(ADMIN_PASSWORD), // reemplazado abajo por bcrypt
      role: Role.ADMIN,
    },
  });
  const editor = await prisma.user.upsert({
    where: { email: EDITOR_EMAIL },
    update: { active: true },
    create: {
      email: EDITOR_EMAIL,
      name: "Editor de contenido",
      passwordHash: sha(EDITOR_PASSWORD),
      role: Role.EDITOR,
    },
  });

  let bcrypt;
  try {
    bcrypt = await import("bcryptjs");
  } catch {}
  if (bcrypt?.default && typeof bcrypt.default.hash === "function") {
    await prisma.user.update({ where: { id: admin.id }, data: { passwordHash: await bcrypt.default.hash(ADMIN_PASSWORD, 12) } });
    await prisma.user.update({ where: { id: editor.id }, data: { passwordHash: await bcrypt.default.hash(EDITOR_PASSWORD, 12) } });
  } else {
    // Fallback SHA-256 (solo para desarrollo sin bcrypt) — marcado claro.
    console.log("⚠️ bcryptjs no disponible; usando hash SHA-256 (SOLO DESARROLLO).");
  }

  // --- Configuración ---
  await upsertSettings();

  // --- Páginas de ciudad (SEO local) ---
  const cityLandings = [
    {
      citySlug: "armenia",
      cityName: "Armenia",
      department: "Quindío",
      operation: null,
      title: "Inmuebles en Armenia, Quindío",
      intro:
        "Armenia combina vida urbana y cercanía al paisaje cafetero. Desde casas familiares en el centro hasta apartamentos modernos en el norte, Fyrama te ayuda a encontrar y asesorar la compra o arriendo de tu inmueble en la capital del Quindío.",
      body:
        "### Vive cerca de todo\nEl municipio concentra comercio, universidades, salud y una oferta gastronómica creciente. Los sectores de Fundadores, Uribe, El Campestre y La Patria concentran buena parte de la oferta de inmueble nuevo y usada.\n\n### Mercado de referencia\nLos precios varían según la zona, la tipología y la antigüedad del inmueble. Siempre verifica el certificado de tradición y las condiciones reales de cada proyecto.",
    },
    {
      citySlug: "salento",
      cityName: "Salento",
      department: "Quindío",
      operation: null,
      title: "Inmuebles en Salento, Quindío",
      intro:
        "Salento es el corazón del paisaje cultural cafetero. Una oferta de casas de campo, fincas y inmueble tradicional para quienes buscan tranquilidad e inversión turística en el corazón del Quindío.",
      body:
        "### Un destino con valorización\nLa actividad turística de Salento y el acceso al Valle de Cocora mantienen activo el mercado de inmueble campestre y hospedaje. Verifica siempre la documentación del predio y las normas de uso del suelo.",
    },
  ];
  for (const c of cityLandings) {
    await prisma.cityLanding.create({ data: c });
  }

  // --- Inmuebles ---
  const mediaCache = {};
  for (const p of PROPERTIES) {
    const existing = await prisma.property.findUnique({ where: { slug: p.key } });
    // Limpiar si existe para repetir seed
    if (existing) {
      const imgs = await prisma.propertyImage.findMany({ where: { propertyId: existing.id }, select: { mediaAssetId: true } });
      for (const im of imgs) {
        await prisma.mediaAsset.delete({ where: { id: im.mediaAssetId } }).catch(() => {});
      }
      await prisma.propertyFeature.deleteMany({ where: { propertyId: existing.id } });
      await prisma.property.delete({ where: { id: existing.id } });
    }

    // Descargar imagenes
    const urls = PHOTOS[p.key];
    const imageRows = [];
    for (let i = 0; i < urls.length; i++) {
      const cached = mediaCache[urls[i]];
      let url, thumb, card, variants, w, h;
      if (cached) {
        url = cached.url; thumb = cached.thumb; card = cached.card; variants = cached.variants; w = cached.w; h = cached.h;
      } else {
        const relDir = `seed/${p.key}-${i}`;
        const rel = `${relDir}.webp`;
        const path = await ensureImage(urls[i], rel, { label: p.title, width: 1400 });
        const abs = join(PUBLIC_MEDIA, path.replace("/media/", ""));
        const meta = await sharp(abs).metadata();
        // Generar variantes pequeñas con sharp
        const mk = async (w2) => {
          const out = `${relDir}-${w2}.webp`;
          await sharp(abs).resize({ width: w2, withoutEnlargement: true }).webp({ quality: 70 }).toFile(join(PUBLIC_MEDIA, out));
          return `/media/${out}`;
        };
        const v320 = await mk(320);
        const v800 = await mk(800);
        url = path; thumb = v320; card = v800;
        variants = { "320": v320, "800": v800, [String(Math.min(1400, meta.width || 1400))]: path };
        w = meta.width; h = meta.height;
        mediaCache[urls[i]] = { url, thumb, card, variants, w, h };
      }
      imageRows.push({ url, thumb, card, variants, w, h, isCover: i === 0 });
    }

    // Crear assets de media + property
    const property = await prisma.property.create({
      data: {
        slug: p.key,
        title: p.title,
        description: p.desc,
        operation: p.op,
        type: p.type,
        price: p.price,
        currency: "COP",
        status: PropertyStatus.PUBLISHED,
        featured: p.featured,
        city: p.city,
        zone: p.zone,
        neighborhood: p.neighborhood,
        latitude: p.lat,
        longitude: p.lng,
        area: p.area,
        builtArea: p.builtArea,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        parking: p.parking,
        estrato: p.estrato,
        features: {
          create: FEATURES_FOR[p.key].map((name) => ({ name })),
        },
      },
    });

    for (let i = 0; i < imageRows.length; i++) {
      const im = imageRows[i];
      const asset = await prisma.mediaAsset.create({
        data: {
          originalName: `${p.key}-${i+1}.jpg`,
          filename: randomFilename(),
          mime: "image/jpeg",
          size: 0,
          width: im.w || 1400,
          height: im.h || 1050,
          url: im.url,
          thumbUrl: im.thumb,
          cardUrl: im.card,
          variants: JSON.stringify(im.variants),
          alt: `${p.title} — fotografía ${i + 1}, ${p.city}, Quindío`,
          kind: MediaKind.PROPERTY,
        },
      });
      await prisma.propertyImage.create({
        data: {
          propertyId: property.id,
          mediaAssetId: asset.id,
          alt: `${p.title} — fotografía ${i + 1}, ${p.city}, Quindío`,
          sortOrder: i,
          isCover: im.isCover,
        },
      });
    }
  }

  // --- Servicios jurídicos ---
  const existingServices = await prisma.legalService.findMany();
  for (const s of existingServices) await prisma.legalService.delete({ where: { id: s.id } });
  for (let i = 0; i < SERVICES.length; i++) {
    const s = SERVICES[i];
    await prisma.legalService.create({
      data: {
        title: s.title,
        slug: slugify(s.title),
        description: s.description,
        content: `## ${s.title}\n\n${s.description}`,
        icon: s.icon,
        sortOrder: i,
        active: true,
      },
    });
  }

  // --- Servicios inmobiliarios ---
  const existingRealEstate = await prisma.realEstateService.findMany();
  for (const s of existingRealEstate) await prisma.realEstateService.delete({ where: { id: s.id } });
  for (let i = 0; i < REAL_ESTATE_SERVICES.length; i++) {
    const s = REAL_ESTATE_SERVICES[i];
    await prisma.realEstateService.create({
      data: {
        title: s.title,
        slug: slugify(s.title),
        description: s.description,
        content: s.description,
        icon: s.icon,
        href: s.href,
        sortOrder: i,
        active: true,
      },
    });
  }

  // --- Blog ---
  const existingArticles = await prisma.article.findMany({ select: { id: true } });
  for (const a of existingArticles) await prisma.article.delete({ where: { id: a.id } });
  const existingCats = await prisma.articleCategory.findMany();
  for (const c of existingCats) await prisma.articleCategory.delete({ where: { id: c.id } });

  const catMap = {};
  for (const [slug, name] of Object.entries(CATEGORIES)) {
    const c = await prisma.articleCategory.create({ data: { name, slug } });
    catMap[slug] = c.id;
  }

  for (const a of ARTICLES) {
    const imgRel = `${a.slug}.webp`;
    const imgPath = await ensureImage(PHOTOS.blog[a.image] ?? PHOTOS.blog.consejos, `seed/${imgRel}`, { label: a.title, width: 1200 });
    const abs = join(PUBLIC_MEDIA, imgPath.replace("/media/", ""));
    const meta = await sharp(abs).metadata();
    const asset = await prisma.mediaAsset.create({
      data: {
        originalName: `${a.title}.jpg`,
        filename: randomFilename(),
        mime: "image/jpeg",
        size: 0,
        width: meta.width || 1200,
        height: meta.height || 675,
        url: imgPath,
        thumbUrl: imgPath,
        cardUrl: imgPath,
        variants: JSON.stringify({ "1200": imgPath }),
        alt: a.title,
        kind: MediaKind.ARTICLE,
      },
    });
    await prisma.article.create({
      data: {
        title: a.title,
        slug: a.slug,
        excerpt: DEMO + a.excerpt,
        content: a.content,
        coverMediaId: asset.id,
        coverAlt: a.title,
        categoryId: catMap[a.category],
        author: "Equipo Fyrama",
        status: ArticleStatus.PUBLISHED,
        publishedAt: new Date(),
        seoTitle: a.title,
        metaDescription: a.excerpt.slice(0, 200),
      },
    });
  }

  // --- Solicitudes demo (ejemplos de estados) ---
  const demoProperty = await prisma.property.findFirst({ where: { slug: "apt1" } });
  if (demoProperty) {
    await prisma.contactRequest.createMany({
      data: [
        {
          type: "PROPERTY",
          name: "Cliente Demostrativo",
          email: "cliente@demo.co",
          phone: "+57 300 111 2233",
          message: "Me interesa el apartamento de la zona fundadores. ¿En qué horario se puede visitar? (DEMO)",
          propertyId: demoProperty.id,
          status: "NEW",
        },
        {
          type: "LEGAL",
          name: "Cliente Demostrativo",
          email: "cliente2@demo.co",
          phone: "+57 300 444 5566",
          message: "Necesito revisar una promesa de compraventa antes de firmar. (DEMO)",
          legalTopic: "Promesa de compraventa",
          contactPreference: "WhatsApp",
          status: "CONTACTED",
        },
      ],
    });
  }

  console.log("");
  console.log("✅ Seed completado.");
  console.log(`   Admin:  ${ADMIN_EMAIL}  /  ${ADMIN_PASSWORD}`);
  console.log(`   Editor: ${EDITOR_EMAIL}  /  ${EDITOR_PASSWORD}`);
  console.log("   ⚠️  Cambia estas contraseñas desde el dashboard (Configuración).");
  console.log("   Nota: contenido e imágenes de demostración; sustituibles desde el dashboard.");
}

function randomFilename() {
  return randomBytes(8).toString("hex") + ".jpg";
}

function slugify(text) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

seed()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });