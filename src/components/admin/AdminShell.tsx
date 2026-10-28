"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";

export function AdminShell({
  userName,
  userEmail,
  userRole,
  counts,
  children,
}: {
  userName: string;
  userEmail: string;
  userRole: string;
  counts?: { requests: number; reviews: number };
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-dvh bg-bone-50">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-40 flex size-10 items-center justify-center rounded-xl border border-bone-200 bg-white shadow-sm transition-colors hover:bg-bone-50 lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="size-5 text-ink-700" aria-hidden />
      </button>

      <div
        className={`fixed inset-0 z-40 bg-ink-950/40 transition-opacity lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <AdminSidebar
          userName={userName}
          userEmail={userEmail}
          userRole={userRole}
          counts={counts}
          onClose={() => setOpen(false)}
        />
      </aside>

      <main className="min-w-0 flex-1 overflow-x-hidden pt-14 lg:pt-0">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}