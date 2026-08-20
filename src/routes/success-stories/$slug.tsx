import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, CalendarDays, GraduationCap, MapPin, Quote } from "lucide-react";

import { CtaBand, SiteLayout } from "@/components/site/Chrome";
import { StoryCard } from "@/components/site/ContentCards";
import { Reveal } from "@/components/site/Reveal";
import { RichText } from "@/components/site/RichText";
import { storyCta, storyRelated } from "@/data/page-copy";
import { fetchSuccessStories, fetchSuccessStory } from "@/lib/content-api";
import { formatDate, initials, toPlainText } from "@/lib/content-utils";
import { magneticProps } from "@/lib/pointer-effects";
import { absoluteUrl, breadcrumbJsonLd, settingsFromMatches } from "@/lib/seo";
import { useCopy } from "@/lib/use-site-content";

export const Route = createFileRoute("/success-stories/$slug")({
  // Both fetches run in the loader so the related grid is in the server HTML.
  // as a useQuery it popped in after hydration and shifted the page.
  loader: async ({ params }) => {
    const [story, allStories] = await Promise.all([
      fetchSuccessStory(params.slug),
      fetchSuccessStories(),
    ]);
    if (!story) throw notFound();
    return { story, allStories };
  },
  head: ({ loaderData, matches }) => {
    const story = loaderData?.story;
    if (!story) return {};
    const settings = settingsFromMatches(matches);
    const description =
      toPlainText(story.quote, 160) ||
      `${story.student_name}, ${story.course} at ${story.university}.`;
    const url = absoluteUrl(`/success-stories/${story.slug}`);
    // Photos uploaded to Supabase storage are already absolute; absoluteUrl leaves
    // those alone and only fills in the origin for a local path.
    const photo = story.photo ? absoluteUrl(story.photo) : null;

    return {
      meta: [
        {
          title: `${story.student_name}, ${story.university}, ${story.country} | ${settings.name}`,
        },
        { name: "description", content: description },
        { property: "og:title", content: `${story.student_name}, ${story.university}` },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        ...(photo ? [{ property: "og:image", content: photo }] : []),
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      // Deliberately no schema.org/Review here. These stories are ours to
      // publish, but review markup submits them to Google as third-party
      // reviews of the business, which is a different claim and one we cannot
      // stand behind per-record. Visitors see the story either way.
      scripts: [
        {
          type: "application/ld+json",
          children: breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Success Stories", url: "/success-stories" },
            { name: story.student_name, url: `/success-stories/${story.slug}` },
          ]),
        },
      ],
    };
  },
  component: StoryDetail,
  notFoundComponent: StoryNotFound,
});

function StoryNotFound() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-5 py-24 text-center">
        <p className="eyebrow">Story not found</p>
        <h1 className="mt-4 font-display text-3xl font-bold md:text-4xl">
          We could not find that story
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          It may have been moved or unpublished. Browse all of our student success stories instead.
        </p>
        <Link
          to="/success-stories"
          className="surface-brand press mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-soft hover:-translate-y-0.5 hover:shadow-lift"
        >
          <ArrowLeft className="size-4" /> All success stories
        </Link>
      </section>
    </SiteLayout>
  );
}

