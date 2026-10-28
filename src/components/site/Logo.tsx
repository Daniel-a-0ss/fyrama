import { cn } from "@/lib/utils";

/**
 * Logos oficiales de Fyrama.
 * Fuente: public/media/logos (archivos entregados por el cliente).
 * No se recolorean, deforman, rotan ni se les aplican filtros.
 *
 * - logo-on-light.webp: tinta oscura, para fondos claros (header, páginas).
 * - logo-on-dark.webp:  tinta clara, para fondos oscuros (footer).
 *
 * Ambos son la composición vertical oficial (10213 x 9915 px originales).
 * Las versiones .webp son una copia optimizada a 512 px de alto.
 */
const LOGO_ON_LIGHT = "/media/logos/logo-on-light.webp";
const LOGO_ON_DARK = "/media/logos/logo-on-dark.webp";

const RATIO = 10213 / 9915; // 1.03 -> ancho x 1.03 = alto

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <img
        src={LOGO_ON_LIGHT}
        alt="Fyrama"
        width={Math.round(256 * RATIO)}
        height={256}
        className="h-64 w-auto"
      />
    </span>
  );
}

export function Logo({
  size = "md",
  variant = "on-light",
  className,
}: {
  /** "lg" = versión grande para el footer. */
  size?: "md" | "lg";
  /** Fondo sobre el que se muestra el logo. */
  variant?: "on-light" | "on-dark";
  className?: string;
}) {
  // md: header (96px hasta 1536px / 112px en pantallas muy grandes),
  // lg: footer (208px / 256px en pantallas muy grandes).
  const height = size === "lg" ? 256 : 112;
  const src = variant === "on-dark" ? LOGO_ON_DARK : LOGO_ON_LIGHT;
  return (
    <span className={cn("inline-flex items-center", className)}>
      <img
        src={src}
        alt="Fyrama"
        width={Math.round(height * RATIO)}
        height={height}
        className={cn(
          "w-auto",
          size === "lg" ? "h-52 xl:h-64" : "h-24 2xl:h-28"
        )}
      />
    </span>
  );
}
