import { clearPending2faCookieHeader } from "@/lib/auth/twoFa";
import { assertMutationSecurity } from "@/lib/security/csrf";
import { ok, fail, handle } from "@/lib/api";

export const runtime = "nodejs";

async function doCancel() {
  const response = ok({ cancelled: true });
  response.headers.set("Set-Cookie", clearPending2faCookieHeader());
  return response;
}

export async function POST(request: Request) {
  const denied = assertMutationSecurity(request);
  if (denied) return denied;
  return handle(() => doCancel());
}

export const GET = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");
export const PUT = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");
export const PATCH = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");
export const DELETE = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");