import { TwoFactorForm } from "@/components/admin/TwoFactorForm";

export const metadata = { title: "Seguridad · Fyrama" };

export default function AdminSeguridadPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900">Seguridad</h1>
        <p className="mt-1 text-sm text-ink-500">
          Protege tu cuenta con verificación en dos pasos (TOTP) y códigos de recuperación.
        </p>
      </div>
      <TwoFactorForm />
    </div>
  );
}