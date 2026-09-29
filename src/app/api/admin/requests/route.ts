import { prisma } from "@/lib/prisma";
import { ContactStatus, ContactType, Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/admin";
import { ok, handle } from "@/lib/api";

export const runtime = "nodejs";

async function doList(request: Request) {
  const guard = await requireAdmin(request);
  if (!guard.user) return guard.error;

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") ?? 15)));
  const status = url.searchParams.get("status");
  const type = url.searchParams.get("type");

  const where: Prisma.ContactRequestWhereInput = {
    ...(status && status !== "ALL" ? { status: status as ContactStatus } : {}),
    ...(type && type !== "ALL" ? { type: type as ContactType } : {}),
  };

  const [total, items] = await Promise.all([
    prisma.contactRequest.count({ where }),
    prisma.contactRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        property: { select: { id: true, title: true, slug: true } },
      },
    }),
  ]);

  return ok({ items, total, page, totalPages: Math.max(1, Math.ceil(total / limit)) });
}

export async function GET(request: Request) {
  return handle(() => doList(request));
}