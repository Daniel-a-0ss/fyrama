import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { requireAdmin } from "@/lib/auth/admin";
import { userSchema } from "@/lib/validation/schemas";
import { ok, fail, failValidation, handle } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { getClientIp, getClientUserAgent } from "@/lib/utils";

export const runtime = "nodejs";

async function doList(request: Request) {
  const guard = await requireAdmin(request, { role: "ADMIN" });
  if (!guard.user) return guard.error;

  const users = await prisma.user.findMany({
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
  });
  return ok({ users });
}

async function doCreate(request: Request) {
  const guard = await requireAdmin(request, { role: "ADMIN" });
  if (!guard.user) return guard.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "BAD_REQUEST", "Solicitud no válida.");
  }
  const parsed = userSchema.safeParse(body);
  if (!parsed.success) return failValidation(parsed.error);
  const d = parsed.data;

  const exists = await prisma.user.findFirst({
    where: { email: d.email.trim().toLowerCase() },
  });
  if (exists) return fail(409, "EMAIL_IN_USE", "Ya existe un usuario con ese correo.");

  const user = await prisma.user.create({
    data: {
      email: d.email.trim().toLowerCase(),
      name: d.name.trim(),
      passwordHash: await hashPassword(d.password),
      role: d.role,
    },
  });

  await logAudit({
    action: "CREATE_USER",
    userId: guard.user.id,
    ipAddress: getClientIp(request.headers),
    userAgent: getClientUserAgent(request.headers),
    entityType: "user",
    entityId: user.id,
    details: { email: user.email, role: user.role },
  });

  return ok(
    { id: user.id, email: user.email, name: user.name, role: user.role, active: user.active },
    201
  );
}

export async function GET(request: Request) {
  return handle(() => doList(request));
}
export async function POST(request: Request) {
  return handle(() => doCreate(request));
}