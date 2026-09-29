import { prisma } from "@/lib/prisma";
import { ok, handle } from "@/lib/api";

export const runtime = "nodejs";

async function doList() {
  const services = await prisma.legalService.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
  return ok({ services });
}

export async function GET() {
  return handle(() => doList());
}