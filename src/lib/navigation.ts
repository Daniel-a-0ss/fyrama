import { slugify } from "@/lib/utils";

export type NavChild = {
  label: string;
  href: string;
};

export type NavItem = {
  label: string;
  href?: string;
  children?: NavChild[];
};

/* ------------------------------------------------------------------ *
 * Anclas de los servicios
 *
 * El id que se pinta en la tarjeta de cada servicio y el ancla del menú se
 * generan con la MISMA función, así que no pueden desincronizarse. El prefijo
 * evita que un servicio titulado igual que una sección fija de la página
 * genere un id duplicado en el HTML.
 *
 * Estas funciones viven aquí (y no en services/nav.ts) porque también las usa
 * el Footer, que es un componente de cliente y no puede importar Prisma.
 * ------------------------------------------------------------------ */

export const LEGAL_SERVICE_ANCHOR_PREFIX = "servicio-";

export function legalServiceAnchor(title: string): string {
  return `${LEGAL_SERVICE_ANCHOR_PREFIX}${slugify(title)}`;
}

export const REAL_ESTATE_SERVICE_ANCHOR_PREFIX = "servicio-inmobiliario-";

export function realEstateServiceAnchor(title: string): string {
  return `${REAL_ESTATE_SERVICE_ANCHOR_PREFIX}${slugify(title)}`;
}

export const EMPRESA_ITEMS: NavChild[] = [
  { label: "¿Quiénes somos?", href: "/nuestra-empresa#quienes-somos" },
  { label: "Nuestra misión", href: "/nuestra-empresa#mision" },
  { label: "Nuestra visión", href: "/nuestra-empresa#vision" },
  { label: "¿Por qué elegirnos?", href: "/nuestra-empresa#por-que-elegirnos" },
];

export const NAV_ITEMS: NavItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Nosotros", children: EMPRESA_ITEMS },
  // Estos dos grupos empiezan como enlace simple a su landing: getNavItems()
  // los convierte en desplegable con los servicios que existan en la base.
  { label: "Servicios jurídicos", href: "/asesoria-juridica" },
  { label: "Servicios inmobiliarios", href: "/servicios-inmobiliarios" },
  {
    label: "Vitrina inmobiliaria",
    children: [
      { label: "Venta", href: "/viviendas?operacion=venta" },
      { label: "Arrendamiento", href: "/viviendas?operacion=arriendo" },
      { label: "Permuta", href: "/permuta" },
    ],
  },
  { label: "Nuestro blog", href: "/blog" },
  { label: "Contáctanos", href: "/contacto" },
];