import {
  ArrowRight,
  Check,
  House,
  HousePlus,
  KeyRound,
  Scale,
  ShieldCheck,
  Users,
  Handshake,
  Star,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/home/Hero";
import { ArticleCard } from "@/components/article/ArticleCard";
import { LinkButton } from "@/components/ui/Button";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { Testimonials } from "@/components/home/Testimonials";
import { Reviews } from "@/components/home/Reviews";
import { PqrsSection } from "@/components/home/PqrsSection";
import { getCities, listProperties } from "@/lib/services/property";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

async function getHomeData() {
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

  return { cities, featured: featured.items, articles };
}

const sellWhatsAppUrl = buildWhatsAppUrl(
  "Hola, quiero vender mi inmueble con el acompañamiento de Fyrama."
);

const quickSearch = [
  {
    icon: KeyRound,
    title: "Venta",
    text: "Encuentra la propiedad de tus sueños en nuestro catálogo.",
    href: "/viviendas?operacion=venta",
  },
  {
    icon: House,
    title: "Arrendamiento",
    text: "Tu próximo hogar te está esperando: casas y apartamentos.",
    href: "/viviendas?operacion=arriendo",
  },
  {
    icon: Handshake,
    title: "Permuta",
    text: "Cambia tu inmueble por otro sin tener que vender primero.",
    href: "/permuta",
  },
  {
    icon: HousePlus,
    title: "Vender",
    text: "Publica y vende tu propiedad con respaldo inmobiliario y jurídico.",
    href: sellWhatsAppUrl,
  },
];

const whyUs = [
  {
    icon: ShieldCheck,
    title: "Experiencia y confianza",
    text: "Trayectoria resolviendo trámites inmobiliarios y jurídicos con respaldo profesional.",
  },
  {
    icon: Users,
    title: "Atención personalizada",
    text: "Cada cliente es único: te acompañamos de principio a fin.",
  },
  {
    icon: Handshake,
    title: "Aliados estratégicos",
    text: "Trabajamos con notarías, bancos y constructoras de confianza.",
  },
  {
    icon: Star,
    title: "Compromiso",
    text: "Respondemos, cerramos procesos y cuidamos tu patrimonio.",
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
  const { cities, featured, articles } = await getHomeData();

  return (
    <>
      {/* 1. Hero + 2. Buscador de propiedades */}
      <Hero cities={cities} />

      {/* 3. ¿Qué estás buscando? */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8" aria-labelledby="que-buscas-title">
        <h2
          id="que-buscas-title"
          className="text-center font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl"
        >
          ¿Qué estás buscando?
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {quickSearch.map((s) => (
            <a
              key={s.title}
              href={s.href}
              target={s.href.startsWith("http") ? "_blank" : undefined}
              rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group rounded-2xl border border-bone-200/70 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-fyrama-lg"
            >
              <span className="grid size-14 place-items-center rounded-xl bg-gold-100 text-gold-700 transition-colors group-hover:bg-gold-500 group-hover:text-pine-950">
                <s.icon className="size-7" aria-hidden />
              </span>
              <h3 className="mt-5 font-display text-2xl font-semibold uppercase tracking-wide text-ink-900">
                {s.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{s.text}</p>
              <span className="mt-5 inline-flex size-9 items-center justify-center rounded-full border border-ink-900/10 text-ink-700 transition-colors group-hover:border-pine-950 group-hover:bg-pine-950 group-hover:text-bone-50">
                <ArrowRight className="size-4" aria-hidden />
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* 4. Propiedades destacadas */}
      <FeaturedProperties properties={featured} />

      {/* 5. Más que una inmobiliaria */}
      <section className="bg-pine-950 py-14 sm:py-16" aria-labelledby="compania-title">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">
              Nuestra compañía
            </p>
            <h2
              id="compania-title"
              className="mt-3 font-display text-3xl font-semibold tracking-tight text-bone-50 sm:text-4xl"
            >
              Más que una inmobiliaria, acompañamos tus decisiones
            </h2>
            <p className="mt-4 max-w-lg leading-relaxed text-bone-100/75">
              No solo te ayudamos a comprar, vender o arrendar: revisamos
              contratos, estudiamos los títulos y te acompañamos con asesoría
              jurídica profesional en cada paso. Una sola firma para proteger
              tu patrimonio de principio a fin.
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

      {/* 6. ¿Por qué elegirnos? */}
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

      {/* 7. Testimonios */}
      <Testimonials />

      {/* 8. Blog */}
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

      {/* 9. Banner CTA pre-footer */}
      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-pine-900 to-pine-950 px-8 py-12 text-center sm:px-12">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-bone-50">
            ¿Tienes una propiedad o estás buscando dónde vivir?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-bone-100/75">
            Hablemos. Estamos aquí para ayudarte.
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
              Explorar viviendas
            </LinkButton>
          </div>
        </div>
      </section>

      {/* 10a. Lo que dicen los clientes de nosotros */}
      <Reviews />

      {/* 10b. PQRS */}
      <PqrsSection />
    </>
  );
}