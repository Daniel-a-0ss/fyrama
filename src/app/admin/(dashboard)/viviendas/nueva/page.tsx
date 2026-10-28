import { PropertyForm } from "@/components/admin/PropertyForm";

export const metadata = { title: "Nuevo inmueble · Fyrama" };

export default function NuevaViviendaPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900">Nuevo inmueble</h1>
        <p className="mt-1 text-sm text-ink-500">
          Crea un borrador y publícalo cuando esté completo.
        </p>
      </div>
      <PropertyForm initial={{}} isEdit={false} />
    </div>
  );
}