import { requireAuth } from "@/lib/auth/session";
import { ok, fail, handle, unauthorizedMessage } from "@/lib/api";

export const runtime = "nodejs";

async function doStatus(request: Request) {
  const auth = await requireAuth(request);
  if (!auth.user) return unauthorizedMessage();
  return ok({
    enabled: auth.user.totpEnabled,
    confirmedAt: auth.user.totpConfirmedAt ?? null,
  });
}

export async function GET(request: Request) {
  return handle(() => doStatus(request));
}

export const POST = () => fail(405, "METHOD_NOT_ALLOWED", "Usa GET.");
export const PUT = () => fail(405, "METHOD_NOT_ALLOWED", "Usa GET.");
export const PATCH = () => fail(405, "METHOD_NOT_ALLOWED", "Usa GET.");
export const DELETE = () => fail(405, "METHOD_NOT_ALLOWED", "Usa GET.");