import { describe, it, expect } from "vitest";
import { requireAdmin } from "@/lib/auth/admin";
import type { AdminResult } from "@/lib/auth/admin";

function errOf(result: AdminResult): Response {
  if (result.user !== null) throw new Error("Se esperaba una petición rechazada");
  return result.error;
}

describe("requireAdmin", () => {
  it("bloquea peticiones sin origen y sin header CSRF", async () => {
    const result = await requireAdmin(new Request("http://localhost:3000/api/admin/users"));
    expect(result.user).toBeNull();
    const error = errOf(result);
    const body = await error.json();
    expect(error.status).toBe(403);
    expect(body.error.code).toBe("CSRF_FAILED");
  });

  it("bloquea origen ajeno aunque no haya cookie", async () => {
    const error = errOf(
      await requireAdmin(
        new Request("http://localhost:3000/api/admin/users", {
          headers: { origin: "https://evil.example" },
        })
      )
    );
    expect(error.status).toBe(403);
  });

  it("con CSRF válido pero sin sesión devuelve 401", async () => {
    const error = errOf(
      await requireAdmin(
        new Request("http://localhost:3000/api/admin/users", {
          headers: { "x-fyrama-csrf": "fyrama-validated" },
        })
      )
    );
    expect(error.status).toBe(401);
  });

  it("con origen propio pero sin sesión devuelve 401", async () => {
    const error = errOf(
      await requireAdmin(
        new Request("http://localhost:3000/api/admin/users", {
          headers: { origin: "http://localhost:3000" },
        })
      )
    );
    expect(error.status).toBe(401);
  });
});