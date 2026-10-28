import type { Metadata } from "next";
import {
  ArrowRight,
  Check,
  House,
  HousePlus,
  Scale,
  ShieldCheck,
  Users,
  Handshake,
  Star,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { getSiteSettings, mergeSettings } from "@/lib/services/settings";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import { Hero } from "@/components/home/Hero";
import { ArticleCard } from "@/components/article/ArticleCard";
import { LinkButton } from "@/components/ui/Button";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { Reviews } from "@/components/home/Reviews";
import { PqrsSection } from "@/components/home/PqrsSection";
import { getCities, listProperties } from "@/lib/services/property";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export async function generateMetadata(): Promise<Metadata> {
  const settings = mergeSettings(await getSiteSettings());
  return buildMetadata({
    title:
      settings.seo_title?.trim() ||
      `${SITE_NAME} | Inmueble y asesoría inmobiliaria`,
    description: settings.seo_description?.trim() || SITE_DESCRIPTION,
    path: "/",
    ogImage: settings.og_image?.trim() || undefined,
  });
}

async function getHomeData() {
  const settings = mergeSettings(await getSiteSettings());
  const cities = await getCities();

  const featured = await listProperties({
    q: { caracteristicas: [] },
    sort: "relevancia",
    page: 1,
    limit: 8,
  });

  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    take: 3,
    include: { category: true, coverMedia: true },
  });

  return { settings, cities, featured: featured.items, articles };
}

const sellWhatsAppUrl = buildWhatsAppUrl(
  "Hola, quiero vender mi inmueble con el acompañamiento de Fyrama."
);

const whyUs = [
  {
    icon: ShieldCheck,
    title: "Experiencia y confianza",
    text: "Trayectoria resolviendo trámites inmobiliarios y jurídicos con respaldo profesional.",
  },
  {
    icon: Users,
    title: "Atención personalizada",
    text: "Escuchamos tus necesidades y te orientamos, cada cliente es único; te acompañamos de principio a fin.",
  },
  {
    icon: Handshake,
    title: "Aliados estratégicos",
    text: "Trabajamos con notarías, bancos, compañías de seguros, peritos avaluadores y constructoras de confianza.",
  },
  {
    icon: Star,
    title: "Compromiso",
    text: "Fusionar el rigor legal y la visión inmobiliaria para hacer realidad tus proyectos con total certeza jurídica.",
  },
];

