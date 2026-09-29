import { requireAuth } from "@/lib/auth/session";
import { generateTotpSecret, totpUri } from "@/lib/security/totp";
import { ok, fail, handle, unauthorizedMessage } from "@/lib/api";

export const runtime = "nodejs";

async function doSetup(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.user) return unauthorizedMessage();
  if (auth.user.totpEnabled) {
    return fail(409, "ALREADY_ENABLED", "La verificación en dos pasos ya está activa.");
  }
  const secret = generateTotpSecret();
  return ok({
    secret,
    uri: totpUri(secret, auth.user.email, "Fyrama"),
  });
}

export async function GET(request: Request) {
  return handle(() => doSetup(request));
}

export const POST = () => fail(405, "METHOD_NOT_ALLOWED", "Usa GET.");
export const PUT = () => fail(405, "METHOD_NOT_ALLOWED", "Usa GET.");
export const PATCH = () => fail(405, "METHOD_NOT_ALLOWED", "Usa GET.");
export const DELETE = () => fail(405, "METHOD_NOT_ALLOWED", "Usa GET.");