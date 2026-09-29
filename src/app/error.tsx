"use client";

import { RotateCcw, ServerCrash } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bone-50 px-4 text-center">
      <span className="mb-5 inline-flex size-16 items-center justify-center rounded-full bg-pine-100 text-pine-800">
        <ServerCrash className="size-8" aria-hidden />
      </span>
      <h1 className="font-display text-2xl font-semibold text-ink-900">
        Algo salió mal
      </h1>
      <p className="mt-2 max-w-md text-ink-500">
        Tuvimos un inconveniente al cargar esta página. Inténtalo de nuevo;
        si el problema continúa, vuelve a intentarlo en unos minutos.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-pine-950 px-6 text-sm font-medium text-bone-50 hover:bg-pine-800"
      >
        <RotateCcw className="size-4" aria-hidden />
        Reintentar
      </button>
    </main>
  );
}