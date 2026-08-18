import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Quote, Star } from "lucide-react";
import { CtaBand, SectionHeading, SiteLayout } from "@/components/site/Chrome";
import { advantageIcons } from "@/components/site/advantage-icons";
import { BlogCard, CoverFallback, StoryCard } from "@/components/site/ContentCards";
import { Counter } from "@/components/site/Counter";
import { FaqList } from "@/components/site/Faq";
import { Reveal } from "@/components/site/Reveal";
import { SplitWords } from "@/components/site/SplitWords";
import { absoluteUrl, defaultOgImage, faqJsonLd, siteUrl } from "@/lib/seo";
import { fetchBlogPosts, fetchSuccessStories } from "@/lib/content-api";
import { capitalise, numberWord } from "@/lib/content-utils";
import { magneticProps } from "@/lib/pointer-effects";
import { useCountries, useStats } from "@/lib/use-countries";
import {
  processSteps,
  services,
  site,
  telHref,
  testimonials,
  tests,
  partners,
  advantages,
  faqs,
} from "@/data/site";
import heroImage from "@/assets/hero-students.jpg";

export const Route = createFileRoute("/")({
  // Loading in the loader rather than useQuery, so the story and blog rails render in
  // the initial HTML instead of appearing only after client hydration.
  loader: async () => {
    const [stories, posts] = await Promise.all([fetchSuccessStories(), fetchBlogPosts()]);
    return { stories, posts };
  },
  head: () => ({
    meta: [
      { title: "Star Global Vision Educational Consultancy | Study Abroad from Nepal" },
      {
        name: "description",
        content:
          "Study abroad consultancy in Bagbazar, Kathmandu for Australia, Canada, USA, UK, New Zealand, the Nordics, Japan, South Korea, the UAE and more. IELTS, PTE, Duolingo and Japanese classes.",
      },
      { property: "og:title", content: "Star Global Vision Educational Consultancy" },
      {
        property: "og:description",
        content:
          "Counselling, documentation, test preparation and visa support for students from Nepal heading to world-ranked universities.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/") },
      { property: "og:image", content: defaultOgImage },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          name: site.legalName,
          alternateName: site.name,
          url: siteUrl,
          logo: defaultOgImage,
          email: site.email,
          telephone: site.phones,
          sameAs: [site.facebook],
          address: {
            "@type": "PostalAddress",
            streetAddress: "Bagbazar-28",
            addressLocality: "Kathmandu",
            addressCountry: "NP",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: faqJsonLd(faqs),
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { stories, posts } = Route.useLoaderData();
  const countries = useCountries();
  const headlineStats = useStats();
  const primary = countries.filter((c) => c.tier === "primary");
  // Named in the line under the rail, so the copy tracks the data.
  const alsoPlacing = countries.filter((c) => c.tier === "secondary").map((c) => c.name);

  // Featured stories lead; anything else fills the row up to three.
  const homeStories = (() => {
    const featured = stories.filter((s) => s.featured);
    return [...featured, ...stories.filter((s) => !s.featured)].slice(0, 3);
  })();

  const latestPosts = posts.slice(0, 3);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="aurora relative overflow-hidden text-ink-foreground">
        {/* Ambient light behind the headline: decorative, never announced. */}
        <div
          aria-hidden="true"
          className="float-drift pointer-events-none absolute -right-20 -top-28 size-[28rem] rounded-full bg-accent/14 blur-3xl"
        />
        <span aria-hidden="true" className="noise absolute inset-0" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-[1.05fr_1fr] md:py-24">
          <div>
            <p className="glass-ink inline-flex items-center gap-2 rounded-full border border-ink-foreground/25 px-3 py-1.5 text-xs font-medium text-ink-foreground/85">
              <BadgeCheck className="size-4 text-accent" />
              {site.approval}
            </p>
            {/* The five closing words take the sun gradient, which is where the
                promise of the sentence actually lands. */}
            <SplitWords
              as="h1"
              text="University applications, test preparation and visa filing, handled in one office."
              highlightWords={4}
              className="mt-6 text-balance font-display text-display-xl font-bold"
            />
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-foreground/75 md:text-lg">
              Star Global Vision guides students from Bagbazar, Kathmandu to world-ranked
              universities in Australia, the USA, Canada, the UK and beyond. Counselling,
              documentation, language classes and visa support under one roof.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/contact"
                {...magneticProps(7)}
                className="surface-sun magnetic inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-lift hover:shadow-float"
              >
                Book free counselling <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/countries"
                className="press inline-flex items-center gap-2 rounded-full border border-ink-foreground/30 px-6 py-3 text-sm font-semibold text-ink-foreground hover:border-ink-foreground/50 hover:bg-ink-foreground/10"
              >
                Country guide
              </Link>
            </div>
            <dl className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {headlineStats.map((s) => (
                <div key={s.label}>
                  <dt className="font-display text-2xl font-bold text-ink-foreground md:text-3xl">
                    <Counter to={s.to} suffix={s.suffix} />
                  </dt>
                  <dd className="mt-1 text-xs text-ink-foreground/60">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative">
            <img
              src={heroImage}
              alt="Students walking on a university campus abroad"
              width={1600}
              height={1104}
              fetchPriority="high"
              className="aspect-4/3 w-full rounded-3xl object-cover shadow-float"
            />
            <div className="glass absolute -bottom-6 left-4 hidden rounded-2xl border border-border/60 p-4 text-foreground shadow-float sm:block">
              <p className="flex items-center gap-1 text-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </p>
              <p className="mt-1 text-sm font-semibold">98% visa success rate</p>
              <p className="text-xs text-muted-foreground">
                Across {countries.length} destinations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/*
        Destinations. A rail rather than a chapter, so it sits tighter than the
        sections below it and leads straight into the partner band.
      */}
      <section className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Where you can go"
            title={`${capitalise(numberWord(primary.length))} flagship destinations, ${numberWord(
              countries.length,
            )} in total`}
          />
          <Link
            to="/countries"
            className="link-sweep inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            See full country guide <ArrowRight className="size-4" />
          </Link>
        </Reveal>
        <Reveal stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {primary.map((c) => (
            <Link
              key={c.slug}
              to="/countries/$slug"
              params={{ slug: c.slug }}
              /* Four cards in a row: a smaller lift than a full-width panel. */
              className="card-lift tilt group overflow-hidden rounded-2xl border border-border bg-card shadow-soft [--lift:-0.1875rem]"
            >
              {/* Destination photo from public/, keyed off the country data. */}
              <div className="sheen relative h-40 overflow-hidden">
                {c.image ? (
                  <img
                    src={c.image}
                    alt={`Studying in ${c.name}`}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-700 ease-brand group-hover:scale-110"
                  />
                ) : (
                  <CoverFallback label={c.flag} seed={c.slug} className="size-full" />
                )}
                <span className="surface-sun absolute left-4 top-4 z-2 inline-flex size-10 items-center justify-center rounded-xl font-display text-xs font-bold tracking-wider shadow-lift">
                  {c.flag}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold">{c.name}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {c.blurb}
                </p>
                <p className="mt-4 text-xs font-medium uppercase tracking-wider text-primary">
                  Intakes: {c.intakes}
                </p>
              </div>
            </Link>
          ))}
        </Reveal>
        <p className="mt-6 text-sm text-muted-foreground">
          Also guiding students to {alsoPlacing.slice(0, -1).join(", ")} and {alsoPlacing.at(-1)}.
        </p>
      </section>

      {/* Partner institutions: a quiet trust band between the two big sections */}
      <section className="relative overflow-hidden border-y border-border bg-secondary/40 py-10">
        <p className="eyebrow text-center [--eyebrow-color:var(--color-muted-foreground)]">
          Students placed at
        </p>

        {/*
          Marquee. The list is rendered twice so the -50% loop has no visible jump; the
          second copy is hidden from assistive tech and the first is the real
          list. Pausing on hover means a reader can read a name.
        */}
        <div className="mt-6 flex w-max marquee-track">
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              aria-hidden={copy === 1 ? "true" : undefined}
              className="flex items-center gap-x-10 px-5"
            >
              {partners.map((p) => (
                <li
                  key={p}
                  className="whitespace-nowrap font-display text-sm font-semibold text-muted-foreground/75 transition-colors hover:text-primary md:text-base"
                >
                  {p}
                </li>
              ))}
            </ul>
          ))}
        </div>

        {/* Fade the track into the page edges instead of clipping it. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-linear-to-r from-background to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l from-background to-transparent"
        />
      </section>

      {/* Services */}
      <section className="bg-secondary/60 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <SectionHeading title="Everything from the first question to the airport gate" />
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {services.map((s, i) => (
                <div
                  key={s.title}
                  className="card-lift gradient-border spotlight group relative overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-soft [--lift:-0.1875rem]"
                >
                  <span className="font-display text-sm font-bold text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.detail}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/*
        Process. Narrower measure than the sections around it: a six-step
        sequence reads better when it does not run the full width of the page.
      */}
      <section className="mx-auto max-w-5xl px-5 py-16 md:py-24">
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="Six steps from your first question to the departure gate"
            intro="You always know which step you are on, what we are waiting for, and what you need to bring next."
          />
        </Reveal>

        <Reveal as="ol" stagger className="relative mt-12 grid gap-6 sm:grid-cols-2">
          {processSteps.map((step) => (
            <li
              key={step.step}
              className="card-lift group relative overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-soft"
            >
              <span className="font-display text-5xl font-bold text-primary-soft transition-colors group-hover:text-accent-soft">
                {step.step}
              </span>
              <h3 className="-mt-3 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.detail}</p>
            </li>
          ))}
        </Reveal>
      </section>

      {/* Why us: the brand band, and the tallest section on the page. */}
      <section className="aurora relative overflow-hidden py-24 text-ink-foreground md:py-36">
        <span aria-hidden="true" className="noise absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-5">
          <Reveal className="max-w-2xl">
            <h2 className="font-display text-display-md font-bold text-ink-foreground">
              Why students choose us
            </h2>
          </Reveal>
          {/*
            Bento rather than a uniform three-across grid. Two of every four cards
            run double width, alternating which side of the row they sit on, so a
            group of four fills exactly two rows of three and the block never ends
            on a lone card. `auto-rows-fr` keeps the heights honest across a row.
          */}
          <Reveal stagger className="mt-10 grid auto-rows-fr gap-5 md:grid-cols-2 lg:grid-cols-3">
            {advantages.map((a, i) => {
              const Icon = advantageIcons[a.icon];
              const wide = i % 4 === 0 || i % 4 === 3;
              return (
                <div
                  key={a.title}
                  className={`glass-ink spotlight group rounded-3xl border border-ink-foreground/12 p-7 transition-colors duration-300 hover:border-accent/35 ${
                    wide ? "lg:col-span-2 lg:p-9" : ""
                  }`}
                >
                  <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-ink-foreground/10 text-accent transition-transform duration-300 ease-spring group-hover:scale-110">
                    <Icon className="size-5" />
                  </span>
                  <h3
                    className={`mt-5 font-semibold text-ink-foreground ${
                      wide ? "text-xl lg:text-2xl" : "text-lg"
                    }`}
                  >
                    {a.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-foreground/70">{a.detail}</p>
                </div>
              );
            })}
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-[1fr_1.3fr] md:items-center">
          <Reveal>
            <SectionHeading
              eyebrow="In-house classes"
              title="Test preparation that moves your score"
              intro="Batches capped at twelve, weekly full-length mocks and writing marked against the official band descriptors, for IELTS, PTE, Duolingo and JLPT Japanese, taught in the same building where your application is prepared."
            />
            <Link
              to="/test-preparation"
              className="press mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:-translate-y-0.5 hover:shadow-lift"
            >
              View classes &amp; schedule <ArrowRight className="size-4" />
            </Link>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {tests.map((t) => (
              <div
                key={t.name}
                className="card-lift rounded-xl border border-border bg-card p-6 shadow-hair [--lift:-0.125rem]"
              >
                <h3 className="font-semibold">{t.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t.duration} · {t.mode}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success stories, live from the admin, falling back to the starter set */}
      <section className="bg-secondary/60 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Student stories" title="Offers, visas and new beginnings" />
            <Link
              to="/success-stories"
              className="link-sweep inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              All success stories <ArrowRight className="size-4" />
            </Link>
          </Reveal>

          <div className="mt-10">
            {homeStories.length > 0 ? (
              <Reveal stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {homeStories.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </Reveal>
            ) : (
              /* No published stories yet, so fall back to short written testimonials. */
              <Reveal stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {testimonials.slice(0, 3).map((t) => (
                  <figure
                    key={t.name}
                    className="card-lift flex flex-col rounded-3xl border border-border bg-card p-7 shadow-soft"
                  >
                    <Quote className="size-6 text-accent" />
                    <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-card-foreground">
                      “{t.quote}”
                    </blockquote>
                    <figcaption className="mt-6 border-t border-border pt-4">
                      <span className="block text-sm font-semibold">{t.name}</span>
                      <span className="block text-xs text-muted-foreground">{t.result}</span>
                    </figcaption>
                  </figure>
                ))}
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* Latest from the blog: shallow, because it is a pointer, not a chapter. */}
      <section className="mx-auto max-w-6xl px-5 py-14 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading title="From our blog" />
          <Link
            to="/blog"
            className="link-sweep inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            Read all articles <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-10">
          {latestPosts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {latestPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              New articles are on the way. Check back soon.
            </p>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-secondary/60 py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="lg:sticky lg:top-36 lg:self-start">
            <SectionHeading
              eyebrow="Common questions"
              title="The things every student asks us first"
              intro={`Still unsure about something? Call ${site.phones[0]} or drop into the Bagbazar office. No appointment needed.`}
            />
            <Link
              to="/contact"
              className="press mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:-translate-y-0.5 hover:shadow-lift"
            >
              Ask us directly <ArrowRight className="size-4" />
            </Link>
          </div>
          <FaqList items={faqs} />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pt-20">
        <Reveal>
          <CtaBand
            variant="panel"
            title="Sit with a counsellor this week, free of cost"
            intro="Visit us at Bagbazar-28, Kathmandu or call and we will map out your country, course and budget."
            primary={{ to: "/contact", label: "Book an appointment" }}
            secondary={{ href: telHref(site.phones[1]), label: `Call ${site.phones[1]}` }}
          />
        </Reveal>
      </section>
    </SiteLayout>
  );
}
