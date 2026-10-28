import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/utils";

export function Breadcrumbs({
  items,
}: {
  items: Array<{ label: string; href?: string }>;
}) {
  const crumbs = [{ label: "Inicio", href: "/" }, ...items];
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: absoluteUrl(c.href) } : {}),
    })),
  };

  return (
    <nav aria-label="Ruta de navegación" className="text-sm text-ink-500">
      <JsonLd data={schema} />
      <ol className="flex flex-wrap items-center gap-1.5">
        {crumbs.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i === 0 && <Home className="size-3.5" aria-hidden />}
            {c.href && i < crumbs.length - 1 ? (
              <Link href={c.href} className="hover:text-pine-800 hover:underline underline-offset-2">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink-700 font-medium">
                {c.label}
              </span>
            )}
            {i < crumbs.length - 1 && (
              <ChevronRight className="size-3.5 text-ink-400" aria-hidden />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}