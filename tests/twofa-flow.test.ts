import { describe, it, expect, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as verify2fa } from "@/app/api/auth/2fa/verify/route";
import { POST as cancel2fa } from "@/app/api/auth/2fa/cancel/route";
import { prisma } from "@/lib/prisma";
import { generateTotpCode } from "@/lib/security/totp";
import {
  loginLimiter,
  loginAttemptLimiter,
  totpVerifyLimiter,
  totpVerifyIpLimiter,
} from "@/lib/security/rate-limit";
import { encodePending2faRaw } from "@/lib/auth/twoFa";

const IP = "10.2.0.1";
const SECRET = "JBSWY3DPEHPK3PXP"; // "Hello!" en base32 → códigos deterministas por paso
const EMAIL = "admin@test.fyrama";

function req(path: string, init: RequestInit = {}): Request {
  return new Request(`http://localhost:3000${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      origin: "http://localhost:3000",
      "x-fyrama-csrf": "fyrama-validated",
      "x-real-ip": IP,
      ...(init.headers ?? {}),
    },
  });
}

function cookieValue(res: Response, name: string): string | null {
  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) return null;
  for (const part of setCookie.split(", ")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(`${name}=`)) {
      return decodeURIComponent(trimmed.slice(name.length + 1).split(";")[0]);
    }
  }
  return null;
}

describe("flujo 2FA", () => {
  beforeEach(async () => {
    await prisma.user.update({
      where: { email: EMAIL },
      data: {
        totpEnabled: true,
        totpSecret: SECRET,
        totpConfirmedAt: new Date(),
        recoveryCodes: null,
      },
    });
    loginLimiter.reset(`${EMAIL}:${IP}`);
    loginAttemptLimiter.reset("all:" + IP);
    totpVerifyLimiter.reset(EMAIL);
    totpVerifyIpLimiter.reset("all:" + IP);
  });

  async function pendingCookie(): Promise<string> {
    const res = await login(
      req("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: EMAIL, password: "AdminPrueba!2026" }),
      })
    );
    const value = cookieValue(res, "fyrama_2fa_pending");
    expect(value).not.toBeNull();
    return value!;
  }

  it("el login con 2FA activo no crea sesión y exige el código", async () => {
    const res = await login(
      req("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: EMAIL, password: "AdminPrueba!2026" }),
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.requires2FA).toBe(true);
    expect(cookieValue(res, "fyrama_2fa_pending")).not.toBeNull();
    expect(cookieValue(res, "fyrama_session")).toBeNull();
    expect(await prisma.session.count()).toBe(0);
  });

  it("completa el segundo paso con un código TOTP correcto", async () => {
    const pending = await pendingCookie();
    const code = generateTotpCode(SECRET);
    const res = await verify2fa(
      req("/api/auth/2fa/verify", {
        method: "POST",
        headers: { cookie: `fyrama_2fa_pending=${encodeURIComponent(pending)}` },
        body: JSON.stringify({ code }),
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.user.email).toBe(EMAIL);
    expect(cookieValue(res, "fyrama_session")).not.toBeNull();
    expect(cookieValue(res, "fyrama_2fa_pending")).toBe("");
  });

  it("rechaza un código incorrecto y vuelve a aceptar uno correcto", async () => {
    const pending = await pendingCookie();

    const bad = await verify2fa(
      req("/api/auth/2fa/verify", {
        method: "POST",
        headers: { cookie: `fyrama_2fa_pending=${encodeURIComponent(pending)}` },
        body: JSON.stringify({ code: "000000" }),
      })
    );
    expect(bad.status).toBe(401);
    const badBody = await bad.json();
    expect(badBody.error.code).toBe("INVALID_2FA_CODE");
    expect(cookieValue(bad, "fyrama_session")).toBeNull();

    const good = await verify2fa(
      req("/api/auth/2fa/verify", {
        method: "POST",
        headers: { cookie: `fyrama_2fa_pending=${encodeURIComponent(pending)}` },
        body: JSON.stringify({ code: generateTotpCode(SECRET) }),
      })
    );
    expect(good.status).toBe(200);
  });

  it("verifica un código de recuperación y lo consume (uso único)", async () => {
    const recovery = "AAAA-BBBB";
    await prisma.user.update({
      where: { email: EMAIL },
      data: { recoveryCodes: JSON.stringify([await bcrypt.hash(recovery, 4)]) },
    });
    const pending = await pendingCookie();

    // Primer uso: funciona y se consume.
    const first = await verify2fa(
      req("/api/auth/2fa/verify", {
        method: "POST",
        headers: { cookie: `fyrama_2fa_pending=${encodeURIComponent(pending)}` },
        body: JSON.stringify({ code: recovery }),
      })
    );
    expect(first.status).toBe(200);
    const user = await prisma.user.findUnique({ where: { email: EMAIL } });
    expect(user?.recoveryCodes).not.toBeNull();
    expect(JSON.parse(user!.recoveryCodes!)).toHaveLength(0);

    // Nuevo intento de login con el mismo código: rechazado.
    const pending2 = await pendingCookie();
    const second = await verify2fa(
      req("/api/auth/2fa/verify", {
        method: "POST",
        headers: { cookie: `fyrama_2fa_pending=${encodeURIComponent(pending2)}` },
        body: JSON.stringify({ code: recovery }),
      })
    );
    expect(second.status).toBe(401);
  });

  it("falla cuando no hay cookie pendiente o está vencida", async () => {
    const res = await verify2fa(
      req("/api/auth/2fa/verify", {
        method: "POST",
        body: JSON.stringify({ code: "123456" }),
      })
    );
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe("2FA_EXPIRED");

    const expired = encodePending2faRaw(`expired-user.${Date.now() - 60_000}`);
    const expiredReq = await verify2fa(
      req("/api/auth/2fa/verify", {
        method: "POST",
        headers: { cookie: `fyrama_2fa_pending=${encodeURIComponent(expired)}` },
        body: JSON.stringify({ code: "123456" }),
      })
    );
    expect(expiredReq.status).toBe(401);
  });

  it("limita los intentos fallidos de 2FA por cuenta", async () => {
    const user = await prisma.user.findUnique({ where: { email: EMAIL }, select: { id: true } });
    expect(user).not.toBeNull();
    totpVerifyLimiter.reset(user!.id);
    totpVerifyIpLimiter.reset("all:" + IP);
    const pending = await pendingCookie();
    for (let i = 0; i < 5; i++) {
      const r = await verify2fa(
        req("/api/auth/2fa/verify", {
          method: "POST",
          headers: { cookie: `fyrama_2fa_pending=${encodeURIComponent(pending)}` },
          body: JSON.stringify({ code: "000000" }),
        })
      );
      expect(r.status).toBe(401);
    }
    const blocked = await verify2fa(
      req("/api/auth/2fa/verify", {
        method: "POST",
        headers: { cookie: `fyrama_2fa_pending=${encodeURIComponent(pending)}` },
        body: JSON.stringify({ code: "000000" }),
      })
    );
    expect(blocked.status).toBe(429);
  });

  it("rechaza mutaciones sin CSRF u origen ajeno", async () => {
    const res = await verify2fa(
      new Request("http://localhost:3000/api/auth/2fa/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: "123456" }),
      })
    );
    expect(res.status).toBe(403);

    const hostile = await verify2fa(
      new Request("http://localhost:3000/api/auth/2fa/verify", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "https://evil.example",
          "x-fyrama-csrf": "fyrama-validated",
        },
        body: JSON.stringify({ code: "123456" }),
      })
    );
    expect(hostile.status).toBe(403);
  });

  it("cancelar limpia la cookie pendiente", async () => {
    await pendingCookie();
    const res = await cancel2fa(
      req("/api/auth/2fa/cancel", { method: "POST", body: "{}" })
    );
    expect(res.status).toBe(200);
    expect(cookieValue(res, "fyrama_2fa_pending")).toBe("");
  });
});