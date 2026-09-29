import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/admin";
import { ok, handle } from "@/lib/api";

export const runtime = "nodejs";

async function doStats(request: Request) {
  const guard = await requireAdmin(request);
  if (!guard.user) return guard.error;

  const since = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);

  const [
    totalProperties,
    publishedProperties,
    featuredProperties,
    draftProperties,
    totalRequests,
    newRequests,
    publishedArticles,
    totalArticles,
    totalUsers,
    totalMedia,
    trend,
    recentAudit,
  ] = await Promise.all([
    prisma.property.count({ where: { deletedAt: null } }),
    prisma.property.count({ where: { status: "PUBLISHED", deletedAt: null } }),
    prisma.property.count({ where: { featured: true, deletedAt: null } }),
    prisma.property.count({ where: { status: "DRAFT", deletedAt: null } }),
    prisma.contactRequest.count(),
    prisma.contactRequest.count({ where: { status: "NEW" } }),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.article.count(),
    prisma.user.count({ where: { active: true } }),
    prisma.mediaAsset.count({ where: { deletedAt: null } }),
    prisma.contactRequest.groupBy({
      by: ["status"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  return ok({
    counts: {
      totalProperties,
      publishedProperties,
      featuredProperties,
      draftProperties,
      totalRequests,
      newRequests,
      activeUsers: totalUsers,
      publishedArticles,
      totalArticles,
      totalMedia,
    },
    trend: Object.fromEntries(
      trend.map((t) => [t.status, t._count._all])
    ),
    recentAudit,
  });
}

export async function GET(request: Request) {
  return handle(() => doStats(request));
}