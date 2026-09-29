/**
 * Sanitización y validación de texto de entrada.
 *
 * Fyrama nunca renderiza HTML sin escapar (React escapa por defecto y el contenido
 * de artículos usa markdown sin html sin escapar react-markdown). Estas funciones
 * eliminan caracteres de control e imponen límites de longitud en backend.
 */

export function sanitizeText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  let out = value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[\r\n]+/g, " ")
    .trim();
  if (out.length > maxLength) out = out.slice(0, maxLength);
  return out;
}

export function sanitizeMultiline(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  let out = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
  if (out.length > maxLength) out = out.slice(0, maxLength);
  return out;
}

/** Detección básica de payloads que intentan inyectar HTML/scripts. */
export function looksLikeHtmlInjection(value: string): boolean {
  return /<\s*\/?\s*(script|iframe|object|embed|style|form|img|svg|link|meta)/i.test(
    value
  );
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}