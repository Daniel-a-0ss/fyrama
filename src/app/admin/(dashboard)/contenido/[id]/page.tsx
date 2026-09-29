import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArticleForm } from "@/components/admin/ArticleForm";

export default async function EditarArticuloPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [article, categories] = await Promise.all([
    prisma.article.findUnique({ where: { id } }),
    prisma.articleCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!article) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/contenido" className="text-sm font-medium text-pine-800 hover:underline">
          ← Volver a contenido
        </Link>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink-900">
          {article.title}
        </h1>
      </div>
      <ArticleForm
        initial={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content,
          coverMediaId: article.coverMediaId ?? undefined,
          coverAlt: article.coverAlt ?? undefined,
          categoryId: article.categoryId ?? undefined,
          author: article.author,
          publishedAt: article.publishedAt?.toISOString() ?? "",
          status: article.status,
          seoTitle: article.seoTitle ?? undefined,
          metaDescription: article.metaDescription ?? undefined,
          categories,
        }}
      />
    </div>
  );
}