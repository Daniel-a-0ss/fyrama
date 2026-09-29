"use client";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: { code: string; message: string; fields?: Record<string, string[]> } };

export async function api<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const headers = new Headers(options?.headers ?? {});
  if (!(options?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("x-fyrama-csrf", "fyrama-validated");

  const res = await fetch(url, { ...options, headers, credentials: "same-origin" });
  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await res.json()) as ApiResponse<T>;
  } catch {
    payload = null;
  }

  if (!res.ok || !payload || !payload.ok) {
    const err = payload && !payload.ok ? payload.error : undefined;
    throw new ApiError(
      res.status,
      err?.code ?? "NETWORK_ERROR",
      err?.message ?? "Ocurrió un error inesperado.",
      err?.fields
    );
  }
  return payload.data;
}

/** Lee el mensaje de error de una excepción de API. */
export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return "Ocurrió un error inesperado.";
}

/** Cambia el estado de autenticación al hacer login/logout y navega. */
export async function redirectAfterSession(path: string) {
  window.location.href = path;
}