import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowUp,
  BadgeCheck,
  Clock,
  Facebook,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  X,
} from "lucide-react";

import { site, telHref } from "@/data/site";

/** Served straight from `public/`, no bundler import needed. */
const logo = "/logo.png";

const nav = [
  { to: "/", label: "Home" },
  { to: "/countries", label: "Destinations" },
  { to: "/test-preparation", label: "Test Prep" },
  { to: "/success-stories", label: "Success Stories" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

/**
 * The parameter-less routes a shared component may link to. Narrower than the
 * router's full path union on purpose: it keeps `Link` type-checked without
 * every caller having to thread route generics through a props object.
 */
type SitePath = (typeof nav)[number]["to"];

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link
      to="/"
      className="group flex shrink-0 items-center gap-3"
      aria-label={`${site.name} home`}
    >
      <img
        src={logo}
        alt={`${site.legalName} logo`}
        width={447}
        height={447}
        className={`h-11 w-auto shrink-0 rounded-lg transition-transform duration-300 group-hover:scale-105 ${
          inverted ? "bg-ink-foreground p-1" : ""
        }`}
      />
      <span className="hidden leading-tight sm:block">
        <span
          className={`block font-display text-[1.05rem] font-bold tracking-tight ${
            inverted ? "text-ink-foreground" : "text-foreground"
          }`}
        >
          Star Global Vision
        </span>
        <span
          className={`block text-[0.62rem] font-semibold uppercase tracking-[0.16em] ${
            inverted ? "text-ink-foreground/65" : "text-muted-foreground"
          }`}
        >
          Educational Consultancy
        </span>
      </span>
    </Link>
  );
}