const realEstateServices = ["Compra", "Venta", "Arrendamiento", "Permuta"];
const legalServices = [
  "Asesoría legal",
  "Contratos",
  "Estudios de títulos",
  "Acompañamiento en procesos",
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { settings, cities, featured, articles } = await getHomeData();

  return (
    <>
      {/* 1. Hero */}
      <Hero cities={cities} image={settings.hero_image} />

      {/* 2. Propiedades destacadas */}
      <FeaturedProperties properties={featured} />

      {/* 3. ¿Qué estás buscando? — solo lo que el buscador no cubre */}
      <section
        className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-16 lg:px-8"
        aria-labelledby="que-buscas-title"
      >
        <div className="grid items-center gap-8 rounded-3xl border border-bone-200/70 bg-bone-50 p-8 shadow-sm sm:p-10 lg:grid-cols-[1fr_auto] lg:gap-12">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gold-500 text-pine-950">
              <HousePlus className="size-7" aria-hidden />
            </span>
            <div>
              <h2
                id="que-buscas-title"
                className="font-display text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl"
              >
                ¿Tienes una propiedad para vender?
              </h2>
              <p className="mt-2 text-lg font-medium text-gold-700">
                ¡Dale a tu propiedad la visibilidad que merece y llega mucho
                más lejos!
              </p>
              <p className="mt-3 max-w-2xl leading-relaxed text-ink-600">
                En Fyrama Grupo Jurídico e Inmobiliario te ofrecemos la
                oportunidad de valorar tu inmueble con respaldo inmobiliario y
                jurídico, publicarlo en nuestra vitrina inmobiliaria y
                conectarlo con miles de potenciales compradores y arrendatarios
                en Armenia, el Quindío, Colombia y el exterior.
              </p>
            </div>
          </div>
          <LinkButton
            href={sellWhatsAppUrl}
            variant="gold"
            size="lg"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full shrink-0 sm:w-auto"
          >
            Vender con Fyrama
            <ArrowRight className="size-4" aria-hidden />
          </LinkButton>
        </div>
      </section>

      {/* 4. Más que una inmobiliaria */}
      <section className="bg-pine-950 py-14 sm:py-16" aria-labelledby="compania-title">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">
              Nuestra firma
            </p>
            <h2
              id="compania-title"
              className="mt-3 font-display text-3xl font-semibold tracking-tight text-bone-50 sm:text-4xl"
            >
              Acompañamos tus decisiones
            </h2>
            <p className="mt-4 max-w-xl text-lg font-medium text-gold-300">
              Soluciones jurídicas e inmobiliarias, a tu medida
            </p>
            <p className="mt-4 max-w-xl leading-relaxed text-bone-100/75">
              Fyrama es una firma de asesoría jurídica e inmobiliaria orientada
              a brindar soluciones legales integrales para personas naturales y
              jurídicas. Su enfoque combina la representación judicial, la
              asesoría preventiva y el acompañamiento en asuntos patrimoniales,
              familiares, laborales, civiles, inmobiliarios y diferentes áreas
              del derecho, ofreciendo un servicio cercano, profesional y
              confiable en cada etapa del proceso.
            </p>
            <LinkButton href="/nuestra-empresa" variant="gold" className="mt-7">
              Conoce más sobre nosotros
              <ArrowRight className="size-4" aria-hidden />
            </LinkButton>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-gold-500/15 text-gold-400">
                <House className="size-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-bone-50">
                Servicios inmobiliarios
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-bone-100/75">
                {realEstateServices.map((s) => (
                  <li key={s} className="flex items-center gap-2.5">
                    <Check className="size-4 shrink-0 text-gold-400" aria-hidden />
                    {s}
                  </li>
                ))}
              </ul>
              <a
                href="/servicios-inmobiliarios"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-400 transition-colors hover:text-gold-300"
              >
                Ver más
                <ArrowRight className="size-4" aria-hidden />
              </a>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-gold-500/15 text-gold-400">
                <Scale className="size-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-bone-50">
                Servicios jurídicos
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-bone-100/75">
                {legalServices.map((s) => (
                  <li key={s} className="flex items-center gap-2.5">
                    <Check className="size-4 shrink-0 text-gold-400" aria-hidden />
                    {s}
                  </li>
                ))}
              </ul>
              <a
                href="/asesoria-juridica"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-400 transition-colors hover:text-gold-300"
              >
                Ver más
                <ArrowRight className="size-4" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ¿Por qué elegirnos? */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8" aria-labelledby="porque-title">
        <h2
          id="porque-title"
          className="text-center font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl"
        >
          ¿Por qué elegirnos?
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whyUs.map((w) => (
            <div
              key={w.title}
              className="rounded-2xl border border-bone-200/70 bg-white p-6 text-center shadow-sm"
            >
              <span className="mx-auto grid size-12 place-items-center rounded-xl bg-pine-100 text-pine-800">
                <w.icon className="size-6" aria-hidden />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-ink-900">{w.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{w.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Blog */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8" aria-labelledby="blog-title">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-600">
              Blog Fyrama
            </p>
            <h2
              id="blog-title"
              className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl"
            >
              Nuestro blog
            </h2>
          </div>
          <LinkButton href="/blog" variant="outline">
            Ver el blog
            <ArrowRight className="size-4" aria-hidden />
          </LinkButton>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard
              key={a.id}
              article={{
                slug: a.slug,
                title: a.title,
                excerpt: a.excerpt,
                coverUrl: a.coverMedia?.url ?? null,
                coverAlt: a.coverAlt,
                categorySlug: a.category?.slug,
                categoryName: a.category?.name,
                author: a.author,
                publishedAt: a.publishedAt,
              }}
            />
          ))}
        </div>
      </section>

      {/* 7. Banner CTA pre-footer */}
      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-pine-900 to-pine-950 px-8 py-12 text-center sm:px-12">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-bone-50 sm:text-4xl">
            ¿Quieres vender una propiedad, estás buscando dónde vivir o
            necesitas asesoría legal?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-bone-100/75">
            Estamos aquí para ayudarte. Encuentra soluciones jurídicas e
            inmobiliarias confiables, claras y a tu medida.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <LinkButton
              href={buildWhatsAppUrl(
                "Hola, quiero más información sobre los servicios de Fyrama."
              )}
              variant="gold"
              size="lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contáctanos por WhatsApp
              <ArrowRight className="size-4" aria-hidden />
            </LinkButton>
            <LinkButton
              href="/viviendas"
              variant="outline"
              size="lg"
              className="border-[#ffffff]/25! text-[#fbfaf6]! hover:bg-[#ffffff]/10! hover:border-[#ffffff]/40!"
            >
              Explorar inmuebles
            </LinkButton>
          </div>
        </div>
      </section>

      {/* 8. Opiniones */}
      <Reviews />

      {/* 9. PQRS */}
      <PqrsSection />
    </>
  );
}