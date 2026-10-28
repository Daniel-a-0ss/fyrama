import { describe, it, expect, beforeEach } from "vitest";
import { POST, GET } from "@/app/api/reviews/route";
import { prisma } from "@/lib/prisma";
import { reviewLimiter } from "@/lib/security/rate-limit";

function post(body: string, ip: string): Promise<Response> {
  return POST(
    new Request("http://localhost:3000/api/reviews", {
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
  rating: 5,
  title: "Compra de inmueble",
  content: "Todo el proceso muy claro, me acompañaron en cada firma.",
});

describe("api/reviews", () => {
  beforeEach(() => {
    reviewLimiter.reset("10.2.0.1");
    reviewLimiter.reset("10.2.0.99");
  });

  it("guarda la opinión como PENDING y persiste la IP", async () => {
    const res = await post(validBody, "10.2.0.1");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, data: { received: true } });

    const row = await prisma.review.findFirst({
      where: { name: "María Rodríguez" },
      orderBy: { createdAt: "desc" },
    });
    expect(row).not.toBeNull();
    expect(row!.status).toBe("PENDING");
    expect(row!.rating).toBe(5);
    expect(row!.approvedAt).toBeNull();
    expect(row!.ipAddress).toBe("10.2.0.1");
  });

  it("no publica sin moderación: PENDING no aparece entre las aprobadas", async () => {
    await post(validBody, "10.2.0.1");
    const approved = await prisma.review.count({ where: { status: "APPROVED" } });
    const row = await prisma.review.findFirst({
      where: { name: "María Rodríguez" },
      orderBy: { createdAt: "desc" },
    });
    expect(row!.status).not.toBe("APPROVED");
    expect(approved).toBe(0);
  });

  it("rechaza honeypot relleno sin guardar nada", async () => {
    const before = await prisma.review.count();
    const res = await post(
      JSON.stringify({
        name: "Bot",
        rating: 5,
        content: "Mensaje spam con la longitud suficiente para validar.",
        company: "Spam Corp",
      }),
      "10.2.0.1"
    );
    // El honeypot tiene max(0), así que zod lo rechaza antes de guardarlo.
    expect(res.status).toBe(422);
    expect(await prisma.review.count()).toBe(before);
  });

  it("bloquea opiniones duplicadas", async () => {
    const body = JSON.stringify({
      name: "Duplicada",
      rating: 4,
      content: "Esta opinión se envía dos veces exactamente igual.",
    });
    const first = await post(body, "10.2.0.1");
    expect(first.status).toBe(200);
    const second = await post(body, "10.2.0.1");
    expect(second.status).toBe(409);
  });

  it("responde 400 ante JSON inválido", async () => {
    const res = await post("{no-json", "10.2.0.1");
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("BAD_REQUEST");
  });

  it("responde 422 ante validación fallida", async () => {
    const res = await post(JSON.stringify({ name: "A", rating: 9 }), "10.2.0.1");
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.fields.name).toBeDefined();
  });

  it("exige un mínimo de 20 caracteres en el texto", async () => {
    const res = await post(
      JSON.stringify({ name: "Corto", rating: 5, content: "Muy bien" }),
      "10.2.0.1"
    );
    expect(res.status).toBe(422);
    expect((await res.json()).error.fields.content).toBeDefined();
  });

  it("limita a 3 opiniones por IP", async () => {
    reviewLimiter.reset("10.2.0.99");
    for (let i = 0; i < 3; i++) {
      const r = await post(
        JSON.stringify({
          name: `Cliente ${i}`,
          rating: 5,
          content: `Opinión número ${i} con longitud suficiente para validar.`,
        }),
        "10.2.0.99"
      );
      expect(r.status).toBe(200);
    }
    const r = await post(validBody, "10.2.0.99");
    expect(r.status).toBe(429);
  });

  it("solo permite POST", async () => {
    expect((await GET()).status).toBe(405);
  });
});