/** Slim utility bar above the header: contact details and approval badge. */
function TopBar() {
  return (
    <div className="surface-brand hidden border-b border-ink-foreground/10 lg:block">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-2 text-xs">
        <p className="inline-flex items-center gap-1.5 text-ink-foreground/80">
          <BadgeCheck className="size-3.5 text-accent" />
          {site.approval}
        </p>
        <div className="flex items-center gap-5 text-ink-foreground/80">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5 text-accent" />
            {site.hours}
          </span>
          <a
            href={`mailto:${site.email}`}
            className="inline-flex items-center gap-1.5 hover:text-ink-foreground"
          >
            <Mail className="size-3.5 text-accent" />
            {site.email}
          </a>
          <a
            href={telHref(site.phones[0])}
            className="inline-flex items-center gap-1.5 hover:text-ink-foreground"
          >
            <Phone className="size-3.5 text-accent" />
            {site.phones[0]}
          </a>
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      // Fraction of the document read, which drives the hairline under the header.
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(1, y / total) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Prevent the page scrolling behind the open mobile menu.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Escape closes the mobile menu, expected of anything that covers the page.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-50">
      <TopBar />
      <div
        className={`border-b transition-shadow duration-300 ${
          scrolled
            ? "border-border/70 bg-background/90 shadow-soft backdrop-blur-xl"
            : "border-transparent bg-background"
        }`}
      >
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-4 px-5">
          <Logo />

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "bg-primary-soft text-primary" }}
                className="press rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              to="/contact"
              className="surface-sun press rounded-full px-5 py-2.5 text-sm font-bold shadow-soft hover:-translate-y-0.5 hover:shadow-lift"
            >
              Free counselling
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <a
              href={telHref(site.phones[1])}
              aria-label={`Call ${site.phones[1]}`}
              className="press rounded-full border border-border p-2.5 text-primary"
            >
              <Phone className="size-4" />
            </a>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="press rounded-lg border border-border p-2.5"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/*
          Reading progress. Decorative and scroll-derived, so it is hidden from
          assistive tech, because a screen reader gets nothing useful from a bar that
          only restates scroll position.
        */}
        <div aria-hidden="true" className="relative h-px">
          <div
            className="h-px origin-left bg-linear-to-r from-primary to-accent transition-transform duration-150 ease-out"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
      </div>

      {open && (
        <div className="animate-in slide-in-from-top-2 fade-in max-h-[calc(100vh-4.5rem)] overflow-y-auto border-b border-border bg-background px-5 py-4 shadow-float duration-200 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "bg-primary-soft text-primary" }}
                className="press rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="surface-sun press mt-3 rounded-full px-5 py-3 text-center text-sm font-bold shadow-soft"
            >
              Book free counselling
            </Link>
            <div className="mt-4 grid gap-2 border-t border-border pt-4 text-sm text-muted-foreground">
              <a href={telHref(site.phones[0])} className="inline-flex items-center gap-2">
                <Phone className="size-4 text-accent" /> {site.phones[0]}
              </a>
              <a href={`mailto:${site.email}`} className="inline-flex items-center gap-2">
                <Mail className="size-4 text-accent" /> {site.email}
              </a>
              <p className="inline-flex items-center gap-2">
                <MapPin className="size-4 text-accent" /> {site.address}
              </p>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const explore = nav.filter((n) => n.to !== "/");

  return (
    <footer className="surface-brand mt-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo inverted />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-foreground/70">
            {site.mission}
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-ink-foreground/25 px-3 py-1.5 text-xs font-medium text-ink-foreground/85">
            <BadgeCheck className="size-4 text-accent" />
            {site.approval}
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href={site.facebook}
              target="_blank"
              rel="noreferrer"
              aria-label="Star Global Vision on Facebook"
              className="press rounded-full border border-ink-foreground/25 p-2.5 text-ink-foreground/80 hover:-translate-y-0.5 hover:border-accent/50 hover:bg-ink-foreground/10 hover:text-ink-foreground"
            >
              <Facebook className="size-4" />
            </a>
            <a
              href={`https://wa.me/${site.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Chat with us on WhatsApp"
              className="press rounded-full border border-ink-foreground/25 p-2.5 text-ink-foreground/80 hover:-translate-y-0.5 hover:border-accent/50 hover:bg-ink-foreground/10 hover:text-ink-foreground"
            >
              <MessageCircle className="size-4" />
            </a>
            <a
              href={`mailto:${site.email}`}
              aria-label="Email Star Global Vision"
              className="press rounded-full border border-ink-foreground/25 p-2.5 text-ink-foreground/80 hover:-translate-y-0.5 hover:border-accent/50 hover:bg-ink-foreground/10 hover:text-ink-foreground"
            >
              <Mail className="size-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-ink-foreground/60">
            Explore
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-foreground/80">
            {explore.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="link-sweep inline-block transition-colors hover:text-ink-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-ink-foreground/60">
            Reach us
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-foreground/80">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
              {site.address}
            </li>
            {site.phones.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <Phone className="mt-0.5 size-4 shrink-0 text-accent" />
                <a href={telHref(p)} className="transition-colors hover:text-ink-foreground">
                  {p}
                </a>
              </li>
            ))}
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 size-4 shrink-0 text-accent" />
              <a
                href={`mailto:${site.email}`}
                className="transition-colors hover:text-ink-foreground"
              >
                {site.email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 size-4 shrink-0 text-accent" />
              {site.hours}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-foreground/15">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-xs text-ink-foreground/60">
          <p>
            © {new Date().getFullYear()} {site.legalName}. All rights reserved.
          </p>
          <a
            href="https://drillthru.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-ink-foreground/90"
          >
            Made with ❤️ by Drill Thru
          </a>
        </div>
      </div>
    </footer>
  );
}

/** Floating WhatsApp button plus a back-to-top control that appears on scroll. */
function FloatingActions() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-center gap-3">
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="animate-in fade-in slide-in-from-bottom-2 press rounded-full border border-border bg-card p-3 text-primary shadow-lift duration-300 hover:-translate-y-0.5 hover:shadow-float"
        >
          <ArrowUp className="size-5" />
        </button>
      )}
      <a
        href={`https://wa.me/${site.whatsapp}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="press group flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3.5 font-semibold text-white shadow-lift hover:-translate-y-0.5 hover:shadow-float"
      >
        <MessageCircle className="size-5 transition-transform duration-300 group-hover:rotate-12" />
        <span className="hidden text-sm sm:inline">WhatsApp</span>
      </a>
    </div>
  );
}

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  intro,
  children,
}: {
  /** Optional: only worth setting where it names a real category. */
  eyebrow?: string;
  title: string;
  intro: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="surface-brand grid-glow relative overflow-hidden">
      {/*
        The one decorative light on the site. It lives here and in the home hero
        only — it used to be pasted into twelve places, at which point it stopped
        being a signature and became wallpaper.
      */}
      <div
        aria-hidden="true"
        className="float-drift pointer-events-none absolute -right-24 -top-32 size-96 rounded-full bg-accent/16 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 left-1/4 size-80 rounded-full bg-primary/25 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-5 py-16 md:py-24">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1
          className={`max-w-3xl font-display text-4xl font-bold leading-[1.05] text-ink-foreground md:text-6xl ${
            eyebrow ? "mt-4" : ""
          }`}
        >
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-foreground/75 md:text-lg">
          {intro}
        </p>
        {children}
      </div>

      {/* Hairline that fades into the page below rather than stopping dead. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-ink-foreground/20 to-transparent"
      />
    </section>
  );
}

/** Shared section heading. The eyebrow is optional and most sections do without. */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className={`font-display text-3xl font-bold md:text-4xl ${eyebrow ? "mt-3" : ""}`}>
        {title}
      </h2>
      {intro && (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">{intro}</p>
      )}
    </div>
  );
}

/**
 * Closing call to action.
 *
 * Three variants because the same centred gradient panel used to end all six
 * pages, which made every page feel like the same page. Pick by page weight:
 * `panel` for the home page and the two list pages that need a hard stop,
 * `band` for a mid-weight page, `quiet` for the end of an article where a
 * gradient block would shout over the writing.
 */
export function CtaBand({
  title,
  intro,
  primary,
  secondary,
  variant = "band",
}: {
  title: string;
  intro?: string;
  primary: { to: SitePath; label: string };
  /** Optional second action. A phone link when `href` is set. */
  secondary?: { to?: SitePath; href?: string; label: string };
  variant?: "panel" | "band" | "quiet";
}) {
  const action = (
    <>
      <Link
        to={primary.to}
        className={
          variant === "quiet"
            ? "press inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:-translate-y-0.5 hover:shadow-lift"
            : "surface-sun press rounded-full px-6 py-3 text-sm font-bold shadow-lift hover:-translate-y-0.5"
        }
      >
        {primary.label}
      </Link>
      {secondary &&
        (secondary.href ? (
          <a
            href={secondary.href}
            className={`press rounded-full border px-6 py-3 text-sm font-semibold ${
              variant === "quiet"
                ? "border-border text-foreground hover:bg-secondary"
                : "border-ink-foreground/30 text-ink-foreground hover:bg-ink-foreground/10"
            }`}
          >
            {secondary.label}
          </a>
        ) : (
          <Link
            to={secondary.to ?? "/contact"}
            className={`press rounded-full border px-6 py-3 text-sm font-semibold ${
              variant === "quiet"
                ? "border-border text-foreground hover:bg-secondary"
                : "border-ink-foreground/30 text-ink-foreground hover:bg-ink-foreground/10"
            }`}
          >
            {secondary.label}
          </Link>
        ))}
    </>
  );

  // No gradient, no rounded panel: a rule, the ask, and the buttons.
  if (variant === "quiet") {
    return (
      <div className="border-t border-border pt-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-lg">
            <h2 className="font-display text-2xl font-bold md:text-3xl">{title}</h2>
            {intro && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{intro}</p>}
          </div>
          <div className="flex flex-wrap gap-3">{action}</div>
        </div>
      </div>
    );
  }

  // Left-aligned, squarer, shallower. Reads as part of the page, not a poster.
  if (variant === "band") {
    return (
      <div className="surface-brand relative overflow-hidden rounded-2xl px-7 py-10 shadow-lift md:px-12">
        <div className="relative max-w-2xl">
          <h2 className="font-display text-2xl font-bold text-ink-foreground md:text-3xl">
            {title}
          </h2>
          {intro && <p className="mt-3 text-sm leading-relaxed text-ink-foreground/75">{intro}</p>}
          <div className="mt-7 flex flex-wrap gap-3">{action}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-brand grid-glow relative overflow-hidden rounded-4xl px-8 py-14 text-center shadow-float md:px-16">
      <h2 className="relative mx-auto max-w-2xl font-display text-3xl font-bold text-ink-foreground md:text-4xl">
        {title}
      </h2>
      {intro && (
        <p className="relative mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink-foreground/75">
          {intro}
        </p>
      )}
      <div className="relative mt-8 flex flex-wrap justify-center gap-3">{action}</div>
    </div>
  );
}
