import { prisma } from "@/lib/prisma";
import { contactLimiter } from "@/lib/security/rate-limit";
import { contactSchema } from "@/lib/validation/schemas";
import { ok, fail, failValidation, handle } from "@/lib/api";
import { getClientIp } from "@/lib/utils";

export const runtime = "nodejs";

async function doContact(request: Request) {
  const ip = getClientIp(request.headers);

  if (!contactLimiter.allow(ip ?? "unknown")) {
    return fail(
      429,
      "RATE_LIMITED",
      "Has enviado demasiados mensajes. Intenta nuevamente en unos minutos."
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "BAD_REQUEST", "Solicitud no válida.");
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return failValidation(parsed.error);

  const data = parsed.data;

  // Honeypot: si un bot rellenó `company`, respondemos éxito sin guardar nada.
  if (data.company && data.company.length > 0) {
    return ok({ received: true });
  }

  const { name, email } = data;
  const normalized = {
    type: data.type,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: data.phone?.trim() || null,
    message: data.message.trim(),
    propertyId: data.propertyId || null,
    legalTopic: data.legalTopic || null,
    contactPreference: data.contactPreference || null,
    ipAddress: ip,
  };

  await prisma.contactRequest.create({ data: normalized });

  return ok({ received: true });
}

export async function POST(request: Request) {
  return handle(() => doContact(request));
}

export const GET = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");
export const PUT = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");
export const PATCH = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");
export const DELETE = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");