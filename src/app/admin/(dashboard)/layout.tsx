import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSessionFromCookies } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = {
  title: "Panel administrativo · Fyrama",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const [session, newRequests, pendingReviews] = await Promise.all([
    getSessionFromCookies(),
    prisma.contactRequest.count({ where: { status: "NEW" } }),
    prisma.review.count({ where: { status: "PENDING" } }),
  ]);
  if (!session) redirect("/admin/login");

  return (
    <AdminShell
      userName={session.user.name}
      userEmail={session.user.email}
      userRole={session.user.role}
      counts={{ requests: newRequests, reviews: pendingReviews }}
    >
      {children}
    </AdminShell>
  );
}