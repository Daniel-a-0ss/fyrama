import { propertyQuerySchema } from "@/lib/validation/schemas";
import { normalizeQuery, normalizeSearchParams, searchUrl } from "@/lib/search";
import { listProperties } from "@/lib/services/property";
import { ok, failValidation, handle } from "@/lib/api";

export const runtime = "nodejs";

async function doList(request: Request) {
  const params = new URL(request.url).searchParams;
  const raw = Object.fromEntries(params.entries());
  const parsed = propertyQuerySchema.safeParse(raw);
  if (!parsed.success) return failValidation(parsed.error);
  const q = normalizeQuery(normalizeSearchParams(raw));
  const result = await listProperties({
    q,
    sort: parsed.data.sort,
    page: parsed.data.page,
    limit: parsed.data.limit,
  });
  return ok({
    ...result,
    canonicalUrl: searchUrl("/viviendas", normalizeSearchParams(raw)),
  });
}

export async function GET(request: Request) {
  return handle(() => doList(request));
}