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

      <div className="relative z-10 w-full px-4 pb-16 pt-40 sm:px-6 lg:px-8 lg:pt-44">
        <div className="max-w-2xl text-left">
          <p className="animate-fade-up mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-gold-400 sm:text-sm sm:tracking-[0.2em]">
            Abogados especializados y expertos inmobiliarios
          </p>
          <h1 className="animate-fade-up font-display text-4xl font-semibold leading-[1.06] tracking-tight text-bone-50 sm:text-5xl lg:text-6xl [text-wrap:balance]">
            Estamos contigo en{" "}
            <em className="font-light italic text-gold-300">cada decisión</em>
          </h1>
          <p
            className="animate-fade-up mt-4 max-w-2xl text-base text-bone-100/85 sm:text-lg [text-wrap:pretty]"
            style={{ animationDelay: "80ms" }}
          >
            Asesoría jurídica y oportunidades inmobiliarias en un solo lugar,
            con acompañamiento cercano y profesional para proteger tu patrimonio
            y tomar decisiones con confianza y tranquilidad.
          </p>

          <div
            className="animate-fade-up mt-7 flex flex-col items-start gap-3 sm:flex-row"
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
          className="animate-fade-up relative mt-12 max-w-5xl"
          style={{ animationDelay: "180ms" }}
        >
          <FilterBar cities={cities} initial={initial} />
        </div>
      </div>
    </section>
  );
}