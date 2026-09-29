import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

/**
 * Seed mínimo para la base de pruebas: un usuario ADMIN con el que
 * los tests pueden verificar flujos autenticados.
 */

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("AdminPrueba!2026", 4);
  await prisma.user.upsert({
    where: { email: "admin@test.fyrama" },
    update: {},
    create: {
      email: "admin@test.fyrama",
      name: "Admin de prueba",
      role: "ADMIN",
      passwordHash,
    },
  });
  await prisma.siteSetting.upsert({
    where: { key: "seo_title" },
    update: {},
    create: { key: "seo_title", value: "" },
  });
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("[seed-test-db]", err);
  process.exit(1);
});