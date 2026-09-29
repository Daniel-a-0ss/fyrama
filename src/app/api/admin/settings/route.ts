import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/admin";
import { settingsSchema } from "@/lib/validation/schemas";
import { ok, fail, failValidation, handle } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { getClientIp, getClientUserAgent } from "@/lib/utils";

export const runtime = "nodejs";

async function doGet(request: Request) {
  const guard = await requireAdmin(request);
  if (!guard.user) return guard.error;

  const rows = await prisma.siteSetting.findMany();
  const settings: Record<string, string> = {};
  for (const r of rows) settings[r.key] = r.value;
  return ok({ settings });
}

async function doUpdate(request: Request) {
  const guard = await requireAdmin(request);
  if (!guard.user) return guard.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "BAD_REQUEST", "Solicitud no válida.");
  }
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) return failValidation(parsed.error);
  const values = parsed.data;

  await prisma.$transaction(
    Object.entries(values).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      })
    )
  );

  await logAudit({
    action: "UPDATE_SETTINGS",
    userId: guard.user.id,
    ipAddress: getClientIp(request.headers),
    userAgent: getClientUserAgent(request.headers),
    details: { keys: Object.keys(values).join(", ") },
  });

  return ok({ updated: Object.keys(values).length });
}

export async function GET(request: Request) {
  return handle(() => doGet(request));
}
export async function PUT(request: Request) {
  return handle(() => doUpdate(request));
}