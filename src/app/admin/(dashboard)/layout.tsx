import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSessionFromCookies } from "@/lib/auth/session";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = {
  title: "Panel administrativo · Fyrama",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSessionFromCookies();
  if (!session) redirect("/admin/login");

  return (
    <AdminShell
      userName={session.user.name}
      userEmail={session.user.email}
      userRole={session.user.role}
    >
      {children}
    </AdminShell>
  );
}