import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { SOCIAL_LINKS } from "@/lib/constants";
import { realEstateServiceAnchor } from "@/lib/navigation";
import { WhatsAppIcon } from "@/components/site/whatsapp/WhatsAppIcon";
import { TikTokIcon } from "@/components/site/social/TikTokIcon";

const explore = [
  { label: "Venta de inmuebles", href: "/viviendas?operacion=venta" },
  { label: "Arrendamiento", href: "/viviendas?operacion=arriendo" },
  { label: "Permuta", href: "/permuta" },
  { label: "Nosotros", href: "/nuestra-empresa" },
  { label: "Servicios inmobiliarios", href: "/servicios-inmobiliarios" },
  { label: "Inmuebles en Armenia", href: "/viviendas?ciudad=armenia" },
];

const legalServices = [
  { label: "Asesoría jurídica", href: "/asesoria-juridica" },
  { label: "Áreas del derecho", href: "/asesoria-juridica#areas-del-derecho" },
  { label: "Inmuebles para permutar", href: `/servicios-inmobiliarios#${realEstateServiceAnchor("Inmuebles para permutar")}` },
  { label: "Solicitar asesoría", href: "/asesoria-juridica#solicitar" },
];

const content = [
  { label: "Blog", href: "/blog" },
  { label: "Contacto", href: "/contacto" },
  { label: "Política de privacidad", href: "/politica-de-privacidad" },
  { label: "Términos y condiciones", href: "/terminos-y-condiciones" },
  { label: "Tratamiento de datos personales", href: "/tratamiento-de-datos-personales" },
  { label: "Política de cookies", href: "/politica-de-cookies" },
];

const socials = [
  { label: "WhatsApp", href: SOCIAL_LINKS.whatsapp, color: "#25d366", Icon: WhatsAppIcon },
  { label: "Facebook", href: SOCIAL_LINKS.facebook, color: "#1877f2", Icon: Facebook },
  { label: "Instagram", href: SOCIAL_LINKS.instagram, color: "#e4405f", Icon: Instagram },
  { label: "TikTok", href: SOCIAL_LINKS.tiktok, color: "#111111", Icon: TikTokIcon },
];

export function Footer() {
  return (
    <footer className="mt-8 bg-pine-950 text-bone-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1fr] lg:px-8">
        <div className="space-y-4">
          <Logo size="lg" />
          <p className="max-w-xs text-sm leading-relaxed text-bone-200/70">
            Compra, vende, arrienda y permuta con acompañamiento jurídico
            profesional. Una sola firma para todo el proceso.
          </p>
          <div className="space-y-2 text-sm text-bone-200/70">
            <p className="flex items-center gap-2">
              <MapPin className="size-5 text-gold-500" aria-hidden /> Armenia, Quindío
            </p>
            <p className="flex items-center gap-2">
              <Mail className="size-5 text-gold-500" aria-hidden />{" "}
              fyramajuridicoeinmobiliario@gmail.com
            </p>
            <p className="flex items-center gap-2">
              <Phone className="size-5 text-gold-500" aria-hidden /> +57 321 7241455
            </p>
          </div>
          <div className="flex gap-2 pt-1">
            {socials.map(({ label, href, color, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className="grid size-10 place-items-center rounded-full text-white transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
              >
                <Icon className="size-5" aria-hidden />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Explorar">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gold-400">
            Explorar
          </h3>
          <ul className="space-y-2.5 text-sm">
            {explore.map((l) => (
              <li key={l.href + l.label}>
                <a href={l.href} className="text-bone-200/80 hover:text-white">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Servicios jurídicos">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gold-400">
            Servicios jurídicos
          </h3>
          <ul className="space-y-2.5 text-sm">
            {legalServices.map((l) => (
              <li key={l.href + l.label}>
                <a href={l.href} className="text-bone-200/80 hover:text-white">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Contenido y legal">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gold-400">
            Contenido
          </h3>
          <ul className="space-y-2.5 text-sm">
            {content.map((l) => (
              <li key={l.href + l.label}>
                <a href={l.href} className="text-bone-200/80 hover:text-white">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-bone-200/60 sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} Fyrama. Todos los derechos reservados.
          </p>
          <p className="flex items-center gap-1.5">
            Sitio de demostración — contenido de prueba.
            <a
              href="/admin/login"
              className="ml-1 text-gold-400 hover:text-gold-300"
            >
              Acceso administradores
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}