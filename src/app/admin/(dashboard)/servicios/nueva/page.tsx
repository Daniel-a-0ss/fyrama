import { RealEstateServiceForm } from "@/components/admin/RealEstateServiceForm";

export const metadata = { title: "Nuevo servicio inmobiliario · Fyrama" };

export default function NuevoServicioInmobiliarioPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900">
          Nuevo servicio inmobiliario
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Se mostrará en /servicios-inmobiliarios y en el menú si está visible.
        </p>
      </div>
      <RealEstateServiceForm initial={{}} />
    </div>
  );
}
