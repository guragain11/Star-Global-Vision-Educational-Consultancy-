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
