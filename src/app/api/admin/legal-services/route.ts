import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/admin";
import { legalServiceSchema } from "@/lib/validation/schemas";
import { ok, fail, failValidation, handle } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { getClientIp, getClientUserAgent } from "@/lib/utils";
import { slugify } from "@/lib/utils";
import { uniqueSlug } from "@/lib/services/admin";

export const runtime = "nodejs";

async function doList(request: Request) {
  const guard = await requireAdmin(request);
  if (!guard.user) return guard.error;

  const items = await prisma.legalService.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
  return ok({ items });
}

async function doCreate(request: Request) {
  const guard = await requireAdmin(request);
  if (!guard.user) return guard.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "BAD_REQUEST", "Solicitud no válida.");
  }
  const parsed = legalServiceSchema.safeParse(body);
  if (!parsed.success) return failValidation(parsed.error);
  const d = parsed.data;

  const slug =
    d.slug?.trim() || (await uniqueSlug("legal-service", slugify(d.title) || "servicio"));

  try {
    const service = await prisma.legalService.create({
      data: {
        title: d.title,
        slug,
        description: d.description,
        content: d.content,
        icon: d.icon,
        active: d.active,
        sortOrder: d.sortOrder,
      },
    });
    await logAudit({
      action: "CREATE_LEGAL_SERVICE",
      userId: guard.user.id,
      ipAddress: getClientIp(request.headers),
      userAgent: getClientUserAgent(request.headers),
      entityType: "legal-service",
      entityId: service.id,
      details: { title: service.title },
    });
    return ok({ id: service.id, slug: service.slug }, 201);
  } catch {
    return fail(409, "SLUG_CONFLICT", "Ya existe un servicio con ese slug.");
  }
}

export async function GET(request: Request) {
  return handle(() => doList(request));
}
export async function POST(request: Request) {
  return handle(() => doCreate(request));
}