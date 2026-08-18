import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Pass-through layout for /countries.
 *
 * The destination content used to live here as fourteen stacked sections. It now
 * lives in `countries/index.tsx` (the grid) and `countries/$slug.tsx` (a page per
 * destination), and because TanStack Router treats a file sitting beside a
 * same-named directory as that directory's layout, this file has to render an
 * `<Outlet />` or neither child would ever appear.
 *
 * It holds no markup of its own deliberately: `blog/` and `success-stories/` have
 * no layout file at all, and putting chrome here would make /countries the one
 * section that wraps its children in something extra. The route tree is identical
 * with this file and without it, so it can simply be deleted.
 */
export const Route = createFileRoute("/countries")({
  component: Outlet,
});
