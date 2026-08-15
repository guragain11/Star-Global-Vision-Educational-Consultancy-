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

/** Default share image, used by every page without a cover of its own. */
export const defaultOgImage = absoluteUrl("/logo.png");

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
export function breadcrumbJsonLd(
  items: readonly { name: string; url: string }[],
): string {
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
