import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  Check,
  Compass,
  GraduationCap,
  Languages,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { CtaBand, PageHero, SectionHeading, SiteLayout } from "@/components/site/Chrome";
import { Reveal } from "@/components/site/Reveal";
import { countries, type Country } from "@/data/site";
import { absoluteUrl, defaultOgImage, itemListJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/countries")({
  head: () => ({
    meta: [
      { title: "Country Guide: Australia, USA, Canada, UK & More | Star Global Vision" },
      {
        name: "description",
        content:
          "Compare intakes, work rights and test requirements for studying in Australia, the U.S.A, Canada, the U.K, New Zealand, Europe and Japan from Nepal.",
      },
      { property: "og:title", content: "Study Abroad Country Guide | Star Global Vision" },
      {
        property: "og:description",
        content:
          "Compare intakes, work rights and test requirements across our seven study destinations.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: absoluteUrl("/countries") },
      { property: "og:image", content: defaultOgImage },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/countries") }],
    scripts: [
      {
        type: "application/ld+json",
        children: itemListJsonLd(
          countries.map((c) => ({
            name: `Study in ${c.name}`,
            url: `/countries#${c.slug}`,
            description: c.blurb,
          })),
        ),
      },
    ],
  }),
  component: Countries,
});

/* -------------------------------------------------------------------------- */
/* Filters & decision guide                                                   */
/* -------------------------------------------------------------------------- */

const filters = [
  { key: "all", label: "All destinations" },
  { key: "primary", label: "Flagship four" },
  { key: "secondary", label: "Also placing" },
] as const;

type FilterKey = (typeof filters)[number]["key"];

/**
 * Entry points for students who do not yet know where they want to go.
 * Each grouping is drawn from the highlights already written for those
 * countries above, with no new claims, just a different way in.
 */
const priorities = [
  {
    icon: Briefcase,
    title: "I want the strongest work rights",
    detail: "Longest post-study stay and the most generous hours while you study.",
    picks: ["australia", "canada", "uk"],
  },
  {
    icon: GraduationCap,
    title: "I want the widest choice of universities",
    detail: "The largest catalogues, scholarships and pathway options to choose from.",
    picks: ["usa", "uk", "australia"],
  },
  {
    icon: Wallet,
    title: "I want to keep costs low",
    detail: "Low or no tuition routes and balanced living costs.",
    picks: ["europe", "japan", "new-zealand"],
  },
  {
    icon: CalendarDays,
    title: "I want to start soon",
    detail: "The most intakes per year, so you wait months rather than a full year.",
    picks: ["japan", "canada", "usa"],
  },
];

/* -------------------------------------------------------------------------- */
/* Scroll spy                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Highlights the country currently under the reader in the sticky jump nav.
 * The rootMargin band keeps a single section active around the middle of the
 * viewport rather than flickering between two at the edges.
 */
function useScrollSpy(ids: string[]): string {
  const key = ids.join(",");
  const [active, setActive] = useState("");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );

    for (const id of key.split(",")) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [key]);

  return active;
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

