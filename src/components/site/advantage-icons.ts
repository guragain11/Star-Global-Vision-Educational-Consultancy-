import { BadgeCheck, FileCheck2, LifeBuoy, Scale, School, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { Advantage } from "@/data/site";

/**
 * Maps the `icon` name on each advantage to a glyph. The names live in
 * `data/site.ts` as plain strings so the data file stays importable from
 * anywhere (including the sitemap route) without pulling in React.
 */
export const advantageIcons: Record<Advantage["icon"], LucideIcon> = {
  scale: Scale,
  school: School,
  "file-check": FileCheck2,
  "user-round": UserRound,
  "badge-check": BadgeCheck,
  "life-buoy": LifeBuoy,
};

/**
 * The glyph for a name, or the scales as a fallback.
 *
 * The name is chosen from a dropdown in /admin but stored inside a jsonb
 * column, so nothing at the database level stops a row from carrying a glyph
 * that has since been renamed in code. Rendering `undefined` as a component
 * would take out the whole page, and a wrong icon is a far cheaper failure.
 */
export function advantageIcon(name: string): LucideIcon {
  return advantageIcons[name as Advantage["icon"]] ?? Scale;
}
