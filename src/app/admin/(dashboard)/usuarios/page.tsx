import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UsersManager } from "@/components/admin/UsersManager";
import { getSessionFromCookies } from "@/lib/auth/session";

export const metadata = { title: "Usuarios · Fyrama" };

export default async function AdminUsuariosPage() {
  const [users, session] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        lastLoginAt: true,
        createdAt: true,
        _count: { select: { auditLogs: true } },
      },
    }),
    getSessionFromCookies(),
  ]);

  if (session?.user.role !== "ADMIN") redirect("/admin");

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900">Usuarios</h1>
        <p className="mt-1 text-sm text-ink-500">
          Gestiona el acceso al panel. Solo el rol Administrador ve y edita esta sección.
        </p>
      </div>
      <UsersManager
        initial={users.map((u) => ({
          ...u,
          lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
          createdAt: u.createdAt.toISOString(),
        }))}
        currentUserId={session?.user.id ?? ""}
      />
    </div>
  );
}