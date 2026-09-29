import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ServiceForm } from "@/components/admin/ServiceForm";

export default async function EditarServicioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await prisma.legalService.findUnique({ where: { id } });
  if (!service) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link href="/admin/asesoria" className="text-sm font-medium text-pine-800 hover:underline">
          ← Volver a asesoría
        </Link>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink-900">{service.title}</h1>
      </div>
      <ServiceForm
        initial={{
          id: service.id,
          title: service.title,
          slug: service.slug,
          description: service.description ?? "",
          content: service.content ?? "",
          icon: service.icon ?? "scale",
          active: service.active,
          sortOrder: service.sortOrder,
        }}
      />
    </div>
  );
}