"use client";

import { useRouter } from "next/navigation";
import { ArrowUpDown } from "lucide-react";
import { SORT_OPTIONS } from "@/lib/constants";

export function SortSelect({
  current,
  basePath,
}: {
  current: string;
  basePath: string;
}) {
  const router = useRouter();
  return (
    <label className="flex w-full min-w-0 items-center gap-2 text-sm text-ink-600">
      <ArrowUpDown className="size-4 text-ink-400" aria-hidden />
      <span className="sr-only">Ordenar por</span>
      <select
        value={current}
        onChange={(e) => {
          const url = new URL(basePath, "http://localhost");
          url.searchParams.set("sort", e.target.value);
          router.replace(url.pathname + url.search);
        }}
        className="w-full min-w-0 flex-1 cursor-pointer rounded-lg border border-ink-900/12 bg-white px-3 py-2 text-sm font-medium text-ink-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-pine-600/25"
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