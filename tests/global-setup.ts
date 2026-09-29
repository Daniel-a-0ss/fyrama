import { execSync } from "child_process";
import fs from "fs";
import path from "path";

/**
 * Preparación global de Vitest:
 *  1. Crea/recrea la base de datos de prueba (SQLite: prisma/test.db).
 *  2. Aplica el schema (prisma db push) y siembra un usuario ADMIN de prueba.
 *  3. Al terminar, elimina la base de prueba.
 *
 * El env para los workers se configura en vitest.config.mts (test.env).
 */

const root = path.resolve(__dirname, "..");
const dbPath = path.join(root, "prisma", "test.db");
const bin = path.join(
  root,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "prisma.cmd" : "prisma"
);

export default async function globalSetup() {
  fs.rmSync(dbPath, { force: true });

  execSync(`"${bin}" db push --skip-generate`, {
    cwd: root,
    env: { ...process.env, DATABASE_URL: "file:./test.db" },
    stdio: "inherit",
  });

  execSync(`node ${path.join(__dirname, "seed-test-db.mjs")}`, {
    cwd: root,
    env: { ...process.env, DATABASE_URL: "file:./test.db" },
    stdio: "inherit",
  });

  return async () => {
    fs.rmSync(dbPath, { force: true });
  };
}