import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CalendarDays,
  Check,
  GraduationCap,
  Home,
  Languages,
  ScrollText,
  Wallet,
} from "lucide-react";

import { CtaBand, SiteLayout } from "@/components/site/Chrome";
import { CountryCard, CoverFallback } from "@/components/site/ContentCards";
import { Reveal } from "@/components/site/Reveal";
import { RichText } from "@/components/site/RichText";
import { site } from "@/data/site";
import { fetchCountries, fetchCountry } from "@/lib/content-api";
import { toPlainText } from "@/lib/content-utils";
import { magneticProps } from "@/lib/pointer-effects";
import { absoluteUrl, breadcrumbJsonLd, defaultOgImage } from "@/lib/seo";

export const Route = createFileRoute("/countries/$slug")({
  // Both in the loader: head() below needs the country for per-page SEO, and the
  // related rail is real content that belongs in the server HTML.
  loader: async ({ params }) => {
    const [country, allCountries] = await Promise.all([
      fetchCountry(params.slug),
      fetchCountries(),
    ]);
    if (!country) throw notFound();
    return { country, allCountries };
  },
  head: ({ loaderData }) => {
    const c = loaderData?.country;
    if (!c) return {};

    const title = `Study in ${c.name} from Nepal | Star Global Vision`;
    const description = c.blurb || toPlainText(c.overview, 160);
    const url = absoluteUrl(`/countries/${c.slug}`);
    // Seed images are local paths; uploads are already absolute Supabase URLs,
    // and absoluteUrl leaves those alone.
    const image = c.image ? absoluteUrl(c.image) : defaultOgImage;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: `Study in ${c.name}` },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Country guide", url: "/countries" },
            { name: c.name, url: `/countries/${c.slug}` },
          ]),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: `Study abroad counselling for ${c.name}`,
            serviceType: "Education consulting",
            description,
            areaServed: { "@type": "Country", name: "Nepal" },
            provider: {
              "@type": "EducationalOrganization",
              name: site.legalName,
              url: absoluteUrl("/"),
            },
          }),
        },
      ],
    };
  },
  component: CountryDetail,
  notFoundComponent: CountryNotFound,
});

function CountryNotFound() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-5 py-24 text-center">
        <p className="eyebrow">Destination not found</p>
        <h1 className="mt-4 font-display text-3xl font-bold md:text-4xl">
          We could not find that destination
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          It may have been renamed or is not one we currently counsel for. Browse the full country
          guide instead, or ask us and we will tell you honestly whether it is worth pursuing.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/countries"
            className="surface-brand press inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-soft hover:-translate-y-0.5 hover:shadow-lift"
          >
            <ArrowLeft className="size-4" /> All destinations
          </Link>
          <Link
            to="/contact"
            className="press inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary"
          >
            Ask a counsellor
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}

/** The sections the sticky nav jumps between, in page order. */
const sections = [
  { id: "at-a-glance", label: "At a glance" },
  { id: "overview", label: "Overview" },
  { id: "universities", label: "Universities" },
  { id: "requirements", label: "Requirements" },
] as const;

