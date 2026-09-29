import { prisma } from "@/lib/prisma";
import { AuditAction } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/admin";
import { ok, handle } from "@/lib/api";

export const runtime = "nodejs";

async function doList(request: Request) {
  const guard = await requireAdmin(request, { role: "ADMIN" });
  if (!guard.user) return guard.error;

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? 30)));
  const rawAction = url.searchParams.get("action");

  const allowed = rawAction && (Object.values(AuditAction) as string[]).includes(rawAction);
  const where = allowed ? { action: rawAction as AuditAction } : undefined;

  const [total, items] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  return ok({ items, total, page, totalPages: Math.max(1, Math.ceil(total / limit)) });
}

export async function GET(request: Request) {
  return handle(() => doList(request));
}