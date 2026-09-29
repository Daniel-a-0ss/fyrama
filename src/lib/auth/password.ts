import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

/** Valida política mínima de contraseña. */
export function isValidPasswordPolicy(plain: string): boolean {
  if (plain.length < 10) return false;
  if (!/[a-z]/.test(plain)) return false;
  if (!/[A-Z]/.test(plain)) return false;
  if (!/[0-9]/.test(plain)) return false;
  return true;
}