function Countries() {
  const [filter, setFilter] = useState<FilterKey>("all");

  const shown = useMemo(
    () => (filter === "all" ? countries : countries.filter((c) => c.tier === filter)),
    [filter],
  );

  const active = useScrollSpy(shown.map((c) => c.slug));
  const flagshipCount = countries.filter((c) => c.tier === "primary").length;

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Country guide"
        title="Seven destinations. One recommendation that fits you."
        intro="Australia, the U.S.A, Canada and the U.K are our flagship destinations, and we also place students in New Zealand, Europe and Japan. Compare them properly, then let us tell you which one fits your profile."
      >
        <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
          {[
            { value: String(countries.length), label: "Destinations" },
            { value: String(flagshipCount), label: "Flagship countries" },
            { value: "98%", label: "Visa success rate" },
            { value: "12+", label: "Years placing students" },
          ].map((s) => (
            <div key={s.label}>
              <dt className="font-display text-2xl font-bold text-ink-foreground md:text-3xl">
                {s.value}
              </dt>
              <dd className="mt-1 text-xs text-ink-foreground/60">{s.label}</dd>
            </div>
          ))}
        </dl>
      </PageHero>

      {/* Sticky jump nav, tracks the section you are reading */}
      <div className="sticky top-18 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex items-center gap-4 py-3">
            <span className="hidden shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground xl:block">
              Jump to
            </span>
            <div className="no-scrollbar -mx-1 flex flex-1 gap-1.5 overflow-x-auto px-1 py-0.5">
              {shown.map((c) => {
                const isActive = active === c.slug;
                return (
                  <a
                    key={c.slug}
                    href={`#${c.slug}`}
                    aria-current={isActive ? "true" : undefined}
                    className={`press shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                    }`}
                  >
                    {c.name}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <section className="mx-auto max-w-6xl px-5 pt-12 md:pt-16">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <SectionHeading title="What each destination offers" />

          <div
            role="group"
            aria-label="Filter destinations"
            className="inline-flex rounded-full border border-border bg-card p-1 shadow-soft"
          >
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                aria-pressed={filter === f.key}
                className={`press rounded-full px-4 py-2 text-sm font-medium ${
                  filter === f.key
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/*
        Country sections: image and detail alternate sides for editorial rhythm.
        Only the first three reveal on scroll — by the fourth the reader is
        scanning for a country, and animation just delays what they came for.
      */}
      <section className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <div className="space-y-8 md:space-y-12">
          {shown.map((c, i) =>
            i < 3 ? (
              <Reveal key={c.slug}>
                <CountrySection country={c} index={i} flip={i % 2 === 1} />
              </Reveal>
            ) : (
              <CountrySection key={c.slug} country={c} index={i} flip={i % 2 === 1} />
            ),
          )}
        </div>
      </section>

      <ComparisonTable rows={shown} />

      <DecisionGuide />

      {/* Closing CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-4 pt-16">
        <CtaBand
          title="Not sure which country fits your profile and budget?"
          intro="Bring your transcripts to a free session and we will compare two or three realistic options side by side, including the ones we think you should rule out."
          primary={{ to: "/contact", label: "Book free counselling" }}
          secondary={{ to: "/success-stories", label: "See where students went" }}
        />
      </section>
    </SiteLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* Country section                                                            */
/* -------------------------------------------------------------------------- */

function CountrySection({
  country: c,
  index,
  flip,
}: {
  country: Country;
  index: number;
  flip: boolean;
}) {
  const facts = [
    { icon: CalendarDays, label: "Intakes", value: c.intakes },
    { icon: Briefcase, label: "Work rights", value: c.work },
    { icon: Languages, label: "Tests accepted", value: c.tests },
  ];

  return (
    <article
      id={c.slug}
      className="card-lift group scroll-mt-36 overflow-hidden rounded-4xl border border-border bg-card shadow-soft"
    >
      <div className="grid md:grid-cols-2">
        {/* Photo panel: the country's own image, with the name set over it */}
        <div
          className={`sheen relative min-h-64 overflow-hidden md:min-h-full ${flip ? "md:order-2" : ""}`}
        >
          <img
            src={c.image}
            alt={`Studying in ${c.name}`}
            loading="lazy"
            className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
          />
          {/* Scrim keeps the overlaid text readable on any photo */}
          <div className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/25 to-transparent" />

          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-6">
            <span className="surface-sun inline-flex size-11 items-center justify-center rounded-2xl font-display text-sm font-bold tracking-wider shadow-lift">
              {c.flag}
            </span>
            {c.tier === "primary" && (
              <span className="rounded-full bg-ink-foreground/95 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-primary shadow-soft">
                Top destination
              </span>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
            <h2 className="font-display text-3xl font-bold text-ink-foreground md:text-4xl">
              {c.name}
            </h2>
            <span className="font-display text-4xl font-bold text-ink-foreground/25">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex flex-col p-7 md:p-10">
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">{c.blurb}</p>

          <ul className="mt-6 grid gap-2.5">
            {c.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                {h}
              </li>
            ))}
          </ul>

          <dl className="mt-7 grid gap-4 rounded-2xl bg-secondary/60 p-6">
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <f.icon className="size-4 text-primary" /> {f.label}
                </dt>
                <dd className="mt-1 text-sm font-medium">{f.value}</dd>
              </div>
            ))}
          </dl>

          <Link
            to="/contact"
            className="press mt-7 inline-flex items-center justify-center gap-2 self-start rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:-translate-y-0.5 hover:shadow-lift"
          >
            Ask about {c.name}
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Comparison table                                                           */
/* -------------------------------------------------------------------------- */

/** Every destination on one screen, the fastest way to narrow a shortlist. */
function ComparisonTable({ rows }: { rows: readonly Country[] }) {
  if (rows.length === 0) return null;

  return (
    <section className="border-y border-border bg-secondary/40 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Compare"
          title="The whole picture on one screen"
          intro="Intakes, work rights and accepted tests for every destination, so you can narrow seven down to a shortlist before you speak to anyone."
        />

        <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-3xl border-collapse text-left text-sm">
              <caption className="sr-only">
                Comparison of intakes, work rights and accepted English tests by destination
              </caption>
              <thead>
                <tr className="border-b border-border bg-secondary/60">
                  <th scope="col" className="px-6 py-4 font-semibold">
                    Destination
                  </th>
                  <th scope="col" className="px-6 py-4 font-semibold">
                    Intakes
                  </th>
                  <th scope="col" className="px-6 py-4 font-semibold">
                    Work rights
                  </th>
                  <th scope="col" className="px-6 py-4 font-semibold">
                    Tests accepted
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr
                    key={c.slug}
                    className="border-b border-border/70 transition-colors last:border-0 hover:bg-secondary/40"
                  >
                    <th scope="row" className="px-6 py-4 align-top font-medium">
                      <a href={`#${c.slug}`} className="group inline-flex items-center gap-3">
                        <span className="surface-sun inline-flex size-8 shrink-0 items-center justify-center rounded-lg font-display text-[0.65rem] font-bold tracking-wider shadow-hair transition-transform duration-300 group-hover:scale-105">
                          {c.flag}
                        </span>
                        <span className="link-sweep group-hover:text-primary">{c.name}</span>
                        {c.tier === "primary" && (
                          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-accent-foreground">
                            Top
                          </span>
                        )}
                      </a>
                    </th>
                    <td className="px-6 py-4 align-top text-muted-foreground">{c.intakes}</td>
                    <td className="px-6 py-4 align-top text-muted-foreground">{c.work}</td>
                    <td className="px-6 py-4 align-top text-muted-foreground">{c.tests}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Visa and work rules change regularly. We confirm the current policy for your course and
          intake before you apply.
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Decision guide                                                             */
/* -------------------------------------------------------------------------- */

/** For students who do not know where to start: enter by priority, not country. */
function DecisionGuide() {
  const nameOf = (slug: string) => countries.find((c) => c.slug === slug)?.name ?? slug;

  return (
    <section className="mx-auto max-w-5xl px-5 py-16 md:py-24">
      <SectionHeading
        eyebrow="Help me choose"
        title="Start from what matters most to you"
        intro="Most students arrive with a country in mind and leave with a better one. Pick the priority that sounds like you and see where it points."
      />

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {priorities.map((p) => (
          <div
            key={p.title}
            className="card-lift gradient-border rounded-3xl border border-border bg-card p-7 shadow-soft"
          >
            <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <p.icon className="size-5" />
            </span>
            <h3 className="mt-5 text-lg font-semibold">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.detail}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {p.picks.map((slug) => (
                <a
                  key={slug}
                  href={`#${slug}`}
                  className="press inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3.5 py-1.5 text-xs font-semibold hover:border-primary/40 hover:text-primary"
                >
                  <Compass className="size-3.5 text-muted-foreground" />
                  {nameOf(slug)}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
