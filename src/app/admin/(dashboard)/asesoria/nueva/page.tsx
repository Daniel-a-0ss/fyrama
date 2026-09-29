import { ServiceForm } from "@/components/admin/ServiceForm";

export const metadata = { title: "Nuevo servicio · Fyrama" };

export default function NuevoServicioPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900">Nuevo servicio de asesoría</h1>
        <p className="mt-1 text-sm text-ink-500">Se mostrará en la página de asesoría jurídica si está visible.</p>
      </div>
      <ServiceForm initial={{}} />
    </div>
  );
}