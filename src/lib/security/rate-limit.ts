/**
 * Rate limiting en memoria (sliding window).
 * Adecuado para una instancia (desarrollo / Vercel serverless con una sola región).
 *
 * Producción multi-instancia: sustituir por una tienda compartida (Redis),
 * manteniendo la misma interfaz. Ver docs/PRODUCTION.md
 */

type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

export class RateLimiter {
  constructor(
    private readonly windowMs: number,
    private readonly max: number,
    private readonly prefix = "rl"
  ) {}

  private keyFor(identifier: string) {
    return `${this.prefix}:${identifier}`;
  }

  private sweep(now: number): number {
    let removed = 0;
    for (const [k, v] of store) {
      if (v.resetAt <= now) {
        store.delete(k);
        removed++;
      }
    }
    return removed;
  }

  /** Devuelve true si la petición está permitida. */
  allow(identifier: string): boolean {
    const now = Date.now();
    this.sweep(now);
    const key = this.keyFor(identifier);
    const bucket = store.get(key);
    if (!bucket || bucket.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }
    if (bucket.count >= this.max) return false;
    bucket.count += 1;
    return true;
  }

  /** Devuelve cuantos intentos quedan antes del bloqueo. */
  remaining(identifier: string): number {
    const b = store.get(this.keyFor(identifier));
    if (!b) return this.max;
    return Math.max(0, this.max - b.count);
  }

  reset(identifier: string) {
    store.delete(this.keyFor(identifier));
  }
}

/** Límites compartidos para login (fuerza bruta). */
export const loginLimiter = new RateLimiter(
  15 * 60 * 1000, // 15 min
  5, // máx 5 intentos fallidos
  "login"
);

export const loginAttemptLimiter = new RateLimiter(
  60 * 1000, // 1 min
  10, // intentos por minuto (por IP)
  "login-ip"
);

export const totpVerifyLimiter = new RateLimiter(
  15 * 60 * 1000, // 15 min
  5, // máx 5 códigos 2FA fallidos por cuenta
  "2fa"
);

export const totpVerifyIpLimiter = new RateLimiter(
  60 * 1000, // 1 min
  10, // intentos por minuto (por IP)
  "2fa-ip"
);

export const totpSetupLimiter = new RateLimiter(
  15 * 60 * 1000, // 15 min
  10, // confirmaciones/desactivaciones por usuario
  "2fa-setup"
);

export const contactLimiter = new RateLimiter(
  10 * 60 * 1000,
  Number(process.env.CONTACT_RATE_LIMIT_MAX ?? 5),
  "contact"
);

export const uploadLimiter = new RateLimiter(60 * 1000, 30, "upload");