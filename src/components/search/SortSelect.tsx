"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, Loader2 } from "lucide-react";
import { SORT_OPTIONS } from "@/lib/constants";

export function SortSelect({
  current,
  basePath,
}: {
  current: string;
  basePath: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <label className="flex w-full min-w-0 items-center gap-2 text-sm text-ink-600">
      {pending ? (
        <Loader2 className="size-4 shrink-0 animate-spin text-pine-700" aria-hidden />
      ) : (
        <ArrowUpDown className="size-4 shrink-0 text-ink-400" aria-hidden />
      )}
      <span className="sr-only">Ordenar por</span>
      <select
        value={current}
        disabled={pending}
        aria-busy={pending || undefined}
        onChange={(e) => {
          const url = new URL(basePath, "http://localhost");
          url.searchParams.set("sort", e.target.value);
          startTransition(() => {
            router.replace(url.pathname + url.search);
          });
        }}
        className="w-full min-w-0 flex-1 cursor-pointer rounded-lg border border-ink-900/12 bg-white px-3 py-2 text-sm font-medium text-ink-900 shadow-sm transition-opacity focus:outline-none focus:ring-2 focus:ring-pine-600/25 disabled:cursor-wait disabled:opacity-60"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            Ordenar: {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
