import { createFileRoute } from "@tanstack/react-router";

import { fetchBlogPosts, fetchCountries, fetchSuccessStories } from "@/lib/content-api";
import { absoluteUrl } from "@/lib/seo";

/**
 * The pages that aren't driven by Supabase, in nav order. `/admin` is left out
 * on purpose: it is staff-only, `noindex`, and disallowed in robots.txt.
 */
const staticPages = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/countries", changefreq: "monthly", priority: "0.9" },
  { path: "/test-preparation", changefreq: "monthly", priority: "0.9" },
  { path: "/success-stories", changefreq: "weekly", priority: "0.8" },
  { path: "/blog", changefreq: "weekly", priority: "0.8" },
  { path: "/contact", changefreq: "yearly", priority: "0.7" },
  { path: "/about", changefreq: "yearly", priority: "0.6" },
] as const;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * `<lastmod>` wants a W3C datetime, and a bare `YYYY-MM-DD` is its valid short
 * form. `published_at` is normally already that, but it arrives as a plain
 * string from Supabase, so anything unparseable is dropped rather than emitted
 * as an invalid date.
 */
function lastmod(publishedAt: string | null): string | null {
  return /^\d{4}-\d{2}-\d{2}/.exec(publishedAt ?? "")?.[0] ?? null;
}

type UrlEntry = {
  path: string;
  changefreq: string;
  priority: string;
  lastmod?: string | null;
  images?: { loc: string; title?: string }[];
};

function urlTag(entry: UrlEntry): string {
  const lines = [`    <loc>${escapeXml(absoluteUrl(entry.path))}</loc>`];
  if (entry.lastmod) lines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
  lines.push(
    `    <changefreq>${entry.changefreq}</changefreq>`,
    `    <priority>${entry.priority}</priority>`,
  );

  // Add image:image extensions for Google Image Search.
  if (entry.images?.length) {
    for (const img of entry.images) {
      lines.push(`    <image:image>`);
      lines.push(`      <image:loc>${escapeXml(absoluteUrl(img.loc))}</image:loc>`);
      if (img.title) lines.push(`      <image:title>${escapeXml(img.title)}</image:title>`);
      lines.push(`    </image:image>`);
    }
  }

  return `  <url>\n${lines.join("\n")}\n  </url>`;
}

/**
 * Built per request rather than at build time, so a post published from /admin
 * shows up in the sitemap without a redeploy. Every fetch falls back to the
 * seed content in src/data/content.ts if Supabase is unreachable, so a database
 * outage degrades to the static pages plus seeds instead of a 500.
 */
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const [posts, stories, countries] = await Promise.all([
          fetchBlogPosts(),
          fetchSuccessStories(),
          fetchCountries(),
        ]);

        const entries = [
          ...staticPages.map((page) => urlTag(page)),
          // One indexable page per destination, with its hero image. No
          // `lastmod`: the Country type carries only content columns, and
          // guessing a date is worse for crawlers than omitting it.
          ...countries.map((c) =>
            urlTag({
              path: `/countries/${c.slug}`,
              lastmod: null,
              changefreq: "monthly",
              priority: "0.8",
              images: c.image ? [{ loc: c.image, title: `Study in ${c.name}` }] : [],
            }),
          ),
          ...posts.map((post) =>
            urlTag({
              path: `/blog/${post.slug}`,
              lastmod: lastmod(post.published_at),
              changefreq: "monthly",
              priority: "0.6",
              images: post.cover_image ? [{ loc: post.cover_image, title: post.title }] : [],
            }),
          ),
          ...stories.map((story) =>
            urlTag({
              path: `/success-stories/${story.slug}`,
              lastmod: lastmod(story.published_at),
              changefreq: "yearly",
              priority: "0.5",
              images: story.photo ? [{ loc: story.photo, title: story.student_name }] : [],
            }),
          ),
        ];

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.join("\n")}
</urlset>
`;

        return new Response(xml, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            // Crawlers fetch this rarely, so an hour at the edge keeps a burst
            // of requests off Supabase without holding a new post back for long.
            "cache-control": "public, max-age=0, s-maxage=3600",
          },
        });
      },
    },
  },
});
