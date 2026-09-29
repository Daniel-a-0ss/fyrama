import { prisma } from "@/lib/prisma";
import { ArticleForm } from "@/components/admin/ArticleForm";

export const metadata = { title: "Nuevo artículo · Fyrama" };

export default async function NuevoArticuloPage() {
  const categories = await prisma.articleCategory.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900">Nuevo artículo</h1>
        <p className="mt-1 text-sm text-ink-500">
          Escribe en Markdown. Solo se publica en el sitio cuando lo marcas como “Publicado”.
        </p>
      </div>
      <ArticleForm initial={{ categories }} />
    </div>
  );
}