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
        title="No encontramos inmuebles con esos filtros"
        description="Prueba ampliar el rango de precios, quitar algunas características o revisar otra ciudad."
        action={
          <LinkButton href="/viviendas" variant="outline">
            Ver todas los inmuebles
          </LinkButton>
        }
      />
    );
  }
  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {result.items.map((p) => (
          <div key={p.id} className="min-w-0">
            <PropertyCard property={p} />
          </div>
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
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-36 sm:px-6 lg:px-8 lg:pt-40 2xl:pt-44">
      <Breadcrumbs
        items={[
          {
            label: title ?? "Inmuebles",
            ...(basePath && basePath !== "/viviendas" ? { href: "/viviendas" } : {}),
          },
        ]}
      />

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
        <div className="min-w-0">
          <h1 className="text-balance font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
            {title ?? "Inmuebles disponibles"}
          </h1>
          {description && <p className="mt-2 max-w-2xl text-ink-500">{description}</p>}
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto lg:shrink-0">
          <div className="sm:flex-1 lg:flex-none">
            <MobileFiltersSheet cities={cities} current={merged} activeCount={activeCount} />
          </div>
          <div className="sm:flex-1 lg:flex-none">
            <SortSelect current={sort} basePath={basePath} />
          </div>
        </div>
      </div>

      {intro && <div className="mt-8">{intro}</div>}

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-32 max-h-[calc(100vh-9rem)] overflow-y-auto pb-2 2xl:top-36">
            <FilterSidebar current={merged} cities={cities} />
          </div>
        </aside>

        <section aria-label="Resultados de inmuebles">
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