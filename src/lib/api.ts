import { z } from "zod";

/** Respuesta API uniforme y segura: nunca exponemos stack traces ni detalles internos. */

export function ok<T>(data: T, status = 200, headers?: Headers) {
  return Response.json({ ok: true, data }, { status, headers });
}

export function fail(
  status: number,
  code: string,
  message: string,
  extra?: Record<string, unknown>
) {
  return Response.json({ ok: false, error: { code, message, ...extra } }, { status });
}

export function failValidation(errors: z.ZodError) {
  return fail(422, "VALIDATION_ERROR", "Verifica los datos enviados.", {
    fields: errors.flatten().fieldErrors,
  });
}

export function failInternal(error: unknown) {
  console.error("[fyrama-api]", error);
  return fail(500, "INTERNAL_ERROR", "Ocurrió un error inesperado. Inténtalo de nuevo.");
}

/** Envuelve un route handler para no filtrar errores internos. */
export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (err) {
    return failInternal(err);
  }
}

export function unauthorizedMessage() {
  return fail(401, "UNAUTHORIZED", "No autorizado.");
}

export function forbiddenMessage() {
  return fail(403, "FORBIDDEN", "No tienes permisos para realizar esta acción.");
}