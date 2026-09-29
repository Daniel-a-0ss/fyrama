import { describe, it, expect, beforeEach } from "vitest";
import { POST, GET } from "@/app/api/contact/route";
import { prisma } from "@/lib/prisma";
import { contactLimiter } from "@/lib/security/rate-limit";

function post(body: string, ip: string): Promise<Response> {
  return POST(
    new Request("http://localhost:3000/api/contact", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-real-ip": ip,
      },
      body,
    })
  );
}

const validBody = JSON.stringify({
  name: "María Rodríguez",
  email: "maria@example.com",
  message: "Me interesa una casa en Armenia con tres habitaciones.",
});

describe("api/contact", () => {
  beforeEach(() => {
    contactLimiter.reset("10.1.0.1");
    contactLimiter.reset("10.1.0.99");
  });

  it("acepta una solicitud válida y persiste la IP", async () => {
    const before = await prisma.contactRequest.count();
    const res = await post(validBody, "10.1.0.1");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true, data: { received: true } });

    const row = await prisma.contactRequest.findFirst({
      where: { email: "maria@example.com" },
      orderBy: { createdAt: "desc" },
    });
    expect(row).not.toBeNull();
    expect(row!.ipAddress).toBe("10.1.0.1");
    expect(row!.message).toContain("casa en Armenia");
    expect(await prisma.contactRequest.count()).toBe(before + 1);
  });

  it("rechaza honeypot relleno sin guardar nada", async () => {
    const res = await post(
      JSON.stringify({
        name: "Bot",
        email: "bot@evil.com",
        message: "Mensaje largo cualquiera para pasar validación",
        company: "Spam Corp",
      }),
      "10.1.0.1"
    );
    expect(res.status).toBe(422);
    const row = await prisma.contactRequest.findFirst({ where: { email: "bot@evil.com" } });
    expect(row).toBeNull();
  });

  it("responde 400 ante JSON inválido", async () => {
    const res = await post("{no-json", "10.1.0.1");
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("BAD_REQUEST");
  });

  it("responde 422 ante validación fallida", async () => {
    const res = await post(JSON.stringify({ name: "A" }), "10.1.0.1");
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.fields.name).toBeDefined();
  });

  it("limita a 5 solicitudes por IP", async () => {
    contactLimiter.reset("10.1.0.99");
    for (let i = 0; i < 5; i++) {
      const r = await post(validBody, "10.1.0.99");
      expect(r.status).toBe(200);
    }
    const r = await post(validBody, "10.1.0.99");
    expect(r.status).toBe(429);
  });

  it("solo permite POST", async () => {
    const r = await GET();
    expect(r.status).toBe(405);
  });
});