import { useLoaderData } from "@tanstack/react-router";

import { seedCountries, type Country } from "@/data/content";
import { stats } from "@/data/site";

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
 * The four headline figures used on the home, about and success-stories pages,
 * with the destination count read from the live list rather than hardcoded.
 *
 * Third in the order on purpose: it is the figure the other three are evidence
 * for, and it reads better in the middle of the row than at the end.
 */
export function useStats(): Stat[] {
  const count = useCountries().length;
  return [
    stats.counselled,
    stats.visa,
    { to: count, suffix: "", label: "Study destinations" },
    stats.years,
  ];
}
