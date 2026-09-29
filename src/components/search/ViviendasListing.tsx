import { Suspense } from "react";
import { normalizeQuery, type SearchParamsRecord } from "@/lib/search";
import { FilterSidebar } from "@/components/search/FilterSidebar";
import { SortSelect } from "@/components/search/SortSelect";
import { MobileFiltersSheet } from "@/components/search/MobileFiltersSheet";
import { PropertyCard } from "@/components/property/PropertyCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { PropertyCardSkeleton } from "@/components/ui/Skeleton";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { LinkButton } from "@/components/ui/Button";
import {
  getCities,
  listProperties,
  type PropertyListResult,
} from "@/lib/services/property";

async function Results({
  params,
  basePath,
  page,
  sort,
}: {
  params: SearchParamsRecord;
  basePath: string;
  page: number;
  sort: string;
}) {
  const result = await listProperties({
    q: normalizeQuery(params),
    sort,
    page,
    limit: 9,
  });
  return <ResultsGrid result={result} basePath={basePath} params={params} page={page} />;
}

function ResultsGrid({
  result,
  basePath,
  params,
  page,
}: {
  result: PropertyListResult;
  basePath: string;
  params: SearchParamsRecord;
  page: number;
}) {
  void params;
  if (result.total === 0) {
    return (
      <EmptyState
        kind="empty"
        title="No encontramos viviendas con esos filtros"
        description="Prueba ampliar el rango de precios, quitar algunas características o revisar otra ciudad."
        action={
          <LinkButton href="/viviendas" variant="outline">
            Ver todas las viviendas
          </LinkButton>
        }
      />
    );
  }
  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {result.items.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>
      <Pagination
        className="mt-10"
        current={page}
        total={result.totalPages}
        basePath={basePath}
        params={params}
      />
    </>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}

export async function ViviendasListing({
  searchParams,
  basePath = "/viviendas",
  forced = {},
  intro,
  title,
  description,
}: {
  searchParams: Record<string, string | string[] | undefined>;
  basePath?: string;
  forced?: SearchParamsRecord;
  intro?: React.ReactNode;
  title?: string;
  description?: string;
}) {
  const merged = { ...searchParams, ...forced } as SearchParamsRecord;
  const page = Math.max(
    1,
    Math.min(100, Number(searchParams.page ?? 1) || 1)
  );
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : "relevancia";
  const cities = await getCities();

  const activeCount = Object.entries(merged).filter(([k, v]) => v && k !== "page" && k !== "sort").length;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          {
            label: title ?? "Viviendas",
            ...(basePath && basePath !== "/viviendas" ? { href: "/viviendas" } : {}),
          },
        ]}
      />

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
            {title ?? "Viviendas en venta y arrendamiento"}
          </h1>
          {description && <p className="mt-2 max-w-2xl text-ink-500">{description}</p>}
        </div>
        <div className="flex items-center gap-3">
          <MobileFiltersSheet cities={cities} current={merged} activeCount={activeCount} />
          <SortSelect current={sort} basePath={basePath} />
        </div>
      </div>

      {intro && <div className="mt-8">{intro}</div>}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <FilterSidebar current={merged} cities={cities} />
          </div>
        </aside>

        <section aria-label="Resultados de viviendas">
          <Suspense fallback={<SkeletonGrid />}>
            <Results
              params={merged}
              basePath={basePath}
              page={page}
              sort={sort}
            />
          </Suspense>
        </section>
      </div>
    </div>
  );
}