function CountryDetail() {
  const { country: c, allCountries } = Route.useLoaderData();

  const others = allCountries.filter((x) => x.slug !== c.slug);
  // Same tier first, so a flagship destination suggests its peers rather than
  // dropping the reader straight to the smaller markets.
  const related = [
    ...others.filter((x) => x.tier === c.tier),
    ...others.filter((x) => x.tier !== c.tier),
  ].slice(0, 3);

  const facts = [
    { icon: CalendarDays, label: "Intakes", value: c.intakes },
    { icon: Briefcase, label: "Work rights", value: c.work },
    { icon: Languages, label: "Tests accepted", value: c.tests },
    { icon: Wallet, label: "Tuition", value: c.tuition },
    { icon: Home, label: "Cost of living", value: c.cost_living },
  ].filter((f) => f.value.trim());

  return (
    <SiteLayout>
      <article>
        {/* Hero: the destination photo full-bleed, headline over it. */}
        <header className="surface-brand relative overflow-hidden">
          <div aria-hidden="true" className="absolute inset-0">
            {c.image ? (
              <img
                src={c.image}
                alt=""
                fetchPriority="high"
                className="size-full object-cover opacity-45"
              />
            ) : (
              <CoverFallback label={c.flag} seed={c.slug} className="size-full opacity-60" />
            )}
            {/* Two scrims: one to sink the photo into the brand navy, one to keep
                the bottom edge dark enough for the headline. */}
            <span className="absolute inset-0 bg-ink/70" />
            <span className="absolute inset-0 bg-linear-to-t from-ink via-ink/45 to-ink/70" />
          </div>

          <div className="relative mx-auto max-w-6xl px-5 py-16 md:py-24">
            <Link
              to="/countries"
              className="group inline-flex items-center gap-2 text-sm font-medium text-ink-foreground/70 transition-colors duration-200 hover:text-ink-foreground"
            >
              <ArrowLeft className="size-4 transition-transform duration-300 ease-brand group-hover:-translate-x-0.5" />
              All destinations
            </Link>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <span className="surface-sun inline-flex size-12 items-center justify-center rounded-2xl font-display text-sm font-bold tracking-wider shadow-lift">
                {c.flag}
              </span>
              {c.tier === "primary" && (
                <span className="rounded-full border border-ink-foreground/25 bg-ink-foreground/10 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-ink-foreground/90 backdrop-blur-sm">
                  Flagship destination
                </span>
              )}
            </div>

            <h1 className="mt-5 max-w-3xl text-balance font-display text-display-lg font-bold text-ink-foreground">
              Study in <span className="text-gradient-sun">{c.name}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-foreground/80 md:text-lg">
              {c.blurb}
            </p>

            {c.highlights.length > 0 && (
              <ul className="mt-8 flex flex-wrap gap-2.5">
                {c.highlights.map((h) => (
                  <li
                    key={h}
                    className="glass-ink inline-flex items-center gap-2 rounded-full border border-ink-foreground/20 px-3.5 py-1.5 text-xs font-medium text-ink-foreground/85"
                  >
                    <Check className="size-3.5 shrink-0 text-accent" />
                    {h}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/contact"
                {...magneticProps(6)}
                className="surface-sun magnetic inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold shadow-lift hover:shadow-float"
              >
                Ask about {c.name} <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/test-preparation"
                className="press inline-flex items-center gap-2 rounded-full border border-ink-foreground/30 px-6 py-3 text-sm font-semibold text-ink-foreground hover:border-ink-foreground/50 hover:bg-ink-foreground/10"
              >
                Prepare for {c.tests.split(" / ")[0] ?? "the test"}
              </Link>
            </div>
          </div>
        </header>

        {/* Sticky section nav. Plain anchors with scroll-mt on the targets, so it
            works before hydration and without JavaScript. */}
        <nav aria-label="On this page" className="glass sticky top-18 z-30 border-b border-border">
          <div className="mx-auto flex max-w-6xl items-center gap-4 px-5">
            <div className="no-scrollbar -mx-1 flex flex-1 gap-1.5 overflow-x-auto px-1 py-3">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="press shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                >
                  {s.label}
                </a>
              ))}
            </div>
            <Link
              to="/contact"
              className="press hidden shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft hover:-translate-y-0.5 hover:shadow-lift sm:inline-flex"
            >
              Free counselling
            </Link>
          </div>
        </nav>

        {/* At a glance: the numbers a student compares destinations on. */}
        <section id="at-a-glance" className="mx-auto max-w-6xl scroll-mt-32 px-5 py-14 md:py-20">
          <Reveal>
            <p className="eyebrow">At a glance</p>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">
              The numbers that decide it
            </h2>
          </Reveal>

          <Reveal stagger className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {facts.map((f) => (
              <div
                key={f.label}
                className="card-lift spotlight rounded-2xl border border-border bg-card p-6 shadow-soft [--lift:-0.1875rem]"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <f.icon className="size-4.5" />
                </span>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {f.label}
                </p>
                <p className="mt-1.5 text-sm font-medium leading-relaxed">{f.value}</p>
              </div>
            ))}
          </Reveal>
        </section>

        {/* Overview and requirements, side by side on a wide screen. */}
        <section className="border-y border-border bg-secondary/40 py-14 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
            <div id="overview" className="scroll-mt-32">
              <Reveal>
                <p className="eyebrow">The full picture</p>
                <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">
                  Studying in {c.name}
                </h2>
              </Reveal>
              <Reveal delay={80} className="mt-7">
                {c.overview.trim() ? (
                  <RichText source={c.overview} />
                ) : (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    We are still writing the full guide for {c.name}. In the meantime, a counsellor
                    can walk you through it in person.
                  </p>
                )}
              </Reveal>
            </div>

            {/* Universities rail. Sticky on desktop so it stays beside the prose. */}
            <aside id="universities" className="scroll-mt-32 lg:sticky lg:top-32 lg:self-start">
              <Reveal className="rounded-3xl border border-border bg-card p-7 shadow-soft">
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent-foreground">
                  <GraduationCap className="size-5" />
                </span>
                <h2 className="mt-4 font-display text-xl font-bold">Popular universities</h2>
                {c.universities.length > 0 ? (
                  <>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      Where we most often place students in {c.name}.
                    </p>
                    <ul className="mt-5 grid gap-2">
                      {c.universities.map((u) => (
                        <li
                          key={u}
                          className="flex items-start gap-2.5 rounded-xl bg-secondary/60 px-3.5 py-2.5 text-sm font-medium transition-colors duration-200 hover:bg-secondary"
                        >
                          <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                          {u}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                      Not an exhaustive list. We match you to universities that will accept your
                      grades and your budget, which is often not the one you have heard of.
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Ask us for the current partner list for {c.name} — it changes each intake.
                  </p>
                )}
              </Reveal>
            </aside>
          </div>
        </section>

        {/* Requirements */}
        <section id="requirements" className="mx-auto max-w-3xl scroll-mt-32 px-5 py-14 md:py-20">
          <Reveal>
            <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <ScrollText className="size-5" />
            </span>
            <p className="eyebrow mt-5">Entry and visa</p>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">
              What {c.name} asks of you
            </h2>
          </Reveal>
          <Reveal delay={80} className="mt-7">
            {c.requirements.trim() ? (
              <RichText source={c.requirements} />
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">
                Requirements for {c.name} depend heavily on your course. Bring your transcripts and
                we will tell you exactly what you need.
              </p>
            )}
          </Reveal>

          <Reveal className="mt-11">
            <p className="rounded-2xl border border-border bg-secondary/50 px-6 py-5 text-xs leading-relaxed text-muted-foreground">
              Visa policy, fees and work rules change regularly. Everything above is what applies at
              the time of writing; we confirm the current rules for your course and intake before
              you pay anything or lodge an application.
            </p>
          </Reveal>

          <aside className="mt-12">
            <CtaBand
              variant="quiet"
              title={`Ready to look at ${c.name} properly?`}
              intro="Bring your transcripts to the Bagbazar office for a free session. We will tell you which universities are realistic, what it will actually cost, and whether another destination would serve you better."
              primary={{ to: "/contact", label: "Book free counselling" }}
              secondary={{ to: "/success-stories", label: "See where students went" }}
            />
          </aside>
        </section>
      </article>

      {/* Related destinations */}
      {related.length > 0 && (
        <section className="border-t border-border bg-secondary/50 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-5">
            <Reveal className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-2xl font-bold md:text-3xl">Also worth comparing</h2>
              <Link
                to="/countries"
                className="link-sweep inline-flex items-center gap-2 text-sm font-semibold text-primary"
              >
                All destinations <ArrowRight className="size-4" />
              </Link>
            </Reveal>
            <Reveal stagger className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <CountryCard key={item.slug} country={item} />
              ))}
            </Reveal>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
