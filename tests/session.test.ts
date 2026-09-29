import { describe, it, expect, afterEach } from "vitest";
import {
  clearSessionCookieHeader,
  hashSessionToken,
  sessionCookieHeader,
  tokenFromRequest,
} from "@/lib/auth/session";
import { SESSION_COOKIE } from "@/lib/constants";

function req(headers: Record<string, string>) {
  return new Request("http://localhost:3000/api/anything", { headers });
}

describe("tokenFromRequest", () => {
  it("extrae el token sin dar peso a otras cookies", () => {
    const r = req({
      cookie: `pref=dark; ${SESSION_COOKIE}=abc123; otra=1`,
    });
    expect(tokenFromRequest(r)).toBe("abc123");
  });

  it("decodifica el token URL-encoded", () => {
    expect(tokenFromRequest(req({ cookie: `${SESSION_COOKIE}=a%2Bb` }))).toBe("a+b");
  });

  it("devuelve null sin cookie de sesión", () => {
    expect(tokenFromRequest(req({ cookie: "pref=dark" }))).toBeNull();
    expect(tokenFromRequest(new Request("http://localhost:3000/api/x"))).toBeNull();
  });
});

describe("hashSessionToken", () => {
  it("es determinista y de 64 hex", () => {
    const a = hashSessionToken("mi-token");
    const b = hashSessionToken("mi-token");
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });
});

function setNodeEnv(value: string) {
  (process.env as { NODE_ENV?: string }).NODE_ENV = value;
}

describe("sessionCookieHeader", () => {
  afterEach(() => {
    setNodeEnv("test");
  });

  it("incluye flags de seguridad en desarrollo", () => {
    const h = sessionCookieHeader("tok", 43200);
    expect(h).toContain(`${SESSION_COOKIE}=tok`);
    expect(h).toContain("Path=/");
    expect(h).toContain("HttpOnly");
    expect(h).toContain("SameSite=Strict");
    expect(h).toContain("Max-Age=43200");
  });

  it("no agrega Secure en entorno de pruebas", () => {
    expect(sessionCookieHeader("tok", 43200)).not.toContain("Secure");
  });

  it("agrega Secure en producción", () => {
    setNodeEnv("production");
    expect(sessionCookieHeader("tok", 43200)).toContain("Secure");
  });
});

describe("clearSessionCookieHeader", () => {
  afterEach(() => {
    setNodeEnv("test");
  });

  it("expira la cookie", () => {
    expect(clearSessionCookieHeader()).toContain("Max-Age=0");
    setNodeEnv("production");
    expect(clearSessionCookieHeader()).toContain("Secure");
  });
});