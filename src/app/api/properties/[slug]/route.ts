import { getPropertyBySlug } from "@/lib/services/property";
import { fail, ok, handle } from "@/lib/api";

export const runtime = "nodejs";

async function doDetail(_request: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const property = await getPropertyBySlug(slug);
  if (!property) {
    return fail(404, "NOT_FOUND", "La propiedad no existe o no está publicada.");
  }
  return ok({ property });
}

export async function GET(request: Request, ctx: { params: Promise<{ slug: string }> }) {
  return handle(() => doDetail(request, ctx));
}