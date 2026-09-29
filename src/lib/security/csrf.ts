/** Cabeceras que deben venir del mismo origen (protección CSRF defensa en profundidad). */

function extractOrigin(request: Request): string | null {
  const origin = request.headers.get("origin");
  if (origin) return origin;
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).origin;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Verifica que la petición provenga del mismo origen.
 * Compara el host del peticionario (Origin/Referer) con el host del servidor
 * sin depender del esquema (http/https), para no romper detrás de TLS.
 * Combinado con cookies SameSite=Strict es una mitigación CSRF sólida.
 */
export function assertSameOrigin(request: Request): boolean {
  const origin = extractOrigin(request);
  if (!origin) return false;
  try {
    const parsed = new URL(origin);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    const self = new URL(request.url);
    return parsed.host === self.host;
  } catch {
    return false;
  }
}

/** Verifica que el navegador envíe la cabecera CSRF para acciones no idempotentes. */
export function hasCsrfToken(request: Request): boolean {
  return request.headers.get("x-fyrama-csrf") === "fyrama-validated";
}

/**
 * Defensa en profundidad para mutaciones sensibles: exige mismo origen + cabecera CSRF.
 * Devuelve una Response 403 lista para devolver, o null si la petición es válida.
 */
export function assertMutationSecurity(request: Request): Response | null {
  if (!assertSameOrigin(request) || !hasCsrfToken(request)) {
    return Response.json(
      {
        ok: false,
        error: {
          code: "FORBIDDEN",
          message: "Solicitud no autorizada.",
        },
      },
      { status: 403 }
    );
  }
  return null;
}