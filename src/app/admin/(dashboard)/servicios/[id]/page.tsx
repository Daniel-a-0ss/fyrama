import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RealEstateServiceForm } from "@/components/admin/RealEstateServiceForm";

export const dynamic = "force-dynamic";

export default async function EditarServicioInmobiliarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await prisma.realEstateService
    .findUnique({ where: { id } })
    .catch(() => null);
  if (!service) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link
          href="/admin/servicios"
          className="text-sm font-medium text-pine-800 hover:underline"
        >
          ← Volver a servicios inmobiliarios
        </Link>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink-900">
          {service.title}
        </h1>
      </div>
      <RealEstateServiceForm
        initial={{
          id: service.id,
          title: service.title,
          slug: service.slug,
          description: service.description ?? "",
          content: service.content ?? "",
          icon: service.icon ?? "home",
          href: service.href ?? "",
          active: service.active,
          sortOrder: service.sortOrder,
        }}
      />
    </div>
  );
}
