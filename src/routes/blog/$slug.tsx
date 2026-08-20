import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Clock, User } from "lucide-react";

import { CtaBand, SiteLayout } from "@/components/site/Chrome";
import { BlogCard, CategoryChip } from "@/components/site/ContentCards";
import { Reveal } from "@/components/site/Reveal";
import { RichText } from "@/components/site/RichText";
import { postCta, postRelated } from "@/data/page-copy";
import { fetchBlogPost, fetchBlogPosts } from "@/lib/content-api";
import { formatDate, readingTime, toPlainText } from "@/lib/content-utils";
import { absoluteUrl, breadcrumbJsonLd, settingsFromMatches } from "@/lib/seo";
import { useCopy } from "@/lib/use-site-content";

export const Route = createFileRoute("/blog/$slug")({
  // Loading in the route loader lets the head() below emit real per-post SEO tags,
  // and puts the related grid in the server HTML instead of popping in on hydration.
  loader: async ({ params }) => {
    const [post, allPosts] = await Promise.all([fetchBlogPost(params.slug), fetchBlogPosts()]);
    if (!post) throw notFound();
    return { post, allPosts };
  },
  head: ({ loaderData, matches }) => {
    const post = loaderData?.post;
    if (!post) return {};
    const settings = settingsFromMatches(matches);
    const description = post.excerpt || toPlainText(post.content, 160);
    const url = absoluteUrl(`/blog/${post.slug}`);
    // Covers uploaded to Supabase storage are already absolute; absoluteUrl leaves
    // those alone and only fills in the origin for a local path.
    const cover = post.cover_image ? absoluteUrl(post.cover_image) : null;

    return {
      meta: [
        { title: `${post.title} | ${settings.name}` },
        { name: "description", content: description },
        { name: "author", content: post.author },
        { property: "og:title", content: post.title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        ...(cover ? [{ property: "og:image", content: cover }] : []),
        { property: "article:published_time", content: post.published_at },
        { property: "article:section", content: post.category },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description,
            datePublished: post.published_at,
            author: { "@type": "Organization", name: post.author },
            publisher: { "@type": "Organization", name: settings.legal_name },
            ...(cover ? { image: cover } : {}),
          }),
        },
        {
          type: "application/ld+json",
          children: breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Blog", url: "/blog" },
            { name: post.title, url: `/blog/${post.slug}` },
          ]),
        },
      ],
    };
  },
  component: BlogDetail,
  notFoundComponent: PostNotFound,
});

function PostNotFound() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-5 py-24 text-center">
        <p className="eyebrow">Article not found</p>
        <h1 className="mt-4 font-display text-3xl font-bold md:text-4xl">
          We could not find that article
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          It may have been moved or unpublished. Browse everything we have written instead.
        </p>
        <Link
          to="/blog"
          className="surface-brand press mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-soft hover:-translate-y-0.5 hover:shadow-lift"
        >
          <ArrowLeft className="size-4" /> Back to the blog
        </Link>
      </section>
    </SiteLayout>
  );
}

function BlogDetail() {
  const { post, allPosts } = Route.useLoaderData();
  // Read here rather than in the rail, which only renders when there is another
  // article to suggest.
  const relatedCopy = useCopy(postRelated);

  // Prefer same-category articles, then fill up to three with anything else.
  const related = (() => {
    const others = allPosts.filter((p) => p.slug !== post.slug);
    const sameCategory = others.filter((p) => p.category === post.category);
    return [...sameCategory, ...others.filter((p) => p.category !== post.category)].slice(0, 3);
  })();

  return (
    <SiteLayout>
      <article>
        {/* `aurora` for the same brand gradient the other heroes carry, plus its
            two drifting mesh blobs. It sets no `color`, so ink foreground is
            spelled out alongside it, and the grain stops the oklch ramp banding
            on an 8-bit panel. */}
        <header className="aurora relative overflow-hidden text-ink-foreground">
          <span aria-hidden="true" className="noise absolute inset-0" />
          <div className="relative mx-auto max-w-3xl px-5 py-16 md:py-20">
            <Link
              to="/blog"
              className="group inline-flex items-center gap-2 text-sm font-medium text-ink-foreground/70 transition-colors duration-200 hover:text-ink-foreground"
            >
              <ArrowLeft className="size-4 transition-transform duration-300 ease-brand group-hover:-translate-x-0.5" />
              All articles
            </Link>

            <div className="mt-6">
              <CategoryChip category={post.category} />
            </div>

            <h1 className="mt-5 text-balance font-display text-display-md font-bold text-ink-foreground">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-5 text-base leading-relaxed text-ink-foreground/75 md:text-lg">
                {post.excerpt}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-foreground/70">
              <span className="inline-flex items-center gap-2">
                <User className="size-4 text-ink-foreground/45" />
                {post.author}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="size-4 text-ink-foreground/45" />
                {formatDate(post.published_at)}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock className="size-4 text-ink-foreground/45" />
                {readingTime(post.content)} min read
              </span>
            </div>
          </div>
        </header>

        {post.cover_image && (
          <div className="mx-auto max-w-4xl px-5">
            <img
              src={post.cover_image}
              alt={post.title}
              fetchPriority="high"
              className="-mt-10 aspect-video w-full rounded-3xl object-cover shadow-float"
            />
          </div>
        )}

        <div className="mx-auto max-w-3xl px-5 py-14 md:py-20">
          <RichText source={post.content} />

          {/*
            A quiet ask at the end of an article: a gradient panel here competes
            with the writing above it, which is the thing that earned the ask.
          */}
          <Reveal as="aside" className="mt-14">
            <CtaBand
              variant="quiet"
              {...useCopy(postCta)}
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
                <BlogCard key={item.id} post={item} />
              ))}
            </Reveal>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
