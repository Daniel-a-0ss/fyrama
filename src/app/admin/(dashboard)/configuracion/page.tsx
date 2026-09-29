import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";
import { mergeSettings, DEFAULT_SETTINGS } from "@/lib/services/settings";

export const metadata = { title: "Configuración · Fyrama" };

export default async function AdminConfiguracionPage() {
  const db = await prisma.siteSetting.findMany();
  const settings: Record<string, string> = {};
  for (const r of db) settings[r.key] = r.value;
  const merged = mergeSettings(settings);
  const defaults = DEFAULT_SETTINGS;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900">Configuración</h1>
        <p className="mt-1 text-sm text-ink-500">Datos de contacto, SEO y aviso legal del sitio.</p>
      </div>

      <SettingsForm initial={merged} />
      <div className="rounded-2xl border border-dotted border-bone-300 bg-white p-5 text-xs text-ink-400">
        <p className="mb-1 font-medium text-ink-600">Valores por defecto aplicados automáticamente:</p>
        <ul className="space-y-0.5">
          {Object.entries(defaults).map(([k, v]) => (
            <li key={k} className="truncate">
              <span className="font-mono text-pine-800">{k}</span> → <span className="text-ink-500">{v}</span>
            </li>
          ))}
        </ul>
      </div>

      <ChangePasswordForm />
    </div>
  );
}