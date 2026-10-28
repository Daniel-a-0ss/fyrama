import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/admin";
import { ok, fail, failValidation, handle } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { getClientIp, getClientUserAgent } from "@/lib/utils";
import { z } from "zod";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});

const AUDIT_ACTION = {
  APPROVED: "APPROVE_REVIEW",
  REJECTED: "REJECT_REVIEW",
} as const;

async function doUpdate(request: Request, ctx: Ctx) {
  const guard = await requireAdmin(request);
  if (!guard.user) return guard.error;

  const id = (await ctx.params).id;
  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing) return fail(404, "NOT_FOUND", "La opinión no existe.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "BAD_REQUEST", "Solicitud no válida.");
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return failValidation(parsed.error);

  const status = parsed.data.status;
  const updated = await prisma.review.update({
    where: { id },
    data: {
      status,
      approvedAt: status === "APPROVED" ? new Date() : null,
    },
  });

  await logAudit({
    action: AUDIT_ACTION[status === "PENDING" ? "REJECTED" : status],
    userId: guard.user.id,
    ipAddress: getClientIp(request.headers),
    userAgent: getClientUserAgent(request.headers),
    entityType: "review",
    entityId: id,
    details: { status, name: updated.name },
  });

  return ok({ id: updated.id, status: updated.status });
}

async function doDelete(request: Request, ctx: Ctx) {
  const guard = await requireAdmin(request);
  if (!guard.user) return guard.error;

  const id = (await ctx.params).id;
  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing) return fail(404, "NOT_FOUND", "La opinión no existe.");

  await prisma.review.delete({ where: { id } });

  await logAudit({
    action: "DELETE_REVIEW",
    userId: guard.user.id,
    ipAddress: getClientIp(request.headers),
    userAgent: getClientUserAgent(request.headers),
    entityType: "review",
    entityId: id,
    details: { name: existing.name },
  });

  return ok({ deleted: true });
}

export async function PATCH(request: Request, ctx: Ctx) {
  return handle(() => doUpdate(request, ctx));
}
export async function DELETE(request: Request, ctx: Ctx) {
  return handle(() => doDelete(request, ctx));
}
