import { getSessionFromRequest } from "@/lib/auth/session";
import { ok, fail, handle } from "@/lib/api";

export const runtime = "nodejs";

async function doMe(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return ok({ user: null });
  return ok({
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
    },
  });
}

export async function GET(request: Request) {
  return handle(() => doMe(request));
}

export const POST = () => fail(405, "METHOD_NOT_ALLOWED", "Usa GET.");