import { cn } from "@/lib/utils";

/**
 * Logos oficiales de Fyrama.
 * Fuente: public/media/logos (archivos entregados por el cliente).
 * No se recolorean, deforman, rotan ni se les aplican filtros.
 *
 * - logo-header.webp: LOGO FRANK-25 (tinta oscura, horizontal), con el fondo
 *   blanco convertido en transparencia para el header claro.
 * - logo-footer.webp: LOGO FRANK SIN FONDO-25 (tinta clara, cuadrada), footer.
 *
 * Nombres nuevos para que el navegador y la CDN no sirvan la versión anterior
 * en caché.
 */
const LOGOS = {
  "on-light": { src: "/media/logos/logo-header.webp", ratio: 1600 / 511 },
  "on-dark": { src: "/media/logos/logo-footer.webp", ratio: 1000 / 800 },
} as const;

export function BrandMark({ className }: { className?: string }) {
  const logo = LOGOS["on-light"];
  return (
    <span className={cn("inline-flex items-center", className)}>
      <img
        src={logo.src}
        alt="Fyrama"
        width={Math.round(80 * logo.ratio)}
        height={80}
        className="h-16 w-auto sm:h-20"
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
  // md: header; lg: footer (208px / 256px en pantallas muy grandes).
  const logo = LOGOS[variant];
  const height = size === "lg" ? 256 : 96;
  return (
    <span className={cn("inline-flex items-center", className)}>
      <img
        src={logo.src}
        alt="Fyrama"
        width={Math.round(height * logo.ratio)}
        height={height}
        className={cn(
          "w-auto",
          size === "lg" ? "h-52 xl:h-64" : "h-14 sm:h-16 lg:h-20 2xl:h-24"
        )}
      />
    </span>
  );
}
