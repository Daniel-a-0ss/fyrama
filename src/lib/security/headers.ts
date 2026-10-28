const isProduction = () => process.env.NODE_ENV === "production";

/**
 * Cabeceras de seguridad aplicadas a TODAS las respuestas (ver src/middleware.ts).
 * En desarrollo se relajan para no bloquear React DevTools ni source maps.
 * En producción se usa nonce por petición (ver middleware.ts) para cumplir CSP.
 */
export function getSecurityHeaders(_nonce?: string): Record<string, string> {
  const csp = isProduction()
    ? [
        "default-src 'self'",
        // Sin nonce. Next.js hornea los scripts de hidratación de las páginas
        // estáticas en el build, sin petición de la que sacar un nonce, y al
        // incluir un nonce el navegador IGNORA 'unsafe-inline' y los bloquea:
        // la página se ve pero el JS no corre (login del admin muerto).
        // 'unsafe-inline' es el único valor que funciona con prerender.
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "frame-src 'self'",
        "media-src 'self' blob:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'self'",
        "upgrade-insecure-requests",
      ].join("; ")
    : [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "frame-src 'self'",
        "object-src 'none'",
      ].join("; ");

  return {
    "Content-Security-Policy": csp,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-XSS-Protection": "0",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    ...(isProduction()
      ? {
          "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
        }
      : {}),
  };
}