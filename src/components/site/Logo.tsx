import { cn } from "@/lib/utils";

/**
 * Logos oficiales de Fyrama.
 * Fuente: public/media/logos (archivos entregados por el cliente).
 * No se recolorean, deforman, rotan ni se les aplican filtros.
 *
 * - logo-header.webp: LOGO FRANK-25 (tinta oscura, horizontal), con el fondo
 *   blanco convertido en transparencia para el header claro.
 * - logo-footer-v2.webp: LOGO FRANK SIN FONDO-25 (tinta clara, horizontal), footer.
 *
 * Nombres nuevos para que el navegador y la CDN no sirvan la versión anterior
 * en caché.
 */
const LOGOS = {
  "on-light": { src: "/media/logos/logo-header.webp", ratio: 1600 / 511 },
  "on-dark": { src: "/media/logos/logo-footer-v2.webp", ratio: 1400 / 399 },
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
  variant = "on-light",
  className,
}: {
  /** Fondo sobre el que se muestra el logo. */
  variant?: "on-light" | "on-dark";
  className?: string;
}) {
  const logo = LOGOS[variant];
  const height = 120;
  return (
    <span className={cn("inline-flex items-center", className)}>
      <img
        src={logo.src}
        alt="Fyrama"
        width={Math.round(height * logo.ratio)}
        height={height}
        className="h-16 w-auto min-[420px]:h-20 sm:h-28 xl:h-[7.5rem]"
      />
    </span>
  );
}
