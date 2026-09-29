import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSecurityHeaders } from "@/lib/security/headers";

/**
 * Middleware global:
 * - Genera un nonce único por petición y lo propaga a Server Components vía `x-nonce`.
 * - Aplica cabeceras de seguridad (CSP con nonce en producción, etc.).
 * - La protección de /admin se hace REAL en backend: server components y
 *   route handlers validan la sesión. Nunca se confía solo en este archivo.
 */
export function middleware(request: NextRequest) {
  const nonceArray = new Uint8Array(16);
  crypto.getRandomValues(nonceArray);
  const nonce = btoa(String.fromCharCode(...nonceArray));

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  const headers = getSecurityHeaders(nonce);
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: [
    /*
     * Todas las rutas salvo archivos estáticos, imágenes y API de font loading.
     */
    "/((?!_next/static|_next/image|media/|favicon.ico|icon.svg|manifest.json|robots.txt|sitemap.xml).*)",
  ],
};