function StoryDetail() {
  const { story, allStories } = Route.useLoaderData();
  // Read here rather than in the rail, which only renders when there is another
  // student to show. The first name is passed as the override so the heading
  // keeps naming them even after somebody saves this block.
  const relatedCopy = useCopy(storyRelated, {
    title: `Students we placed alongside ${story.student_name.split(" ")[0]}`,
  });

  const related = (() => {
    const others = allStories.filter((s) => s.slug !== story.slug);
    const sameCountry = others.filter((s) => s.country === story.country);
    return [...sameCountry, ...others.filter((s) => s.country !== story.country)].slice(0, 3);
  })();

  const facts = [
    { icon: MapPin, label: "Destination", value: story.country },
    { icon: GraduationCap, label: "Institution", value: story.university },
    { icon: BookOpen, label: "Course", value: story.course },
    { icon: CalendarDays, label: "Intake", value: story.intake },
  ].filter((f) => f.value);

  return (
    <SiteLayout>
      <article>
        {/* Same `aurora` treatment as the other article heroes. It carries no
            `color` of its own, so ink foreground is named alongside it. */}
        <header className="aurora relative overflow-hidden text-ink-foreground">
          <span aria-hidden="true" className="noise absolute inset-0" />
          <div className="relative mx-auto max-w-5xl px-5 py-16 md:py-20">
            <Link
              to="/success-stories"
              className="group inline-flex items-center gap-2 text-sm font-medium text-ink-foreground/70 transition-colors duration-200 hover:text-ink-foreground"
            >
              <ArrowLeft className="size-4 transition-transform duration-300 ease-brand group-hover:-translate-x-0.5" />
              All success stories
            </Link>

            <div className="mt-8 grid items-center gap-8 md:grid-cols-[auto_1fr]">
              {story.photo ? (
                <img
                  src={story.photo}
                  alt={story.student_name}
                  fetchPriority="high"
                  className="size-32 rounded-3xl object-cover shadow-float md:size-40"
                />
              ) : (
                <div className="surface-sun flex size-32 items-center justify-center rounded-3xl font-display text-4xl font-bold shadow-float md:size-40">
                  {initials(story.student_name)}
                </div>
              )}

              <div>
                <p className="eyebrow">
                  {story.country} · {story.intake}
                </p>
                <h1 className="mt-3 text-balance font-display text-display-md font-bold text-ink-foreground">
                  {story.student_name}
                </h1>
                <p className="mt-3 text-base font-semibold text-ink-foreground/90 md:text-lg">
                  {story.course}
                </p>
                <p className="text-sm text-ink-foreground/70">{story.university}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-5 py-14 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_18rem] lg:items-start">
            <div>
              {story.quote && (
                <Reveal
                  as="blockquote"
                  className="gradient-border spotlight rounded-3xl border border-border bg-card p-7 shadow-soft md:p-9"
                >
                  <Quote className="size-7 text-accent" />
                  <p className="mt-4 font-display text-lg leading-relaxed text-card-foreground md:text-xl">
                    “{story.quote}”
                  </p>
                  <footer className="mt-5 text-sm font-semibold text-muted-foreground">
                    {story.student_name}
                  </footer>
                </Reveal>
              )}

              {story.story && (
                <Reveal delay={80}>
                  <RichText source={story.story} className="mt-10" />
                </Reveal>
              )}
            </div>

            <aside className="lg:sticky lg:top-32">
              <div className="rounded-2xl border border-border bg-secondary/60 p-6 shadow-hair">
                <dl className="grid gap-4">
                  {facts.map((fact) => (
                    <div key={fact.label}>
                      <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <fact.icon className="size-4 text-primary" />
                        {fact.label}
                      </dt>
                      <dd className="mt-1 text-sm font-semibold">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
                  Published {formatDate(story.published_at)}
                </p>
                <Link
                  to="/contact"
                  {...magneticProps(4)}
                  className="surface-sun magnetic mt-4 block rounded-full px-5 py-3 text-center text-sm font-bold shadow-soft hover:shadow-lift"
                >
                  Start your application
                </Link>
              </div>
            </aside>
          </div>

          <Reveal className="mt-16">
            <CtaBand
              variant="quiet"
              {...useCopy(storyCta)}
              primary={{ to: "/contact", label: "Book free counselling" }}
            />
          </Reveal>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-border bg-secondary/50 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-5">
            <Reveal>
              <h2 className="font-display text-2xl font-bold md:text-3xl">{relatedCopy.title}</h2>
            </Reveal>
            <Reveal stagger className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <StoryCard key={item.id} story={item} />
              ))}
            </Reveal>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
