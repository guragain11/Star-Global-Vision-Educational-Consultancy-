import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { defaultOgImage } from "../lib/seo";

/** Suggested destinations on the 404 page, to keep a lost visitor inside the site. */
const notFoundLinks = [
  { to: "/countries", label: "Country guide" },
  { to: "/test-preparation", label: "Test preparation" },
  { to: "/success-stories", label: "Success stories" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact us" },
] as const;

function NotFoundComponent() {
  return (
    <div className="surface-brand grid-glow flex min-h-screen items-center justify-center px-5 py-16">
      <div className="max-w-lg text-center">
        <img
          src="/logo.png"
          alt="Star Global Vision Educational Consultancy"
          className="mx-auto h-16 w-auto rounded-xl bg-ink-foreground p-1.5 shadow-lift"
        />
        <p className="mt-8 font-display text-6xl font-bold text-gradient-sun md:text-7xl">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink-foreground md:text-3xl">
          This page has moved on
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-foreground/70">
          The page you were looking for doesn't exist any more. Try one of these instead, or call us
          and we'll point you the right way.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {notFoundLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-full border border-ink-foreground/25 px-4 py-2 text-sm font-medium text-ink-foreground/85 transition-colors hover:bg-ink-foreground/10 hover:text-ink-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <Link
          to="/"
          className="surface-sun mt-8 inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-bold shadow-lift transition-transform hover:-translate-y-0.5"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Star Global Vision Educational Consultancy" },
      {
        name: "description",
        content:
          "Study abroad consultancy in Bagbazar, Kathmandu, covering Australia, USA, Canada, UK, New Zealand, Europe, Japan and test preparation.",
      },
      { name: "author", content: "Star Global Vision Educational Consultancy" },
      { name: "theme-color", content: "#0b1f3a" },
      { property: "og:site_name", content: "Star Global Vision" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: defaultOgImage },
      { property: "og:locale", content: "en_NP" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@starglobalnp" },
      { name: "twitter:image", content: defaultOgImage },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap",
      },
      // The logo doubles as the site favicon, served straight from public/.
      { rel: "icon", href: "/logo.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/logo.png" },
      // Default OG/twitter image for pages without a cover of their own.
      // Absolute, because scrapers fetch it without a page to resolve against.
      { rel: "image_src", href: defaultOgImage },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        {/*
          Scroll-reveal elements ship hidden and are un-hidden by JS. If scripts
          never run, this brings every one of them back, so the content stays
          readable rather than staying invisible forever.
        */}
        <noscript>
          <style>
            {`[data-reveal],[data-reveal]>*{opacity:1!important;transform:none!important}`}
          </style>
        </noscript>
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
