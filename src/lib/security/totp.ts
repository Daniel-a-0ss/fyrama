import { createHmac, randomBytes, timingSafeEqual } from "crypto";

/**
 * TOTP (RFC 6238) — HMAC-SHA1, 6 dígitos, ventana 30 s, ±1 paso.
 * Sin dependencias externas: implementado sobre node:crypto.
 */

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const STEP_SECONDS = 30;
const WINDOW_STEPS = 1;

function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32[(value >>> (bits - 5)) & 0x1f];
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32[(value << (5 - bits)) & 0x1f];
  return out;
}

function base32Decode(input: string): Buffer {
  const clean = input.replace(/=+$/, "").toUpperCase().replace(/\s+/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of clean) {
    const idx = BASE32.indexOf(char);
    if (idx === -1) throw new Error("Secret inválido: no es base32.");
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/** Genera una clave TOTP base32 de 160 bits (32 caracteres). */
export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

function hotp(secret: Buffer, counter: bigint): string {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(counter);
  const h = createHmac("sha1", secret).update(buf).digest();
  const offset = h[h.length - 1] & 0x0f;
  const binary =
    ((h[offset] & 0x7f) << 24) |
    ((h[offset + 1] & 0xff) << 16) |
    ((h[offset + 2] & 0xff) << 8) |
    (h[offset + 3] & 0xff);
  return (binary % 1_000_000).toString().padStart(6, "0");
}

/** Genera el código TOTP actual para un secret (timestamp en ms). */
export function generateTotpCode(secret: string, timestampMs = Date.now()): string {
  const decoded = base32Decode(secret);
  const counter = Math.floor(timestampMs / 1000 / STEP_SECONDS);
  return hotp(decoded, BigInt(counter));
}

/** Verifica un código dentro de la ventana (±1 paso = ±30 s). */
export function verifyTotp(
  secret: string,
  token: string,
  timestampMs = Date.now()
): boolean {
  if (!/^\d{6}$/.test(token)) return false;
  const counter = Math.floor(timestampMs / 1000 / STEP_SECONDS);
  for (let i = -WINDOW_STEPS; i <= WINDOW_STEPS; i++) {
    const candidate = hotp(base32Decode(secret), BigInt(counter + i));
    if (timingSafeEqual(Buffer.from(candidate), Buffer.from(token))) return true;
  }
  return false;
}

/** Construye el URI para apps autenticadoras (otpauth://). */
export function totpUri(secret: string, account: string, issuer = "Fyrama"): string {
  const label = `${encodeURIComponent(issuer)}:${encodeURIComponent(account)}`;
  const query = `secret=${encodeURIComponent(secret)}&issuer=${encodeURIComponent(
    issuer
  )}&algorithm=SHA1&digits=6&period=30`;
  return `otpauth://totp/${label}?${query}`;
}

/** Genera códigos de recuperación formato XXXX-XXXX. */
export function generateRecoveryCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const base32 = base32Encode(randomBytes(5)); // 40 bits → 8 caracteres
    codes.push(`${base32.slice(0, 4)}-${base32.slice(4, 8)}`);
  }
  return codes;
}