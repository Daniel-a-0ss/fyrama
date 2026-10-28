import { prisma } from "@/lib/prisma";
import { scheduleAdminNotification } from "@/lib/notifications";
import { reviewLimiter } from "@/lib/security/rate-limit";
import { reviewSchema } from "@/lib/validation/schemas";
import { ok, fail, failValidation, handle } from "@/lib/api";
import { getClientIp } from "@/lib/utils";

export const runtime = "nodejs";

async function doReview(request: Request) {
  const ip = getClientIp(request.headers);

  if (!reviewLimiter.allow(ip ?? "unknown")) {
    return fail(
      429,
      "RATE_LIMITED",
      "Ya enviaste varias opiniones. Intenta de nuevo en unas horas."
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "BAD_REQUEST", "Solicitud no válida.");
  }

  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return failValidation(parsed.error);

  const data = parsed.data;

  // Honeypot: si un bot rellenó `company`, respondemos éxito sin guardar nada.
  if (data.company && data.company.length > 0) {
    return ok({ received: true });
  }

  // Evita opiniones duplicadas del mismo texto (mismo autor y contenido).
  const content = data.content.trim();

  try {
    const duplicate = await prisma.review.findFirst({
      where: { name: data.name.trim(), content },
      select: { id: true },
    });
    if (duplicate) {
      return fail(409, "DUPLICATE", "Ya enviamos esa opinión. Gracias.");
    }

    // Quedan PENDING: el administrador la aprueba antes de publicarse.
    await prisma.review.create({
      data: {
        name: data.name.trim(),
        rating: data.rating,
        title: data.title?.trim() || null,
        content,
        ipAddress: ip,
      },
    });

    scheduleAdminNotification({
      subject: "Nueva opinión pendiente de aprobación",
      lines: [
        `De: ${data.name.trim()} (${data.rating}/5)`,
        data.title?.trim() ? `Título: ${data.title.trim()}` : "",
        "",
        content,
        "",
        "Revisar en /admin/opiniones",
      ],
    });
  } catch (err) {
    console.error("[fyrama-reviews] no se pudo guardar la opinión:", err);
    return fail(
      503,
      "UNAVAILABLE",
      "No pudimos registrar tu opinión en este momento. Inténtalo más tarde."
    );
  }

  return ok({ received: true });
}

export async function POST(request: Request) {
  return handle(() => doReview(request));
}

export const GET = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");
export const PUT = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");
export const PATCH = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");
export const DELETE = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");
