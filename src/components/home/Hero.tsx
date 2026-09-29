import { ArrowRight } from "lucide-react";
import { FilterBar } from "@/components/search/FilterBar";
import { LinkButton } from "@/components/ui/Button";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import type { SearchParamsRecord } from "@/lib/search";

const HERO_IMAGE = process.env.NEXT_PUBLIC_HERO_IMAGE ?? "/media/brand/hero.webp";

export function Hero({
  cities,
  initial,
}: {
  cities: string[];
  initial?: SearchParamsRecord;
}) {
  return (
    <section className="relative flex min-h-[92svh] items-center overflow-hidden">
      <div className="absolute inset-0 bg-pine-950" aria-hidden>
        <img
          src={HERO_IMAGE}
          alt=""
          className="h-full w-full object-cover opacity-85"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-pine-950/70 via-pine-950/45 to-pine-950/80" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="animate-fade-up mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">
            Vivienda - Patrimonio - Asesoría jurídica
          </p>
          <h1 className="animate-fade-up font-display text-4xl font-semibold leading-[1.06] tracking-tight text-bone-50 sm:text-5xl lg:text-6xl [text-wrap:balance]">
            Encuentra el lugar donde comienza{" "}
            <em className="font-light italic text-gold-300">tu próxima historia</em>
          </h1>
          <p
            className="animate-fade-up mx-auto mt-4 max-w-xl text-base text-bone-100/85 sm:text-lg [text-wrap:pretty]"
            style={{ animationDelay: "80ms" }}
          >
            Compra, vende o arrienda con confianza y acompañamiento profesional.
          </p>

          <div
            className="animate-fade-up mt-7 flex flex-col justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "120ms" }}
          >
            <LinkButton href="/viviendas" variant="gold" size="lg">
              Explorar propiedades
              <ArrowRight className="size-4" aria-hidden />
            </LinkButton>
            <LinkButton
              href={buildWhatsAppUrl(
                "Hola, quiero recibir asesoría inmobiliaria y jurídica."
              )}
              variant="outline"
              size="lg"
              target="_blank"
              rel="noopener noreferrer"
              className="border-[#ffffff]/30! text-[#fbfaf6]! hover:bg-[#ffffff]/10! hover:border-[#ffffff]/50!"
            >
              Hablar con un asesor
            </LinkButton>
          </div>
        </div>

        <div
          className="animate-fade-up relative mx-auto mt-10 max-w-4xl"
          style={{ animationDelay: "180ms" }}
        >
          <FilterBar cities={cities} initial={initial} />
        </div>
      </div>
    </section>
  );
}