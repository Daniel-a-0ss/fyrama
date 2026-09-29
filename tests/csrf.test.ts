import { describe, it, expect } from "vitest";
import { assertSameOrigin, hasCsrfToken } from "@/lib/security/csrf";

function req(url: string, headers: Record<string, string> = {}) {
  return new Request(url, { headers });
}

describe("assertSameOrigin", () => {
  it("acepta el mismo host aunque el esquema difiera (TLS)", () => {
    expect(
      assertSameOrigin(req("https://fyrama.com/admin", { origin: "http://fyrama.com" }))
    ).toBe(true);
  });

  it("acepta host idéntico por Origin", () => {
    expect(
      assertSameOrigin(req("https://fyrama.com/admin", { origin: "https://fyrama.com" }))
    ).toBe(true);
  });

  it("rechaza origine diferente", () => {
    expect(
      assertSameOrigin(req("https://fyrama.com/admin", { origin: "https://evil.com" }))
    ).toBe(false);
  });

  it("usa Referer cuando no hay Origin", () => {
    expect(
      assertSameOrigin(
        req("https://fyrama.com/api/admin/x", { referer: "https://fyrama.com/admin" })
      )
    ).toBe(true);
  });

  it("rechaza sin Origin ni Referer", () => {
    expect(assertSameOrigin(req("https://fyrama.com/api/admin/x"))).toBe(false);
  });

  it("rechaza Referer inválido", () => {
    expect(
      assertSameOrigin(req("https://fyrama.com/api/admin/x", { referer: ":://:" }))
    ).toBe(false);
  });
});

describe("hasCsrfToken", () => {
  it("acepta el token de sesión", () => {
    expect(hasCsrfToken(req("http://x.test", { "x-fyrama-csrf": "fyrama-validated" }))).toBe(
      true
    );
  });

  it("rechaza cabecera ausente o incorrecta", () => {
    expect(hasCsrfToken(req("http://x.test"))).toBe(false);
    expect(hasCsrfToken(req("http://x.test", { "x-fyrama-csrf": "otro" }))).toBe(false);
  });
});