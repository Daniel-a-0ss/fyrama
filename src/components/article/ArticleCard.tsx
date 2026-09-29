import { ArrowUpRight, CalendarDays, UserRound } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export type ArticleCardView = {
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string | null;
  coverAlt: string | null;
  categorySlug?: string | null;
  categoryName?: string | null;
  author: string;
  publishedAt: Date | null;
};

export function ArticleCard({ article }: { article: ArticleCardView }) {
  const href = `/blog/${article.slug}`;
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-bone-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-fyrama-lg">
      <a href={href} className="relative block aspect-video overflow-hidden bg-bone-100" tabIndex={-1}>
        {article.coverUrl ? (
          <img
            src={article.coverUrl}
            alt={article.coverAlt ?? article.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-pine-800 to-pine-950">
            <span className="font-display text-lg text-bone-50/60">Fyrama</span>
          </div>
        )}
      </a>
      <div className="flex flex-1 flex-col p-5">
        {article.categoryName && (
          <a href={`/blog/categoria/${article.categorySlug}`}>
            <Badge tone="gold">{article.categoryName}</Badge>
          </a>
        )}
        <h2 className="mt-3 font-display text-lg font-semibold leading-snug text-ink-900">
          <a href={href} className="focus-visible:outline-none group-hover:text-pine-800">
            {article.title}
          </a>
        </h2>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-500">
          {article.excerpt}
        </p>
        <div className="mt-4 flex items-center gap-4 border-t border-bone-100 pt-3 text-xs text-ink-400">
          <span className="inline-flex items-center gap-1.5">
            <UserRound className="size-3.5" aria-hidden /> {article.author}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" aria-hidden />
            {formatDate(article.publishedAt)}
          </span>
          <a
            href={href}
            className="ml-auto inline-flex items-center gap-1 text-pine-800 hover:underline underline-offset-2"
            aria-label={`Leer ${article.title}`}
          >
            Leer <ArrowUpRight className="size-3.5" aria-hidden />
          </a>
        </div>
      </div>
    </article>
  );
}