import { prisma } from "@/lib/prisma";
import {
  NAV_ITEMS,
  legalServiceAnchor,
  realEstateServiceAnchor,
  type NavChild,
  type NavItem,
} from "@/lib/navigation";

export { legalServiceAnchor, realEstateServiceAnchor };
export {
  LEGAL_SERVICE_ANCHOR_PREFIX,
  REAL_ESTATE_SERVICE_ANCHOR_PREFIX,
} from "@/lib/navigation";


/* ------------------------------------------------------------------ *
 * Construcción del menú
 * ------------------------------------------------------------------ */

const AREAS_DEL_DERECHO: NavChild = {
  label: "Áreas del derecho",
  href: "/asesoria-juridica#areas-del-derecho",
};

function toChildren(
  titles: string[],
  hrefFor: (title: string) => string,
  extra?: NavChild
): NavChild[] {
  const children: NavChild[] = [];
  const seen = new Set<string>();

  for (const raw of titles) {
    const title = raw.trim();
    if (!title || seen.has(title)) continue;
    seen.add(title);
    children.push({ label: title, href: hrefFor(title) });
  }

  if (extra && !seen.has(extra.label)) children.push(extra);

  return children;
}

/** "Servicios jurídicos": solo los servicios activos que existen en la base. */
async function legalServicesChildren(): Promise<NavChild[]> {
  const rows = await prisma.legalService.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    select: { title: true },
  });

  return toChildren(
    rows.map((r) => r.title),
    (title) => `/asesoria-juridica#${legalServiceAnchor(title)}`,
    AREAS_DEL_DERECHO
  );
}

/** "Servicios inmobiliarios": idem, con la lista editable del panel. */
async function realEstateServicesChildren(): Promise<NavChild[]> {
  const rows = await prisma.realEstateService.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    select: { title: true },
  });

  return toChildren(
    rows.map((r) => r.title),
    (title) => `/servicios-inmobiliarios#${realEstateServiceAnchor(title)}`
  );
}

async function safeChildren(
  load: () => Promise<NavChild[]>,
  label: string
): Promise<NavChild[]> {
  try {
    return await load();
  } catch (error) {
    console.error(`[nav] no se pudieron leer los ${label}:`, error);
    return [];
  }
}

/**
 * Menú de navegación con los servicios reales. Si un grupo no tiene servicios
 * (base sin datos o sin la tabla) se omite, en lugar de mostrar opciones que
 * no llevan a ningún contenido.
 */
export async function getNavItems(): Promise<NavItem[]> {
  const [legal, realEstate] = await Promise.all([
    safeChildren(legalServicesChildren, "servicios jurídicos"),
    safeChildren(realEstateServicesChildren, "servicios inmobiliarios"),
  ]);

  return NAV_ITEMS.map((item) => {
    const children =
      item.label === "Servicios jurídicos"
        ? legal
        : item.label === "Servicios inmobiliarios"
          ? realEstate
          : null;

    if (children === null) return item;

    if (children.length === 0) {
      const { children: _omit, ...rest } = item;
      return rest;
    }

    return { ...item, children };
  });
}
