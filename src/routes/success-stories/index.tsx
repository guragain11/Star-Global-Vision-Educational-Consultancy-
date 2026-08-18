import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { CtaBand, PageHero, SectionHeading, SiteLayout } from "@/components/site/Chrome";
import { EmptyState, FilterPills, StoryCard } from "@/components/site/ContentCards";
import { Counter } from "@/components/site/Counter";
import { Reveal } from "@/components/site/Reveal";
import { fetchSuccessStories } from "@/lib/content-api";
import { absoluteUrl, defaultOgImage } from "@/lib/seo";
import { useStats } from "@/lib/use-countries";

export const Route = createFileRoute("/success-stories/")({
  // Loading in the loader rather than useQuery, so the grid renders in the initial
  // HTML instead of appearing only after client hydration.
  loader: () => fetchSuccessStories(),
  head: () => ({
    meta: [
      { title: "Student Success Stories: Visas & Offers | Star Global Vision" },
      {
        name: "description",
        content:
          "Real Nepali students placed in Australia, the U.K, Canada, the U.S.A, New Zealand and Japan, with their universities, courses, intakes and how their visa was approved.",
      },
      { property: "og:title", content: "Student Success Stories | Star Global Vision" },
      {
        property: "og:description",
        content:
          "Offers, visas and new beginnings. Read how students from Bagbazar, Kathmandu reached world-ranked universities.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/success-stories") },
      { property: "og:image", content: defaultOgImage },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/success-stories") }],
  }),
  component: SuccessStoriesIndex,
});

function SuccessStoriesIndex() {
  const stories = Route.useLoaderData();
  const headlineStats = useStats();

  const [country, setCountry] = useState("All");

  const countries = useMemo(() => [...new Set(stories.map((s) => s.country))].sort(), [stories]);

  const filtered = useMemo(
    () => stories.filter((s) => country === "All" || s.country === country),
    [stories, country],
  );

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Success stories"
        title="Offers, visas and new beginnings."
        highlight={2}
        intro="Every student below sat in our Bagbazar office with the same questions you have now. These are their universities, their courses and what the process looked like."
      />

      {/* Results band */}
      <section className="border-b border-border bg-secondary/50">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 py-10 sm:grid-cols-4">
          {headlineStats.map((s) => (
            <div key={s.label} className="text-center sm:text-left">
              <dt className="font-display text-3xl font-bold text-primary md:text-4xl">
                <Counter to={s.to} suffix={s.suffix} />
              </dt>
              <dd className="mt-1 text-xs text-muted-foreground">{s.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 md:py-20">
        <Reveal>
          <SectionHeading
            eyebrow="Filter by destination"
            title="Where our students are studying now"
            intro="Pick a country to see the students we have placed there, and the universities that accepted them."
          />
        </Reveal>

        <div className="mt-8">
          <FilterPills
            options={countries}
            active={country}
            onChange={setCountry}
            allLabel="All countries"
          />
        </div>

        <div className="mt-10">
          {filtered.length === 0 ? (
            <EmptyState
              title="No stories for that destination yet"
              detail="We are still writing these up. Choose another country, or ask us directly about students we have placed there."
            />
          ) : (
            <>
              {/* Announced politely so filtering is not a silent change. */}
              <p className="mb-6 text-sm text-muted-foreground" role="status" aria-live="polite">
                {filtered.length} student{filtered.length === 1 ? "" : "s"}
                {country !== "All" ? ` in ${country}` : ""}
              </p>
              {/*
                No reveal on the grid: it re-mounts whenever the filter changes,
                so animating it made every filter click feel like a page load.
              */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="mt-16">
          <Reveal>
            <CtaBand
              variant="panel"
              title="Your story could be the next one here"
              intro="Start with a free profile assessment. We will tell you which countries and universities are realistic for your academics and your budget."
              primary={{ to: "/contact", label: "Book free counselling" }}
            />
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
