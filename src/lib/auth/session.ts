import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import type { Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE } from "@/lib/constants";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  active: boolean;
  lastLoginAt: Date | null;
  totpEnabled: boolean;
  totpConfirmedAt: Date | null;
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Exportado para comparaciones de sesión fuera del módulo. */
export const hashSessionToken = hashToken;

function maxAgeMs(): number {
  const hours = Number(process.env.SESSION_MAX_AGE_HOURS ?? 12);
  return hours * 60 * 60 * 1000;
}

export async function createSession(
  userId: string,
  ip?: string | null,
  userAgent?: string | null
): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + maxAgeMs());
  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt,
    },
  });
  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });
  void ip;
  void userAgent;
  return token;
}

type SessionWithUser = {
  token: string;
  expiresAt: Date;
  user: SessionUser;
};

export async function getSessionByToken(
  token: string | null | undefined
): Promise<SessionWithUser | null> {
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  if (!session.user.active) return null;
  return {
    token,
    expiresAt: session.expiresAt,
    user: session.user,
  };
}

/** Para route handlers: lee la cookie de la Request. */
export function tokenFromRequest(request: Request): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  const match = header
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(SESSION_COOKIE.length + 1));
}

export async function getSessionFromRequest(
  request: Request
): Promise<SessionWithUser | null> {
  return getSessionByToken(tokenFromRequest(request));
}

/** Para Server Components (Next: cookies()). */
export async function getSessionFromCookies(): Promise<SessionWithUser | null> {
  try {
    const store = await cookies();
    return getSessionByToken(store.get(SESSION_COOKIE)?.value);
  } catch {
    return null;
  }
}

export async function destroySession(token: string | null | undefined): Promise<void> {
  if (!token) return;
  await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
}

/** Construye el cookie header correcto (HttpOnly, SameSite=Strict, Secure en HTTPS). */
export function sessionCookieHeader(token: string, maxAgeSeconds: number): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSeconds}${secure}`;
}

export function clearSessionCookieHeader(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}

export type AuthedUser = { user: SessionUser } | { user: null; error: Response };

/**
 * Requiere autenticación (y opcionalmente un rol) en un route handler.
 * Devuelve el usuario o una Response 401/403 lista para devolver.
 * NUNCA se confía solo en el frontend: esta comprobación ocurre en backend.
 */
export async function requireAuth(
  request: Request,
  options?: { role?: Role }
): Promise<AuthedUser> {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return {
      user: null,
      error: Response.json({ error: "No autorizado" }, { status: 401 }),
    };
  }
  if (options?.role && session.user.role !== options.role) {
    return {
      user: null,
      error: Response.json({ error: "Permiso denegado" }, { status: 403 }),
    };
  }
  return { user: session.user };
}

export type { Prisma };