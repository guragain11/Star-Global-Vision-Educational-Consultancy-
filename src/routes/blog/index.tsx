import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { PageHero, SectionHeading, SiteLayout } from "@/components/site/Chrome";
import { BlogCard, EmptyState, FilterPills } from "@/components/site/ContentCards";
import { Counter } from "@/components/site/Counter";
import { Reveal } from "@/components/site/Reveal";
import { fetchBlogPosts } from "@/lib/content-api";
import { absoluteUrl, defaultOgImage } from "@/lib/seo";

export const Route = createFileRoute("/blog/")({
  // Loading in the loader rather than useQuery, so the grid renders in the initial
  // HTML instead of appearing only after client hydration.
  loader: () => fetchBlogPosts(),
  head: () => ({
    meta: [
      { title: "Study Abroad Blog: Visa, Test Prep & Scholarship Guides | Star Global Vision" },
      {
        name: "description",
        content:
          "Practical study abroad guides for Nepali students: student visa documentation, IELTS and PTE strategy, scholarships, destination comparisons and student life.",
      },
      { property: "og:title", content: "Study Abroad Blog | Star Global Vision" },
      {
        property: "og:description",
        content:
          "Visa checklists, test preparation strategy, scholarship guides and destination comparisons from our Kathmandu counselling team.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: absoluteUrl("/blog") },
      { property: "og:image", content: defaultOgImage },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/blog") }],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const posts = Route.useLoaderData();

  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const categories = useMemo(() => [...new Set(posts.map((p) => p.category))].sort(), [posts]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesCategory = category === "All" || post.category === category;
      const matchesSearch =
        !term ||
        post.title.toLowerCase().includes(term) ||
        post.excerpt.toLowerCase().includes(term) ||
        post.category.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [posts, category, search]);

  const [lead, ...rest] = filtered;
  const isUnfiltered = category === "All" && !search.trim();

  /* Annotated rather than inferred: one entry is a word, not a number, and
     without the annotation TypeScript infers three incompatible shapes and
     refuses the `text` access below. `to: null` is the "don't count this one"
     signal. */
  const heroStats: { to: number | null; text?: string; label: string }[] = [
    { to: posts.length, label: "Articles published" },
    { to: categories.length, label: "Topics covered" },
    { to: null, text: "Free", label: "Always, no signup" },
  ];

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Blog & resources"
        title="Guides written by the people who file the applications."
        highlight={4}
        intro="Visa documentation, test strategy, scholarships and destination comparisons, written by the counsellors and teachers who handle these files every day."
      >
        <dl className="mt-10 grid max-w-lg grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3">
          {heroStats.map((s) => (
            <div key={s.label}>
              <dt className="font-display text-2xl font-bold text-ink-foreground md:text-3xl">
                {s.to === null ? s.text : <Counter to={s.to} />}
              </dt>
              <dd className="mt-1 text-xs text-ink-foreground/60">{s.label}</dd>
            </div>
          ))}
        </dl>
      </PageHero>

      <section className="mx-auto max-w-6xl px-5 py-14 md:py-20">
        <Reveal>
          <SectionHeading
            eyebrow="Browse by topic"
            title="Find the guide for the stage you are at"
            intro="Filter by topic, or search by keyword to go straight to the article that covers your question."
          />
        </Reveal>

        <div className="mt-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <FilterPills
            options={categories}
            active={category}
            onChange={setCategory}
            allLabel="All"
          />

          <label className="relative w-full lg:max-w-xs">
            <span className="sr-only">Search articles</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles"
              className="w-full rounded-full border border-input bg-card py-2.5 pl-11 pr-4 text-sm shadow-hair outline-none transition-[border-color,box-shadow] duration-300 hover:border-primary/30 focus:border-primary/50 focus:shadow-soft focus:ring-2 focus:ring-ring/30"
            />
          </label>
        </div>

        <div className="mt-10">
          {filtered.length === 0 ? (
            <EmptyState
              title="No articles match that search"
              detail="Try a different keyword, or clear the filter to see every article we have published."
            />
          ) : (
            <>
              {/* Announced politely so filtering is not a silent change. */}
              <p className="mb-6 text-sm text-muted-foreground" role="status" aria-live="polite">
                {filtered.length} article{filtered.length === 1 ? "" : "s"}
                {category !== "All" ? ` in ${category}` : ""}
              </p>

              {/*
                Newest post gets a wide feature card when nothing is filtered.
                Nothing here animates in: the grid re-mounts on every keystroke
                in the search box, and a reveal made typing feel like loading.
              */}
              {isUnfiltered && lead ? (
                <div className="grid gap-6">
                  <BlogCard post={lead} featured />
                  {rest.length > 0 && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {rest.map((post) => (
                        <BlogCard key={post.id} post={post} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
