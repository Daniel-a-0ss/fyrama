import { prisma } from "@/lib/prisma";

export type PublicReview = {
  id: string;
  name: string;
  rating: number;
  title: string | null;
  content: string;
  createdAt: string;
};

/** Opiniones aprobadas por el administrador, las más recientes primero.
 *  Si la tabla aún no existe en la base de datos (migración pendiente) se
 *  devuelve una lista vacía y el sitio sigue mostrando los testimonios base. */
export async function listApprovedReviews(limit = 6): Promise<PublicReview[]> {
  let rows;
  try {
    rows = await prisma.review.findMany({
      where: { status: "APPROVED" },
      orderBy: [{ approvedAt: "desc" }, { createdAt: "desc" }],
      take: limit,
      select: {
        id: true,
        name: true,
        rating: true,
        title: true,
        content: true,
        createdAt: true,
      },
    });
  } catch (err) {
    console.error("[fyrama-reviews] no se pudieron leer las opiniones:", err);
    return [];
  }

  return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
}

export function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
