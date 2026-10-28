import { MediaKind, Operation, PropertyStatus, PropertyType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";

export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const token = process.env.MIGRATION_TOKEN;
  return Boolean(token) && request.headers.get("x-migration-token") === token;
}

type PermutaSeed = {
  slug: string;
  title: string;
  description: string;
  type: PropertyType;
  price: number;
  city: string;
  zone: string;
  neighborhood: string;
  lat: number;
  lng: number;
  area: number;
  builtArea: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  estrato: number;
  features: string[];
  images: string[];
};

const PROPERTIES: PermutaSeed[] = [
  {
    slug: "permuta-casa-armenia-norte",
    title: "Casa en Armenia Norte para permuta",
    description:
      "Casa de dos plantas con patio interior, sala y comedor independientes, cocina integral y zona de estudio. Acepta permuta por apartamento en Armenia o Circasia: recibimos tu inmueble como parte de pago, con avalúo y estudio de títulos previo.",
    type: PropertyType.CASA,
    price: 520000000,
    city: "Armenia",
    zone: "Norte",
    neighborhood: "La Castellana",
    lat: 4.5448,
    lng: -75.669,
    area: 180,
    builtArea: 160,
    bedrooms: 3,
    bathrooms: 2,
    parking: 2,
    estrato: 4,
    features: ["Patio", "Estudio", "Zona de lavandería", "Parqueadero", "Cocina integral"],
    images: ["casa1-0", "casa1-1", "casa1-2", "casa1-3"],
  },
  {
    slug: "permuta-apartamento-circasia",
    title: "Apartamento en Circasia para permuta",
    description:
      "Apartamento en conjunto cerrado con piscina, salón social y gimnasio. Balcón con vista a la montaña y parqueadero cubierto. Ideal para permutar por casa o lote en el Quindío, con acompañamiento jurídico en todo el proceso.",
    type: PropertyType.APARTAMENTO,
    price: 390000000,
    city: "Circasia",
    zone: "Centro",
    neighborhood: "El Bosque",
    lat: 4.6189,
    lng: -75.635,
    area: 92,
    builtArea: 88,
    bedrooms: 2,
    bathrooms: 2,
    parking: 1,
    estrato: 3,
    features: ["Balcón", "Piscina", "Gimnasio", "Salón comunal", "Parqueadero"],
    images: ["apt1-0", "apt1-1", "apt1-2"],
  },
  {
    slug: "permuta-casa-campestre-salento",
    title: "Casa campestre en Salento para permuta",
    description:
      "Casa campestre con piscina, zona de BBQ y amplio jardín, rodeada de paisaje cafetero. Permuta por apartamento en Armenia o Pereira, sujeta a avalúo y estudio de títulos. Coordinamos escritura, notaría y registro.",
    type: PropertyType.CASA_CAMPO,
    price: 780000000,
    city: "Salento",
    zone: "Cocora",
    neighborhood: "El Mirador",
    lat: 4.6374,
    lng: -75.5707,
    area: 2500,
    builtArea: 210,
    bedrooms: 4,
    bathrooms: 3,
    parking: 3,
    estrato: 5,
    features: ["Piscina", "Zona BBQ", "Jardín", "Chimenea", "Vista a la montaña", "Parqueadero"],
    images: ["casa2-0", "casa2-1", "casa2-2", "casa2-3"],
  },
];

export async function GET(request: Request) {
  if (!authorized(request)) return fail(401, "UNAUTHORIZED", "No autorizado.");
  const items = await prisma.property.findMany({
    where: { operation: Operation.PERMUTA, deletedAt: null },
    select: { id: true, slug: true, title: true, status: true },
    orderBy: { createdAt: "desc" },
  });
  return ok({ total: items.length, items });
}

export async function POST(request: Request) {
  if (!authorized(request)) return fail(401, "UNAUTHORIZED", "No autorizado.");

  const created: string[] = [];
  const skipped: string[] = [];

  for (const p of PROPERTIES) {
    const existing = await prisma.property.findUnique({ where: { slug: p.slug } });
    if (existing) {
      skipped.push(p.slug);
      continue;
    }

    const property = await prisma.property.create({
      data: {
        slug: p.slug,
        title: p.title,
        description: p.description,
        operation: Operation.PERMUTA,
        type: p.type,
        price: p.price,
        currency: "COP",
        status: PropertyStatus.PUBLISHED,
        featured: false,
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
        features: { create: p.features.map((name) => ({ name })) },
      },
    });

    for (let i = 0; i < p.images.length; i++) {
      const base = p.images[i];
      const url = `/media/seed/${base}.webp`;
      const asset = await prisma.mediaAsset.create({
        data: {
          originalName: `${base}.webp`,
          filename: `${base}.webp`,
          mime: "image/webp",
          size: 0,
          width: 1400,
          height: 933,
          url,
          thumbUrl: `/media/seed/${base}-320.webp`,
          cardUrl: `/media/seed/${base}-800.webp`,
          variants: JSON.stringify({
            "320": `/media/seed/${base}-320.webp`,
            "800": `/media/seed/${base}-800.webp`,
            "1400": url,
          }),
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
          isCover: i === 0,
        },
      });
    }

    created.push(p.slug);
  }

  return ok({ created, skipped });
}
