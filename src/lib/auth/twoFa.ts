import { createHmac, randomBytes } from "crypto";
import { PENDING_2FA_COOKIE, PENDING_2FA_MAX_AGE } from "@/lib/constants";

const signingKey = (): string =>
  process.env.SESSION_SECRET ??
  (process.env.NODE_ENV === "production"
    ? (() => {
        throw new Error("SESSION_SECRET es obligatorio en producción.");
      })()
    : "dev-insecure-signing-key-fyrama-2fa");

function sign(value: string): string {
  return createHmac("sha256", signingKey()).update(value).digest("hex").slice(0, 32);
}

/** Firma un payload arbitrario (validación de integridad). Útil para tests. */
export function encodePending2faRaw(payload: string): string {
  return `${payload}.${sign(payload)}`;
}

/** Crea el contenido firmado de la cookie pendiente 2FA. */
export function encodePending2fa(userId: string): string {
  const exp = Date.now() + PENDING_2FA_MAX_AGE * 1000;
  return encodePending2faRaw(`${userId}.${exp}`);
}

/** Decodifica y valida la cookie. Devuelve el userId si es válida, null si no. */
export function decodePending2fa(value: string): string | null {
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [userId, expStr, sig] = parts;
  if (!userId || !expStr || !sig) return null;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return null;
  const expected = sign(`${userId}.${exp}`);
  if (sig !== expected) return null;
  return userId;
}

/** Cookie header para pendiente 2FA (HttpOnly, SameSite=Strict, Secure en prod). */
export function pending2faCookieHeader(signedValue: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${PENDING_2FA_COOKIE}=${encodeURIComponent(signedValue)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${PENDING_2FA_MAX_AGE}${secure}`;
}

/** Borra la cookie pendiente 2FA. */
export function clearPending2faCookieHeader(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${PENDING_2FA_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}

/** Lee el userId desde la cookie pendiente en la Request. */
export function userIdFromPending2faRequest(request: Request): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  const match = header
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${PENDING_2FA_COOKIE}=`));
  if (!match) return null;
  const value = decodeURIComponent(match.slice(PENDING_2FA_COOKIE.length + 1));
  return decodePending2fa(value);
}

/** Token al azar para uso general (no relacionado con 2FA, pero útil para confirm flows). */
export const randomToken = () => randomBytes(24).toString("hex");
