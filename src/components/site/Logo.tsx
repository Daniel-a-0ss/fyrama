import { cn } from "@/lib/utils";

/**
 * Logos oficiales de Fyrama.
 * Fuente unica: public/media/logos (archivos entregados por el cliente).
 * Se usan los .png "sin fondo" en todos los fondos, sin recolorear,
 * deformar, rotar ni aplicarles filtros.
 *
 * - horizontal: composicion horizontal (isotipo + wordmark) -> header, footer.
 * - vertical:   composicion vertical (marca + wordmark)     -> 404, espacios cuadrados.
 *
 * La tinta del archivo oficial es azul marino (#06182a). Se muestra el PNG
 * tal cual, sin fondo añadido, sin recolorear, sin deformar y sin placas: sobre
 * superficies claras se lee; sobre las oscuras queda muy tenue.
 *
 * Archivos originales del cliente, usados tal cual (URL con %20 = espacio):
 *   public/media/logos/LOGO FRANK SIN FONDO-25.png  (horizontal, 18460x5898)
 *   public/media/logos/LOGO FRANK SIN FONDO-10.png  (vertical,   10213x9915)
 */
const LOGO_HORIZONTAL = "/media/logos/LOGO%20FRANK%20SIN%20FONDO-25.png";
const LOGO_VERTICAL = "/media/logos/LOGO%20FRANK%20SIN%20FONDO-10.png";

/** Proporción del lockup horizontal: 18460 x 5898 px. */
const RATIO = 18460 / 5898; // 3.13 -> alto x 3.13 = ancho

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <img
        src={LOGO_VERTICAL}
        alt="Fyrama"
        width={262}
        height={256}
        className="h-64 w-auto"
      />
    </span>
  );
}

export function Logo({
  size = "md",
  className,
}: {
  /** "lg" = version grande para el footer. */
  size?: "md" | "lg";
  className?: string;
}) {
  // md: header (96px hasta 1536px / 112px en pantallas muy grandes),
  // lg: footer (112px / 128px).
  const height = size === "lg" ? 128 : 112;
  return (
    <span className={cn("inline-flex items-center", className)}>
      <img
        src={LOGO_HORIZONTAL}
        alt="Fyrama"
        width={Math.round(height * RATIO)}
        height={height}
        className={cn(
          "w-auto",
          size === "lg" ? "h-28 xl:h-32" : "h-24 2xl:h-28"
        )}
      />
    </span>
  );
}
