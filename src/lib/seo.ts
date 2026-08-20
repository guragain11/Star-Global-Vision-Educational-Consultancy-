import { itemsFrom, type CollectionSpec, type SiteContent } from "@/data/collections";
import { site, type SiteSettings } from "@/data/site";

/** Production origin, used whenever `VITE_SITE_URL` is not set. */
const DEFAULT_ORIGIN = "https://starglobalvision.com";

/**
 * Canonical origin of the deployed site, without a trailing slash.
 *
 * Facebook, X and LinkedIn all refuse to resolve a root-relative `og:image` or
 * `og:url`, so every URL that leaves the page has to be absolute. Set
 * `VITE_SITE_URL` on preview deployments to point the tags at that build
 * instead of production.
 */
export const siteUrl = (import.meta.env.VITE_SITE_URL ?? DEFAULT_ORIGIN).replace(/\/+$/, "");

/**
 * Absolute URL for a path on this site. Anything already absolute — a Supabase
 * storage cover image, say — is returned untouched, so this is safe to wrap
 * around values that may or may not be local.
 */
export function absoluteUrl(path: string): string {
  if (/^[a-z][a-z\d+.-]*:/i.test(path) || path.startsWith("//")) return path;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Share image for pages with no cover of their own, and the logo in the JSON-LD
 * blocks on the home and contact pages.
 *
 * Not for a page's own `og:image` tag. The root route already emits one, from the
 * editable `og_image` setting and falling back to this — and because head meta is
 * merged with the deepest match winning, a page that restates this here silently
 * overrides whatever staff uploaded in /admin. Seven pages used to, which left
 * that field changing nothing anywhere. Omit the tag and inherit the root's.
 */
export const defaultOgImage = absoluteUrl("/logo.png");

/**
 * The editable business details, for use inside a route's `head()`.
 *
 * `head()` is not a React component, so `useSettings()` cannot be called there —
 * but it does receive every match for the route, and the root match's loader data
 * is where the settings row lands. This digs it back out.
 *
 * The cast is unavoidable: `matches` is typed for the route asking, so its
 * `loaderData` is that route's shape rather than the root's. Falls back to the
 * defaults, because `head()` also runs before the loader has resolved on the
 * first render pass.
 */
export function settingsFromMatches(matches: Array<{ loaderData?: unknown }>): SiteSettings {
  const root = matches[0]?.loaderData as { settings?: SiteSettings } | undefined;
  return root?.settings ?? site;
}

/**
 * The live records of one collection, for use inside a route's `head()`.
 *
 * The FAQ block on the home page is written into the page as JSON-LD as well as
 * rendered, and the two have to agree — so the tag has to read the same edited
 * list the section does. Same match-digging as `settingsFromMatches`, same
 * fallback to the built-in list.
 */
export function collectionFromMatches<T>(
  matches: Array<{ loaderData?: unknown }>,
  spec: CollectionSpec<T>,
): T[] {
  const root = matches[0]?.loaderData as { content?: SiteContent } | undefined;
  return itemsFrom(root?.content, spec);
}

/** A single question/answer pair, shared by the FAQ list and its JSON-LD. */
export type FaqItem = { q: string; a: string };

/**
 * JSON-LD for an FAQ block, which lets the questions surface directly in search
 * results. Lives here rather than beside the component so the component file
 * only exports components (keeps Vite's fast refresh working).
 */
export function faqJsonLd(items: readonly FaqItem[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  });
}

/**
 * JSON-LD for a BreadcrumbList, useful for nested pages like /blog/$slug
 * and /success-stories/$slug.
 */
export function breadcrumbJsonLd(items: readonly { name: string; url: string }[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  });
}

/**
 * JSON-LD for an ItemList of study destinations, shown on /countries.
 */
export function itemListJsonLd(
  items: readonly { name: string; url: string; description?: string }[],
): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: absoluteUrl(item.url),
      ...(item.description ? { description: item.description } : {}),
    })),
  });
}
