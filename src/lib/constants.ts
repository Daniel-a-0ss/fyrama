export const SITE_NAME = "Fyrama";
export const SITE_TAGLINE =
  "Encuentra el lugar donde comienza tu próxima historia.";
export const SITE_DESCRIPTION =
  "Fyrama es la plataforma inmobiliaria para comprar, vender y arrendar inmueble con acompañamiento jurídico profesional. Casas y apartamentos en Colombia.";

export const SESSION_COOKIE = "fyrama_session";
export const CSRF_HEADER = "x-fyrama-csrf";

export const DEFAULT_CURRENCY = "COP";
export const DEFAULT_PAGE_SIZE = 9;
export const MAX_CONTACT_MESSAGE = 2000;
export const MAX_PROPERTY_DESCRIPTION = 20000;
export const MAX_REVIEW_CONTENT = 800;
export const MAX_ARTICLE_CONTENT = 200000;

export const WHATSAPP_NUMBER = "573217241455"; // +57 321 7241455 (internacional, sin +, espacios ni paréntesis)
export const WHATSAPP_DEFAULT_MESSAGE =
  "Hola, buen día. ¿Cómo puedo ayudarte el día de hoy?";

export const SOCIAL_LINKS = {
  whatsapp: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hola, buen día. Quiero información de Fyrama."
  )}`,
  facebook: "https://www.facebook.com/profile.php?id=61594678014552",
  instagram: "https://www.instagram.com/fyrama_juridicoeinmobiliario",
  tiktok: "https://www.tiktok.com/@fyrama.s.a.s",
  maps:
    "https://www.google.com/maps/place/FYRAMA+GRUPO+JURIDICO+E+INMOBILIARIO/@4.5422715,-75.6805496,17z/data=!3m1!4b1!4m6!3m5!1s0xa6a0e0f0b675aed7:0xe0ff360cc482bc74!8m2!3d4.5422715!4d-75.6805496!16s%2Fg%2F11zf8dqjk7",
} as const;

export const PENDING_2FA_COOKIE = "fyrama_2fa_pending";
export const PENDING_2FA_MAX_AGE = 5 * 60; // 5 minutos (en segundos)

export const OPERATIONS = [
  { value: "VENTA", label: "Venta" },
  { value: "ARRIENDO", label: "Arrendamiento" },
] as const;

/**
 * Todas las operaciones que un inmueble puede tener. Incluye Permuta, que no
 * entra en `OPERATIONS` porque en el buscador público es un acceso aparte
 * (pestañas Venta / Arrendamiento + enlace a /permuta), no una tercera pestaña.
 */
export const PROPERTY_OPERATIONS = [
  { value: "VENTA", label: "Venta" },
  { value: "ARRIENDO", label: "Arrendamiento" },
  { value: "PERMUTA", label: "Permuta" },
] as const;

export const PROPERTY_TYPES = [
  { value: "APARTAMENTO", label: "Apartamento" },
  { value: "CASA", label: "Casa" },
  { value: "CASA_CAMPO", label: "Casa de campo" },
  { value: "OFICINA", label: "Oficina" },
  { value: "LOCAL", label: "Local comercial" },
  { value: "BODEGA", label: "Bodega" },
  { value: "LOTE", label: "Lote" },
  { value: "EDIFICIO", label: "Edificio" },
] as const;

export const PROPERTY_TYPE_LABEL: Record<string, string> = Object.fromEntries(
  PROPERTY_TYPES.map((t) => [t.value, t.label])
);

export const OPERATION_LABEL: Record<string, string> = Object.fromEntries(
  PROPERTY_OPERATIONS.map((o) => [o.value, o.label])
);

export const STRATO_OPTIONS = [1, 2, 3, 4, 5, 6];

export const FEATURE_PRESETS = [
  "Parqueadero",
  "Balcón",
  "Zona social",
  "Piscina",
  "Ascensor",
  "Vigilancia",
  "Jardín",
  "Terraza",
  "Estudio",
  "Cuarto de servicio",
  "Zona de lavandería",
  "Área de mascotas",
  "Salón comunal",
  "BBQ",
  "Energía solar",
  "Chimenea",
  "Walk-in closet",
  "Smart home",
] as const;

export const SORT_OPTIONS = [
  { value: "relevancia", label: "Más relevantes" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "area-desc", label: "Área: mayor a menor" },
  { value: "recientes", label: "Más recientes" },
] as const;

export const CONTACT_PREFERENCES = ["Teléfono", "Email", "WhatsApp"] as const;

export const LEGAL_TOPICS = [
  "Revisión de contratos",
  "Promesa de compraventa",
  "Contrato de arrendamiento",
  "Estudio de documentos",
  "Compraventa de inmueble",
  "Revisión documental",
  "Consultoría inmobiliaria",
  "Proceso judicial",
  "Representación y defensa en juicio",
  "Tutela",
  "Derecho de petición",
  "Negociación y conciliación",
  "Cobro de cartera",
  "Auditoría y revisión",
  "Estudio de riesgo",
  "Otro asunto",
] as const;

export const MAP_ZOOM_DEFAULT = 15;