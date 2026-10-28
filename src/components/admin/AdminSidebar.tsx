"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, ClipboardList, Gauge, Images, Inbox, KeyRound, LogOut, MessageSquareQuote, Newspaper, Scale, Settings, ShieldCheck, Users } from "lucide-react";
import { api, errorMessage } from "@/lib/client/api";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: Gauge },
  { href: "/admin/viviendas", label: "Inmuebles", icon: ClipboardList },
  { href: "/admin/contenido", label: "Contenido", icon: Newspaper },
  { href: "/admin/asesoria", label: "Asesoría jurídica", icon: Scale },
  { href: "/admin/servicios", label: "Servicios inmobiliarios", icon: Building2 },
  { href: "/admin/opiniones", label: "Opiniones", icon: MessageSquareQuote },
  { href: "/admin/media", label: "Medios", icon: Images },
  { href: "/admin/solicitudes", label: "Solicitudes", icon: Inbox },
  { href: "/admin/auditoria", label: "Auditoría", icon: ShieldCheck },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/seguridad", label: "Seguridad", icon: KeyRound },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

export function AdminSidebar({
  userName,
  userEmail,
  userRole,
  counts,
  onClose,
}: {
  userName: string;
  userEmail: string;
  userRole: string;
  counts?: { requests: number; reviews: number };
  onClose?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  async function logout() {
    setLoggingOut(true);
    setError("");
    try {
      await api("/api/auth/logout", { method: "POST" });
      router.replace("/admin/login");
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
      setLoggingOut(false);
    }
  }

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-bone-200 bg-white">
      <div className="border-b border-bone-200 px-6 py-5">
        <Link href="/admin" onClick={onClose} className="font-display text-xl font-semibold tracking-tight text-pine-950">
          fyrama<span className="text-gold-600">.</span>{" "}
          <span className="text-sm font-normal text-ink-400">Admin</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Panel administrativo">
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const badge =
            item.href === "/admin/solicitudes"
              ? counts?.requests
              : item.href === "/admin/opiniones"
                ? counts?.reviews
                : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              prefetch
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "flex items-center gap-3 rounded-xl bg-pine-950 px-3 py-2.5 text-sm font-medium text-bone-50"
                  : "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-600 transition-colors hover:bg-pine-50 hover:text-pine-900"
              }
            >
              <item.icon className={active ? "size-4.5 text-gold-500" : "size-4.5 text-ink-400"} aria-hidden />
              <span className="flex-1">{item.label}</span>
              {badge ? (
                <span className="rounded-full bg-gold-500 px-2 py-0.5 text-[11px] font-semibold text-pine-950">
                  {badge > 99 ? "99+" : badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-bone-200 p-4">
        {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
        <p className="truncate text-sm font-semibold text-ink-800">{userName}</p>
        <p className="truncate text-xs text-ink-400">{userEmail}</p>
        <span className="mt-2 inline-block rounded-full bg-pine-100 px-2.5 py-0.5 text-xs font-medium text-pine-800">
          {userRole === "ADMIN" ? "Administrador" : "Editor"}
        </span>
        <button
          type="button"
          onClick={logout}
          disabled={loggingOut}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-ink-900/10 px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-bone-100 disabled:opacity-50"
        >
          {loggingOut ? "Saliendo…" : (
            <>
              <LogOut className="size-4" aria-hidden />
              Cerrar sesión
            </>
          )}
        </button>
      </div>
    </aside>
  );
}