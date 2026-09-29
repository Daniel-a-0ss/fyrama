import { Role } from "@prisma/client";
import { assertSameOrigin } from "@/lib/security/csrf";
import { requireAuth, type SessionUser } from "@/lib/auth/session";

export type AdminResult = { user: SessionUser } | { user: null; error: Response };

/**
 * Protección combinada para endpoints administrativos:
 *  1. CSRF: verifica origen/CSRF header (cookies + SameSite=Strict).
 *  2. Autenticación de sesión.
 *  3. Autorización por rol — SIEMPRE en backend.
 */
export async function requireAdmin(
  request: Request,
  options?: { role?: Role }
): Promise<AdminResult> {
  const safeOrigin =
    assertSameOrigin(request) ||
    request.headers.get("x-fyrama-csrf") === "fyrama-validated";
  if (!safeOrigin) {
    return {
      user: null,
      error: Response.json(
        { ok: false, error: { code: "CSRF_FAILED", message: "Solicitud no válida." } },
        { status: 403 }
      ),
    };
  }
  const auth = await requireAuth(request, options);
  if (auth.user === null) return { user: null, error: auth.error };
  return { user: auth.user };
}

export { Role };