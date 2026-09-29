import Link from "next/link";
import { Home, Search } from "lucide-react";
import { BrandMark } from "@/components/site/Logo";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bone-50 px-4 text-center">
      <BrandMark className="mb-6 size-14" />
      <p className="font-display text-7xl font-semibold tracking-tight text-pine-950">
        4<span className="text-gold-500">0</span>4
      </p>
      <h1 className="mt-4 font-display text-2xl font-semibold text-ink-900">
        Esta página no existe
      </h1>
      <p className="mt-2 max-w-md text-ink-500">
        La dirección que buscaste pudo haber cambiado o moverse. Vuelve al
        inicio o explora las viviendas disponibles.
      </p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-pine-950 px-6 text-sm font-medium text-bone-50 hover:bg-pine-800"
        >
          <Home className="size-4" aria-hidden />
          Ir al inicio
        </Link>
        <Link
          href="/viviendas"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-ink-900/15 px-6 text-sm font-medium text-ink-800 hover:bg-white"
        >
          <Search className="size-4" aria-hidden />
          Buscar viviendas
        </Link>
      </div>
    </main>
  );
}