import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleCard } from "@/components/article/ArticleCard";
import { buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.articleCategory.findUnique({ where: { slug } });
  if (!category) {
    return buildMetadata({
      title: "Categoría no encontrada",
      description: "La categoría que buscas no existe.",
      path: "/blog",
    });
  }
  return buildMetadata({
    title: `${category.name} — Blog`,
    description: `Artículos sobre ${category.name.toLowerCase()} en Fyrama.`,
    path: `/blog/categoria/${category.slug}`,
  });
}

export default async function CategoriaPage({ params }: Props) {
  const { slug } = await params;
  const category = await prisma.articleCategory.findUnique({
    where: { slug },
    include: {
      articles: {
        where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
        orderBy: { publishedAt: "desc" },
        include: { coverMedia: true },
      },
    },
  });
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
        Blog Fyrama
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
        {category.name}
      </h1>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {category.articles.map((a) => (
          <ArticleCard
            key={a.id}
            article={{
              slug: a.slug,
              title: a.title,
              excerpt: a.excerpt,
              coverUrl: a.coverMedia?.url ?? null,
              coverAlt: a.coverAlt,
              categorySlug: category.slug,
              categoryName: category.name,
              author: a.author,
              publishedAt: a.publishedAt,
            }}
          />
        ))}
      </div>
      {category.articles.length === 0 && (
        <p className="rounded-2xl border border-dashed border-bone-300 bg-bone-100 p-10 text-center text-ink-500">
          Aún no hay artículos publicados en esta categoría.
        </p>
      )}
    </div>
  );
}