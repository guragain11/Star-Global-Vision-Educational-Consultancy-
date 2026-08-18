import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    /*
     * Cross-fades route changes through the View Transitions API. Chromium-only
     * today, and a no-op everywhere else — browsers without support navigate
     * instantly, which is the correct fallback rather than a degraded one. The
     * animation itself lives in styles.css under `::view-transition-*`, and is
     * skipped entirely under `prefers-reduced-motion`.
     */
    defaultViewTransition: true,
  });

  return router;
};
