import { useLoaderData } from "@tanstack/react-router";

import { figuresSpec } from "@/data/collections";
import { seedCountries, type Country } from "@/data/content";
import { useCollection } from "@/lib/use-site-content";

/**
 * The live destination list, loaded once by the root route.
 *
 * The header renders on every page and cannot await, so `__root` loads the list
 * and every consumer reads it from there. That keeps the nav server-rendered and
 * in step with the database, where a client-side query would flash the seed list
 * on each page load.
 *
 * Falls back to the published seeds if the root loader data is somehow missing,
 * so this can never return an empty nav.
 */
export function useCountries(): Country[] {
  const data = useLoaderData({ from: "__root__" }) as { countries?: Country[] } | undefined;
  const countries = data?.countries;
  if (countries && countries.length > 0) return countries;
  return seedCountries.filter((c) => c.published);
}

/** One headline figure, in the shape `Counter` takes. */
export type Stat = { to: number; suffix: string; label: string };

/**
 * The headline figures used on the home, about and success-stories pages, with
 * the destination count read from the live list rather than hardcoded.
 *
 * The edited figures come through in their /admin order and the destination
 * count is inserted third, or last if there are fewer than three: it is the
 * figure the others are evidence for, and it reads better inside the row than at
 * the end. Staff cannot edit or reorder it, which is the point — it is always
 * exactly the number of destinations on the site.
 */
export function useStats(): Stat[] {
  const count = useCountries().length;
  const figures = useCollection(figuresSpec);
  const destinations = { to: count, suffix: "", label: "Study destinations" };

  return [...figures.slice(0, 2), destinations, ...figures.slice(2)];
}
