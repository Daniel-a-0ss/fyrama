import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";

export const dynamic = "force-dynamic";

const MARKERS = [
  "demostraci",
  "Demostraci",
  "DEMO",
  "prueba",
  "Prueba",
  "lorem",
  "Lorem",
];

function authorized(request: Request) {
  const token = process.env.MIGRATION_TOKEN;
  return Boolean(token) && request.headers.get("x-migration-token") === token;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return fail(401, "UNAUTHORIZED", "No autorizado.");
  }

  const or = MARKERS.map((m) => ({ contains: m }));
  const [properties, articles, reviews] = await Promise.all([
    prisma.property.findMany({
      where: {
        OR: or.map((c) => ({ description: c })),
      },
      select: { id: true, slug: true, title: true, description: true },
    }),
    prisma.article.findMany({
      where: {
        OR: [
          ...or.map((c) => ({ excerpt: c })),
          ...or.map((c) => ({ content: c })),
          ...or.map((c) => ({ title: c })),
        ],
      },
      select: { id: true, slug: true, title: true, excerpt: true, content: true },
    }),
    prisma.review.findMany({
      where: {
        OR: [
          ...or.map((c) => ({ content: c })),
          ...or.map((c) => ({ title: c })),
          ...or.map((c) => ({ name: c })),
        ],
      },
      select: { id: true, name: true, title: true, content: true, status: true },
    }),
  ]);

  return ok({ properties, articles, reviews });
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return fail(401, "UNAUTHORIZED", "No autorizado.");
  }

  let body: {
    updates?: Array<{
      model: "property" | "article" | "review";
      id: string;
      data: Record<string, string>;
    }>;
  };
  try {
    body = await request.json();
  } catch {
    return fail(400, "INVALID_JSON", "JSON inválido.");
  }

  const updates = body.updates ?? [];
  if (updates.length === 0 || updates.length > 200) {
    return fail(422, "INVALID_UPDATES", "Envía entre 1 y 200 actualizaciones.");
  }

  const allowed: Record<string, string[]> = {
    property: ["title", "description"],
    article: ["title", "excerpt", "content", "seoTitle", "metaDescription"],
    review: ["name", "title", "content", "status"],
  };

  const applied: string[] = [];
  for (const update of updates) {
    const fields = allowed[update.model];
    if (!fields) {
      return fail(422, "INVALID_MODEL", `Modelo no permitido: ${update.model}`);
    }
    const data: Record<string, string> = {};
    for (const [key, value] of Object.entries(update.data)) {
      if (!fields.includes(key) || typeof value !== "string") {
        return fail(422, "INVALID_FIELD", `Campo no permitido: ${key}`);
      }
      data[key] = value;
    }
    if (Object.keys(data).length === 0) {
      return fail(422, "EMPTY_UPDATE", "Actualización sin campos.");
    }

    if (update.model === "property") {
      await prisma.property.update({
        where: { id: update.id },
        data: data as Prisma.PropertyUpdateInput,
      });
    } else if (update.model === "article") {
      await prisma.article.update({
        where: { id: update.id },
        data: data as Prisma.ArticleUpdateInput,
      });
    } else {
      await prisma.review.update({
        where: { id: update.id },
        data: data as Prisma.ReviewUpdateInput,
      });
    }
    applied.push(`${update.model}:${update.id}`);
  }

  return ok({ applied });
}
