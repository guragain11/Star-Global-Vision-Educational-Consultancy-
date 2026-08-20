import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Briefcase, CalendarDays, Compass, GraduationCap, Wallet } from "lucide-react";
import { useMemo, useState } from "react";

import { CtaBand, PageHero, SectionHeading, SiteLayout } from "@/components/site/Chrome";
import { CountryCard, EmptyState } from "@/components/site/ContentCards";
import { Reveal } from "@/components/site/Reveal";
import { Counter } from "@/components/site/Counter";
import type { Country } from "@/data/content";
import {
  countriesChooser,
  countriesCompare,
  countriesCta,
  countriesGrid,
  countriesHero,
} from "@/data/page-copy";
import { fetchCountries } from "@/lib/content-api";
import { capitalise, numberWord } from "@/lib/content-utils";
import { absoluteUrl, itemListJsonLd, settingsFromMatches } from "@/lib/seo";
import { useCopy } from "@/lib/use-site-content";

export const Route = createFileRoute("/countries/")({
  // Loaded here rather than in a hook so head() below can build the ItemList
  // JSON-LD from the live list, and the grid ships in the server HTML.
  loader: () => fetchCountries(),
  head: ({ loaderData, matches }) => {
    const settings = settingsFromMatches(matches);
    const countries = loaderData ?? [];
    const names = countries.map((c) => c.name);
    const count = countries.length;
    // "Australia, Canada and the UK" — an Oxford-comma-free list for prose.
    const nameList =
      names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : (names[0] ?? "");

    return {
      meta: [
        { title: `Country Guide: ${count} Study Destinations | ${settings.name}` },
        {
          name: "description",
          content: `Compare intakes, work rights, tuition and test requirements for studying in ${nameList} from Nepal.`,
        },
        { property: "og:title", content: `Study Abroad Country Guide | ${settings.name}` },
        {
          property: "og:description",
          content: `Compare intakes, work rights and test requirements across our ${numberWord(count)} study destinations.`,
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: absoluteUrl("/countries") },
      ],
      links: [{ rel: "canonical", href: absoluteUrl("/countries") }],
      scripts: [
        {
          type: "application/ld+json",
          children: itemListJsonLd(
            countries.map((c) => ({
              name: `Study in ${c.name}`,
              url: `/countries/${c.slug}`,
              description: c.blurb,
            })),
          ),
        },
      ],
    };
  },
  component: Countries,
});

/* -------------------------------------------------------------------------- */
/* Filters & decision guide                                                   */
/* -------------------------------------------------------------------------- */

const filters = [
  { key: "all", label: "All destinations" },
  { key: "primary", label: "Flagship" },
  { key: "secondary", label: "Also placing" },
] as const;

type FilterKey = (typeof filters)[number]["key"];

