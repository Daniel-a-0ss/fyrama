import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function buildPageUrl(base: string, params: Record<string, string>, page: number) {
  const url = new URL(base, "http://localhost");
  for (const [k, v] of Object.entries(params)) {
    if (v) url.searchParams.set(k, v);
  }
  url.searchParams.set("page", String(page));
  const search = url.search.replace(/^\?/, "");
  return search ? `${url.pathname}?${search}` : url.pathname;
}

export function pageOfRange(current: number, total: number): Array<number | "…"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set<number>([1, total, current - 1, current, current + 1]);
  const sorted = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: Array<number | "…"> = [];
  let prev = 0;
  for (const n of sorted) {
    if (prev && n - prev > 1) out.push("…");
    out.push(n);
    prev = n;
  }
  return out;
}

export function Pagination({
  current,
  total,
  basePath,
  params = {},
  className,
}: {
  current: number;
  total: number;
  basePath: string;
  params?: Record<string, string>;
  className?: string;
}) {
  if (total <= 1) return null;
  const numbers = pageOfRange(current, total);
  return (
    <nav
      aria-label="Paginación de resultados"
      className={cn("flex flex-wrap items-center justify-center gap-1.5", className)}
    >
      {current > 1 ? (
        <Link
          href={buildPageUrl(basePath, params, current - 1)}
          className="inline-flex size-9 items-center justify-center rounded-xl border border-ink-900/10 text-ink-700 transition-colors hover:bg-bone-100 active:scale-95 sm:size-10"
          aria-label="Página anterior"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </Link>
      ) : (
        <span
          className="inline-flex size-9 items-center justify-center rounded-xl text-ink-400 opacity-50 sm:size-10"
          aria-hidden
        >
          <ChevronLeft className="size-4" />
        </span>
      )}
      {numbers.map((n, i) =>
        n === "…" ? (
          <span key={`e-${i}`} className="px-1 text-ink-400" aria-hidden>
            …
          </span>
        ) : (
          <Link
            key={n}
            href={buildPageUrl(basePath, params, n)}
            aria-current={n === current ? "page" : undefined}
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-xl text-sm font-medium transition-colors active:scale-95 sm:size-10",
              n === current
                ? "bg-pine-900 text-bone-50"
                : "border border-ink-900/10 text-ink-700 hover:bg-bone-100"
            )}
          >
            {n}
          </Link>
        )
      )}
      {current < total ? (
        <Link
          href={buildPageUrl(basePath, params, current + 1)}
          className="inline-flex size-9 items-center justify-center rounded-xl border border-ink-900/10 text-ink-700 transition-colors hover:bg-bone-100 active:scale-95 sm:size-10"
          aria-label="Página siguiente"
        >
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : (
        <span
          className="inline-flex size-9 items-center justify-center rounded-xl text-ink-400 opacity-50 sm:size-10"
          aria-hidden
        >
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}