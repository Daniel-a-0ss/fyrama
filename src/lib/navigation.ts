export type NavChild = {
  label: string;
  href: string;
};

export type NavItem = {
  label: string;
  href?: string;
  children?: NavChild[];
};

export const EMPRESA_ITEMS: NavChild[] = [
  { label: "¿Quiénes somos?", href: "/nuestra-empresa#quienes-somos" },
  { label: "Nuestra misión", href: "/nuestra-empresa#mision" },
  { label: "Nuestra visión", href: "/nuestra-empresa#vision" },
  { label: "¿Por qué elegirnos?", href: "/nuestra-empresa#por-que-elegirnos" },
];

export const SERVICIOS_JURIDICOS_ITEMS: NavChild[] = [
  { label: "Asesoría y consultoría", href: "/asesoria-juridica#asesoria-y-consultoria" },
  { label: "Representación judicial y extrajudicial", href: "/asesoria-juridica#representacion-judicial" },
  { label: "Negociación y conciliación jurídica", href: "/asesoria-juridica#negociacion-y-conciliacion" },
  { label: "Acciones de tutela", href: "/asesoria-juridica#acciones-de-tutela" },
  { label: "Derechos de petición", href: "/asesoria-juridica#derechos-de-peticion" },
  { label: "Estudio de títulos", href: "/asesoria-juridica#estudio-de-titulos" },
  { label: "Cobro de cartera", href: "/asesoria-juridica#cobro-de-cartera" },
  { label: "Auditoría y revisión jurídica", href: "/asesoria-juridica#auditoria-y-revision" },
  { label: "Estudio de riesgo jurídico", href: "/asesoria-juridica#estudio-de-riesgo" },
  { label: "Áreas del derecho", href: "/asesoria-juridica#areas-del-derecho" },
];

export const SERVICIOS_INMOBILIARIOS_ITEMS: NavChild[] = [
  { label: "Inmuebles en venta", href: "/servicios-inmobiliarios#inmuebles-en-venta" },
  { label: "Inmuebles en arrendamiento", href: "/servicios-inmobiliarios#inmuebles-en-arrendamiento" },
  { label: "Inmuebles para permutar", href: "/servicios-inmobiliarios#inmuebles-para-permutar" },
  { label: "Asesoría en negociación de inmuebles", href: "/servicios-inmobiliarios#negociacion-de-inmuebles" },
  { label: "Estudio jurídico de inmuebles", href: "/servicios-inmobiliarios#estudio-juridico" },
  { label: "Promesas y contratos inmobiliarios", href: "/servicios-inmobiliarios#promesas-y-contratos" },
  { label: "Administración de contratos de arrendamiento", href: "/servicios-inmobiliarios#administracion-contratos" },
  { label: "Administración y gestión inmobiliaria", href: "/servicios-inmobiliarios#administracion-gestion" },
  { label: "Asesoría en inversión inmobiliaria", href: "/servicios-inmobiliarios#inversion-inmobiliaria" },
  { label: "Saneamiento jurídico de inmuebles", href: "/servicios-inmobiliarios#saneamiento-juridico" },
  { label: "Trámites notariales y registrales", href: "/servicios-inmobiliarios#tramites-notariales" },
  { label: "Marketing y publicidad inmobiliaria", href: "/servicios-inmobiliarios#marketing-publicidad" },
  { label: "Subsidios y créditos inmobiliarios", href: "/servicios-inmobiliarios#subsidios-y-creditos" },
  { label: "Avalúo y peritaje de inmuebles", href: "/servicios-inmobiliarios#avaluo-y-peritaje" },
];

export const NAV_ITEMS: NavItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Nosotros", children: EMPRESA_ITEMS },
  { label: "Servicios jurídicos", children: SERVICIOS_JURIDICOS_ITEMS },
  { label: "Servicios inmobiliarios", children: SERVICIOS_INMOBILIARIOS_ITEMS },
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