import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { ArticleCard } from "@/components/article/ArticleCard";
import { SITE_TAGLINE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Blog inmobiliario",
  description:
    "Contenido para decidir mejor: compra, arrendamiento, inmueble, mercado inmobiliario y consejos jurídicos para tus operaciones.",
  path: "/blog",
});

export default async function BlogPage() {
  const [articles, categories] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
      orderBy: { publishedAt: "desc" },
      take: 27,
      include: { category: true, coverMedia: true },
    }),
    prisma.articleCategory.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { articles: { where: { status: "PUBLISHED" } } } } },
    }),
  ]);

  if (articles.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-40 sm:px-6 lg:pt-44 lg:px-8">
        <p className="mt-2 text-ink-500">
          Aún no tenemos artículos publicados. Vuelve pronto.
        </p>
      </div>
    );
  }

  const [latest, ...rest] = articles;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-36 sm:px-6 lg:pt-40 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-600">
          Blog Fyrama
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
          Contenido para decidir mejor
        </h1>
        <p className="mt-4 text-lg text-ink-600">{SITE_TAGLINE}</p>
      </div>

      {categories.length > 0 && (
        <nav className="mt-8 flex flex-wrap gap-2" aria-label="Categorías del blog">
          <Link
            href="/blog"
            className="rounded-full bg-pine-950 px-4 py-1.5 text-sm font-medium text-bone-50"
          >
            Todos
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/blog/categoria/${c.slug}`}
              className="rounded-full border border-ink-900/12 px-4 py-1.5 text-sm font-medium text-ink-600 transition-colors hover:border-pine-900 hover:text-pine-900"
            >
              {c.name}
            </Link>
          ))}
        </nav>
      )}

      {/* Destacado */}
      <article className="group mt-10 grid overflow-hidden rounded-3xl border border-bone-200/80 bg-white shadow-fyrama lg:grid-cols-2">
        <Link
          href={`/blog/${latest.slug}`}
          className="relative block aspect-video overflow-hidden bg-bone-100 lg:aspect-auto"
          tabIndex={-1}
        >
          {latest.coverMedia ? (
            <img
              src={latest.coverMedia.url}
              alt={latest.coverAlt ?? latest.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-pine-800 to-pine-950">
              <span className="font-display text-2xl text-bone-50/60">Fyrama</span>
            </div>
          )}
        </Link>
        <div className="flex flex-col justify-center p-6 sm:p-10">
          {latest.category && (
            <Link href={`/blog/categoria/${latest.category.slug}`}>
              <span className="rounded-full bg-gold-200 px-3 py-1 text-xs font-semibold text-gold-700">
                {latest.category.name}
              </span>
            </Link>
          )}
          <h2 className="mt-4 font-display text-2xl font-semibold leading-snug text-ink-900 sm:text-3xl">
            <Link href={`/blog/${latest.slug}`} className="group-hover:text-pine-800">
              {latest.title}
            </Link>
          </h2>
          <p className="mt-3 leading-relaxed text-ink-500">{latest.excerpt}</p>
          <div className="mt-6">
            <Link
              href={`/blog/${latest.slug}`}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-pine-950 px-6 text-sm font-medium text-bone-50 transition-colors hover:bg-pine-800 active:scale-[0.99]"
            >
              Leer artículo
            </Link>
          </div>
        </div>
      </article>

      {/* Resto */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((a) => (
          <ArticleCard
            key={a.id}
            article={{
              slug: a.slug,
              title: a.title,
              excerpt: a.excerpt,
              coverUrl: a.coverMedia?.url ?? null,
              coverAlt: a.coverAlt,
              categorySlug: a.category?.slug,
              categoryName: a.category?.name,
              author: a.author,
              publishedAt: a.publishedAt,
            }}
          />
        ))}
      </div>
    </div>
  );
}