import { prisma } from "@/lib/prisma";
import { Prisma, ReviewStatus } from "@prisma/client";
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

  const where: Prisma.ReviewWhereInput = {
    ...(status && status !== "ALL" ? { status: status as ReviewStatus } : {}),
  };

  const [total, items] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return ok({ items, total, page, totalPages: Math.max(1, Math.ceil(total / limit)) });
}

export async function GET(request: Request) {
  return handle(() => doList(request));
}
