import { useLoaderData } from "@tanstack/react-router";

import { itemsFrom, type CollectionSpec, type SiteContent } from "@/data/collections";
import { blockFrom, type CopyBlock, type CopySection, type PageCopy } from "@/data/page-copy";
import { site, type SiteSettings } from "@/data/site";

/**
 * The live business details, loaded once by the root route.
 *
 * The top bar and footer render these on every page and cannot await, so
 * `__root` loads the row and every consumer reads it from there. That keeps the
 * contact details server-rendered and in step with the database, where a
 * client-side query would flash the defaults on each page load. Same arrangement
 * as `useCountries` — see lib/use-countries.ts.
 *
 * Falls back to the defaults in `src/data/site.ts` if the root loader data is
 * missing, so this can never return blank contact details.
 */
export function useSettings(): SiteSettings {
  const data = useLoaderData({ from: "__root__" }) as { settings?: SiteSettings } | undefined;
  return data?.settings ?? site;
}

/**
 * The live records of one collection, loaded once by the root route.
 *
 * Same arrangement as `useSettings` above, and for the same reason: these lists
 * belong in the server-rendered HTML, and the root loader fetches all of them in
 * one query. Falls back to the collection's built-in list whenever the table has
 * nothing for it — see `itemsFrom` for why that is preferred to an empty section.
 */
export function useCollection<T>(spec: CollectionSpec<T>): T[] {
  const data = useLoaderData({ from: "__root__" }) as { content?: SiteContent } | undefined;
  return itemsFrom(data?.content, spec);
}

/**
 * The eyebrow, heading and intro for one block of a page.
 *
 * Returns exactly the props `SectionHeading`, `PageHero` and `CtaBand` take, so
 * a call site is `<SectionHeading {...useCopy(homeProcess)} />` and the copy it
 * shows is visible in one place rather than spread across four attributes.
 *
 * `overrides` is for a heading or intro the page works out for itself — a
 * destination count, an exam count, the office phone number. Passing it here
 * rather than writing it into the block means the count keeps updating after
 * staff have saved the block, because a blank heading falls back to it. See
 * `blockFrom` for the precedence in full.
 *
 * Same loader-not-query arrangement as `useSettings` above: headings belong in
 * the server-rendered HTML, and the root route already fetched all fifty-two.
 */
export function useCopy(section: CopySection, overrides?: Partial<CopyBlock>): CopyBlock {
  const data = useLoaderData({ from: "__root__" }) as { copy?: PageCopy } | undefined;
  return blockFrom(data?.copy, section, overrides);
}
