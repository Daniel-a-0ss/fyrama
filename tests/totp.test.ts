import { describe, it, expect } from "vitest";
import {
  generateTotpSecret,
  generateTotpCode,
  verifyTotp,
  generateRecoveryCodes,
  totpUri,
} from "@/lib/security/totp";

// Vector de test RFC 6238 (apéndice B):
//   clave ASCII "12345678901234567890" = base32 "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ"
//   en el instante T = 59 (59000 s desde epoch) el código es 287082.
const SECRET = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";
// RFC 6238: 59 segundos desde epoch → T = floor(59/30) = 1 → código 287082.
const T_59_SEC = 59_000;

describe("TOTP (RFC 6238)", () => {
  it("genera el código del vector oficial (T=59 → 287082)", () => {
    expect(generateTotpCode(SECRET, T_59_SEC)).toBe("287082");
  });

  it("acepta el código en la ventana actual (±30 s)", () => {
    expect(verifyTotp(SECRET, "287082", T_59_SEC)).toBe(true);
  });

  it("rechaza un código incorrecto", () => {
    expect(verifyTotp(SECRET, "000000", T_59_SEC)).toBe(false);
  });

  it("acepta códigos un paso fuera de la ventana (±1 paso)", () => {
    const codePrev = generateTotpCode(SECRET, T_59_SEC - 30_000);
    const codeNext = generateTotpCode(SECRET, T_59_SEC + 30_000);
    expect(verifyTotp(SECRET, codePrev, T_59_SEC)).toBe(true);
    expect(verifyTotp(SECRET, codeNext, T_59_SEC)).toBe(true);
  });

  it("rechaza códigos dos pasos fuera de la ventana", () => {
    const base = 200_000; // counter 6
    expect(verifyTotp(SECRET, generateTotpCode(SECRET, base + 60_000), base)).toBe(false);
    expect(verifyTotp(SECRET, generateTotpCode(SECRET, base - 60_000), base)).toBe(false);
  });

  it("genera claves base32 de 32 caracteres (160 bits)", () => {
    const s = generateTotpSecret();
    expect(s).toMatch(/^[A-Z2-7]{32}$/);
  });

  it("hace roundtrip con una clave generada", () => {
    const s = generateTotpSecret();
    const code = generateTotpCode(s);
    expect(verifyTotp(s, code)).toBe(true);
    expect(verifyTotp(s, "999999")).toBe(false);
  });

  it("rechaza formatos no numéricos", () => {
    expect(verifyTotp(SECRET, "abcdef", T_59_SEC)).toBe(false);
    expect(verifyTotp(SECRET, "12345", T_59_SEC)).toBe(false);
    expect(verifyTotp(SECRET, "1234567", T_59_SEC)).toBe(false);
  });

  it("genera códigos de recuperación con formato XXXX-XXXX y sin duplicados", () => {
    const codes = generateRecoveryCodes(8);
    expect(codes).toHaveLength(8);
    for (const c of codes) expect(c).toMatch(/^[A-Z2-7]{4}-[A-Z2-7]{4}$/);
    expect(new Set(codes).size).toBe(8);
  });

  it("construye la URI otpauth con issuer y label", () => {
    const uri = totpUri("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567", "admin@fyrama.co");
    expect(uri).toContain("otpauth://totp/Fyrama:admin%40fyrama.co");
    expect(uri).toContain("secret=ABCDEFGHIJKLMNOPQRSTUVWXYZ234567");
    expect(uri).toContain("issuer=Fyrama");
    expect(uri).toContain("period=30");
  });
});