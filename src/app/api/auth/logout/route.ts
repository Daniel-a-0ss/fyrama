import {
  clearSessionCookieHeader,
  destroySession,
  tokenFromRequest,
} from "@/lib/auth/session";
import { ok, fail, handle } from "@/lib/api";
import { logAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/utils";

export const runtime = "nodejs";

async function doLogout(request: Request) {
  const token = tokenFromRequest(request);
  const session = token
    ? await import("@/lib/auth/session").then((m) => m.getSessionByToken(token))
    : null;
  if (session) {
    await logAudit({
      action: "LOGOUT",
      userId: session.user.id,
      ipAddress: getClientIp(request.headers),
    }).catch(() => {});
  }
  await destroySession(token);
  const response = ok({ loggedOut: true });
  response.headers.set("Set-Cookie", clearSessionCookieHeader());
  return response;
}

export async function POST(request: Request) {
  return handle(() => doLogout(request));
}

export const GET = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");
export const PUT = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");
export const PATCH = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");
export const DELETE = () => fail(405, "METHOD_NOT_ALLOWED", "Usa POST.");