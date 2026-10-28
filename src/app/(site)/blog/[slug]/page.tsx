import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl, formatDate } from "@/lib/utils";
import { ArticleBody } from "@/components/article/ArticleBody";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { CalendarDays, History, Tag, UserRound } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findFirst({
    where: { slug, status: "PUBLISHED", publishedAt: { lte: new Date() } },
    include: { coverMedia: true },
  });
  if (!article) {
    return buildMetadata({
      title: "Artículo no encontrado",
      description: "El artículo que buscas no existe o ya no está disponible.",
      path: "/blog",
    });
  }
  const seoTitle = article.seoTitle ?? article.title;
  return buildMetadata({
    title: seoTitle,
    description:
      article.metaDescription ?? article.excerpt ?? article.title,
    path: `/blog/${article.slug}`,
    ogImage: article.coverMedia?.url,
    type: "article",
    publishedTime: article.publishedAt?.toISOString(),
  });
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await prisma.article.findFirst({
    where: { slug, status: "PUBLISHED", publishedAt: { lte: new Date() } },
    include: { category: true, coverMedia: true },
  });
  if (!article) notFound();

  const url = absoluteUrl(`/blog/${article.slug}`);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || undefined,
    image: article.coverMedia ? absoluteUrl(article.coverMedia.url) : undefined,
    author: { "@type": "Organization", name: article.author || "Fyrama" },
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    mainEntityOfPage: url,
    ...(article.category
      ? { articleSection: article.category.name }
      : {}),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-36 sm:px-6 lg:pt-40">
      <JsonLd data={articleSchema} />
      <Breadcrumbs
        items={[
          { label: "Blog", href: "/blog" },
          ...(article.category
            ? [{ label: article.category.name, href: `/blog/categoria/${article.category.slug}` }]
            : []),
          { label: article.title },
        ]}
      />

      <article className="mt-6">
        {article.category && (
          <Link href={`/blog/categoria/${article.category.slug}`}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-200 px-3 py-1 text-xs font-semibold text-gold-700">
              <Tag className="size-3" aria-hidden />
              {article.category.name}
            </span>
          </Link>
        )}

        <h1 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-ink-900 sm:text-4xl">
          {article.title}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-bone-200 py-4 text-sm text-ink-500">
          <span className="inline-flex items-center gap-1.5">
            <UserRound className="size-4" aria-hidden />
            {article.author}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4" aria-hidden />
            Publicado {formatDate(article.publishedAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <History className="size-4" aria-hidden />
            Actualizado {formatDate(article.updatedAt)}
          </span>
        </div>

        {article.coverMedia && (
          <img
            src={article.coverMedia.url}
            alt={article.coverAlt ?? article.title}
            className="mt-6 aspect-video w-full rounded-2xl object-cover"
            width={article.coverMedia.width}
            height={article.coverMedia.height}
          />
        )}

        <div className="mt-8">
          <ArticleBody content={article.content || "Este artículo aún no tiene contenido."} />
        </div>
      </article>

      {/* CTA */}
      <div className="mt-12 rounded-2xl bg-gold-200/50 p-6 text-center sm:p-8">
        <h2 className="font-display text-xl font-semibold text-ink-900">
          ¿Necesitas acompañamiento en tu operación?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-600">
          Solicita asesoría jurídica o plan de visita a un inmueble.
        </p>
        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/asesoria-juridica"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-pine-950 px-6 text-sm font-medium text-bone-50 hover:bg-pine-800 active:scale-[0.99]"
          >
            Solicitar asesoría
          </Link>
          <Link
            href="/viviendas"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-ink-900/15 px-6 text-sm font-medium text-ink-800 hover:bg-white"
          >
            Ver inmuebles
          </Link>
        </div>
      </div>
    </div>
  );
}