/**
 * Entry points for students who do not yet know where they want to go.
 * Each grouping is drawn from the highlights already written for those
 * countries, with no new claims, just a different way in.
 *
 * The picks are slugs, and any that no longer exists — because staff
 * unpublished or renamed a country — is dropped rather than rendered as a dead
 * link.
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
    picks: ["austria", "malta", "finland"],
  },
  {
    icon: CalendarDays,
    title: "I want to start soon",
    detail: "The most intakes per year, so you wait months rather than a full year.",
    picks: ["japan", "canada", "usa"],
  },
];

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

function Countries() {
  const countries = Route.useLoaderData();
  const [filter, setFilter] = useState<FilterKey>("all");

  const shown = useMemo(
    () => (filter === "all" ? countries : countries.filter((c) => c.tier === filter)),
    [filter, countries],
  );

  const flagshipCount = countries.filter((c) => c.tier === "primary").length;

  return (
    <SiteLayout>
      <PageHero
        {...useCopy(countriesHero, {
          title: `${capitalise(numberWord(countries.length))} destinations. One recommendation that fits you.`,
        })}
        highlight={4}
      >
        <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
          {/* Every entry carries a suffix, empty where there is none: a mixed
              array infers `string | undefined`, which exactOptionalPropertyTypes
              refuses to pass to an optional prop. */}
          {[
            { value: countries.length, suffix: "", label: "Destinations" },
            { value: flagshipCount, suffix: "", label: "Flagship countries" },
            { value: 98, suffix: "%", label: "Visa success rate" },
            { value: 12, suffix: "+", label: "Years placing students" },
          ].map((s) => (
            <div key={s.label}>
              <dt className="font-display text-2xl font-bold text-ink-foreground md:text-3xl">
                <Counter to={s.value} suffix={s.suffix} />
              </dt>
              <dd className="mt-1 text-xs text-ink-foreground/60">{s.label}</dd>
            </div>
          ))}
        </dl>
      </PageHero>

      {/* Grid */}
      <section className="mx-auto max-w-6xl px-5 py-14 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <SectionHeading {...useCopy(countriesGrid)} />

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

        {shown.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              title="No destinations in this group yet"
              detail="Try another filter, or ask us directly and we will tell you where your profile fits."
            />
          </div>
        ) : (
          /* Keyed on the filter so switching replays the stagger: it reads as the
             grid rebuilding rather than cards silently swapping in place. */
          <Reveal key={filter} stagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((c, i) => (
              <CountryCard key={c.slug} country={c} index={i} />
            ))}
          </Reveal>
        )}
      </section>

      <ComparisonTable rows={shown} />

      <DecisionGuide countries={countries} />

      {/* Closing CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-4 pt-16">
        <CtaBand
          {...useCopy(countriesCta)}
          primary={{ to: "/contact", label: "Book free counselling" }}
          secondary={{ to: "/success-stories", label: "See where students went" }}
        />
      </section>
    </SiteLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* Comparison table                                                           */
/* -------------------------------------------------------------------------- */

/** Every destination on one screen, the fastest way to narrow a shortlist. */
function ComparisonTable({ rows }: { rows: readonly Country[] }) {
  // Read before the empty-list guard below, because hooks have to run in the
  // same order on every render and an early return above one skips it.
  const heading = useCopy(countriesCompare, {
    intro: `Intakes, work rights, tuition and accepted tests for every destination, so you can narrow ${numberWord(rows.length)} down to a shortlist before you speak to anyone.`,
  });

  if (rows.length === 0) return null;

  return (
    <section className="border-y border-border bg-secondary/40 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <SectionHeading {...heading} />
        </Reveal>

        <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-4xl border-collapse text-left text-sm">
              <caption className="sr-only">
                Comparison of intakes, work rights, tuition and accepted English tests by
                destination
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
                    Tuition
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
                    className="border-b border-border/70 transition-colors duration-200 last:border-0 hover:bg-secondary/40"
                  >
                    <th scope="row" className="px-6 py-4 align-top font-medium">
                      <Link
                        to="/countries/$slug"
                        params={{ slug: c.slug }}
                        className="group inline-flex items-center gap-3"
                      >
                        <span className="surface-sun inline-flex size-8 shrink-0 items-center justify-center rounded-lg font-display text-[0.65rem] font-bold tracking-wider shadow-hair transition-transform duration-300 ease-brand group-hover:scale-105">
                          {c.flag}
                        </span>
                        <span className="link-sweep group-hover:text-primary">{c.name}</span>
                        {c.tier === "primary" && (
                          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-accent-foreground">
                            Top
                          </span>
                        )}
                      </Link>
                    </th>
                    <td className="px-6 py-4 align-top text-muted-foreground">{c.intakes}</td>
                    <td className="px-6 py-4 align-top text-muted-foreground">{c.work}</td>
                    <td className="px-6 py-4 align-top text-muted-foreground">{c.tuition}</td>
                    <td className="px-6 py-4 align-top text-muted-foreground">{c.tests}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Visa and work rules change regularly, and tuition varies by university and course. We
          confirm the current policy and a real fee quote for your intake before you apply.
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Decision guide                                                             */
/* -------------------------------------------------------------------------- */

/** For students who do not know where to start: enter by priority, not country. */
function DecisionGuide({ countries }: { countries: readonly Country[] }) {
  const bySlug = new Map(countries.map((c) => [c.slug, c]));

  return (
    <section className="mx-auto max-w-5xl px-5 py-16 md:py-24">
      <Reveal>
        <SectionHeading {...useCopy(countriesChooser)} />
      </Reveal>

      <Reveal stagger className="mt-10 grid gap-5 md:grid-cols-2">
        {priorities.map((p) => {
          // Drop a pick whose country is unpublished or renamed, rather than
          // linking somewhere that 404s.
          const picks = p.picks.map((slug) => bySlug.get(slug)).filter(Boolean) as Country[];
          if (picks.length === 0) return null;

          return (
            <div
              key={p.title}
              className="card-lift gradient-border spotlight rounded-3xl border border-border bg-card p-7 shadow-soft"
            >
              <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <p.icon className="size-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.detail}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {picks.map((c) => (
                  <Link
                    key={c.slug}
                    to="/countries/$slug"
                    params={{ slug: c.slug }}
                    className="press inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3.5 py-1.5 text-xs font-semibold hover:border-primary/40 hover:text-primary"
                  >
                    <Compass className="size-3.5 text-muted-foreground" />
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </Reveal>

      <Reveal className="mt-10 text-center">
        <Link
          to="/contact"
          className="link-sweep inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          Still undecided? Ask a counsellor <ArrowRight className="size-4" />
        </Link>
      </Reveal>
    </section>
  );
}
