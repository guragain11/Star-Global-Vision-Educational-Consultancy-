import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowRight,
  ArrowUp,
  BadgeCheck,
  ChevronDown,
  Clock,
  Facebook,
  GraduationCap,
  Languages,
  Laptop,
  type LucideIcon,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Mic,
  Monitor,
  Moon,
  Phone,
  Sun,
  X,
} from "lucide-react";

import { examsSpec } from "@/data/collections";
import { examAnchor } from "@/data/exams";
import { sitePhones, telHref } from "@/data/site";
import { magneticProps } from "@/lib/pointer-effects";
import { useCountries } from "@/lib/use-countries";
import { useCollection, useSettings } from "@/lib/use-site-content";
import { useTheme } from "@/lib/use-theme";

import { SplitWords } from "./SplitWords";

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
  const settings = useSettings();
  // "Star Global Vision Educational Consultancy" minus "Star Global Vision".
  // The two lines are the trading name and the rest of the legal name, so
  // deriving the second from the first keeps them consistent when either is
  // edited, and falls back to the whole legal name if it does not start with the
  // trading name.
  const suffix = settings.legal_name.startsWith(settings.name)
    ? settings.legal_name.slice(settings.name.length).trim()
    : settings.legal_name;

  return (
    <Link
      to="/"
      className="group flex shrink-0 items-center gap-3"
      aria-label={`${settings.name} home`}
    >
      <img
        src={logo}
        alt={`${settings.legal_name} logo`}
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
          {settings.name}
        </span>
        {suffix && (
          <span
            className={`block text-[0.62rem] font-semibold uppercase tracking-[0.16em] ${
              inverted ? "text-ink-foreground/65" : "text-muted-foreground"
            }`}
          >
            {suffix}
          </span>
        )}
      </span>
    </Link>
  );
}

/** Slim utility bar above the header: contact details and approval badge. */
function TopBar() {
  const settings = useSettings();
  const phones = sitePhones(settings);

  return (
    <div className="surface-brand hidden border-b border-ink-foreground/10 lg:block">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-2 text-xs">
        <p className="inline-flex items-center gap-1.5 text-ink-foreground/80">
          <BadgeCheck className="size-3.5 text-accent" />
          {settings.approval}
        </p>
        <div className="flex items-center gap-5 text-ink-foreground/80">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5 text-accent" />
            {settings.hours}
          </span>
          {settings.email && (
            <a
              href={`mailto:${settings.email}`}
              className="inline-flex items-center gap-1.5 hover:text-ink-foreground"
            >
              <Mail className="size-3.5 text-accent" />
              {settings.email}
            </a>
          )}
          {phones[0] && (
            <a
              href={telHref(phones[0])}
              className="inline-flex items-center gap-1.5 hover:text-ink-foreground"
            >
              <Phone className="size-3.5 text-accent" />
              {phones[0]}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Header menus                                                               */
/* -------------------------------------------------------------------------- */

/** Shared row treatment for an entry inside either menu. */
const countryRowClass =
  "press flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground";

/**
 * The country's flag, from the 4:3 SVGs bundled in `public/flags`.
 *
 * Bundled rather than pulled from a flag CDN: the file is under 2KB, and a
 * hotlink would put the header's appearance at the mercy of someone else's
 * uptime and referrer policy.
 *
 * Falls back to the letter code when the file is missing. The admin flag field
 * is free text, so an unrecognised or mistyped code has to degrade to the old
 * chip instead of a broken-image icon in the header.
 */
function FlagChip({ code }: { code: string }) {
  const [failed, setFailed] = useState(false);
  const file = code.trim().toLowerCase();

  if (!file || failed) {
    return (
      <span className="surface-sun inline-flex size-7 shrink-0 items-center justify-center rounded-lg font-display text-[0.6rem] font-bold tracking-wider">
        {code}
      </span>
    );
  }

  return (
    <img
      src={`/flags/${file}.svg`}
      /* Decorative: the country name sits next to it in every row, so alt text
         here would only make a screen reader say the country twice. */
      alt=""
      loading="lazy"
      width={28}
      height={21}
      onError={() => setFailed(true)}
      /* Hairline ring so the flags with a white edge — Japan, Malta, Finland —
         keep a defined shape against the pale panel. */
      className="h-5 w-7 shrink-0 rounded-[0.1875rem] object-cover ring-1 ring-ink/15"
    />
  );
}

/**
 * The hover-and-focus disclosure behind both header dropdowns.
 *
 * "Destinations" and "Test Prep" open onto their contents rather than only
 * linking to the landing page, so a visitor who already knows where they want to
 * go — a country, or the one exam they need — gets there in one move.
 *
 * The trigger stays a link to the landing page rather than becoming a toggle
 * button. A toggle fights the hover: the pointer opens the panel on the way in,
 * so the click that follows would close what the user was reaching for. Leaving
 * it a link means clicking does the one thing the label promises, and the panel
 * is driven by hover and focus instead. Focus opening it is what keeps the menu
 * reachable by keyboard without a second control to tab through.
 *
 * A disclosure, not a menubar: the panel holds plain links, so `aria-expanded`
 * describes it honestly where `role="menu"` would promise arrow-key semantics
 * this does not implement.
 *
 * `children` is a function so the panel's links can close the menu they sit in
 * without every caller re-deriving the setter.
 */
function HeaderMenu({
  label,
  to,
  menuId,
  active,
  panelClass,
  children,
}: {
  label: string;
  to: SitePath;
  menuId: string;
  active: boolean;
  panelClass: string;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={wrap}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      /* Tabbing past the last link should close the panel behind you, rather
         than leaving it hanging open over the page. */
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <Link
        to={to}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={close}
        className={`press inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium ${
          active
            ? "bg-primary-soft text-primary"
            : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
        }`}
      >
        {label}
        <ChevronDown
          aria-hidden="true"
          className={`size-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </Link>

      {open && (
        <div
          id={menuId}
          className={`animate-in fade-in slide-in-from-top-1 glass absolute left-0 top-full z-50 rounded-2xl border border-border p-3 shadow-float duration-150 ${panelClass}`}
        >
          {children(close)}
        </div>
      )}
    </div>
  );
}

function DestinationsMenu() {
  const { pathname } = useLocation();
  const countries = useCountries();

  return (
    <HeaderMenu
      label="Destinations"
      to="/countries"
      menuId="destinations-menu"
      active={pathname.startsWith("/countries")}
      panelClass="w-120"
    >
      {(close) => (
        <>
          {/* Two columns: fourteen countries in one column would run past the
              fold on a laptop. */}
          <ul className="grid grid-cols-2 gap-0.5">
            {countries.map((c) => (
              <li key={c.slug}>
                <Link
                  to="/countries/$slug"
                  params={{ slug: c.slug }}
                  onClick={close}
                  className={countryRowClass}
                >
                  <FlagChip code={c.flag} />
                  <span className="truncate">{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to="/countries"
            onClick={close}
            className="mt-2 flex items-center justify-between gap-2 border-t border-border px-3 pt-3 text-sm font-semibold text-primary hover:text-primary/80"
          >
            Compare all {countries.length} destinations
            <ArrowRight className="size-4" />
          </Link>
        </>
      )}
    </HeaderMenu>
  );
}

/**
 * Icon per exam, keyed on the slug.
 *
 * Each one points at what actually separates that test from the others — a real
 * examiner, a machine score, sitting it at home, a different language — rather
 * than four interchangeable document icons. Lives here rather than in
 * `data/exams.ts` so the data file stays free of React imports, matching how
 * the test-preparation page maps its own icons.
 *
 * An exam added in /admin has no entry and falls back to the mortarboard, which
 * is why the slugs are keys here rather than a required field on the record.
 */
const examIcons: Record<string, LucideIcon> = {
  ielts: Mic,
  pte: Monitor,
  duolingo: Laptop,
  jlpt: Languages,
};

/**
 * Every exam, reached from any page.
 *
 * One column rather than the two the destinations use: there are only a handful
 * of entries, and the full names ("Duolingo English Test") are too long to sit
 * side by side.
 *
 * Rows link to the anchor for that exam on the single test-preparation page,
 * which is where the detail already lives — there are no per-exam routes, and
 * the page gives every card `scroll-mt-36` so the sticky header does not cover
 * the heading on arrival.
 */
function TestPrepMenu() {
  const { pathname } = useLocation();
  const exams = useCollection(examsSpec);

  return (
    <HeaderMenu
      label="Test Prep"
      to="/test-preparation"
      menuId="test-prep-menu"
      active={pathname.startsWith("/test-preparation")}
      panelClass="w-76"
    >
      {(close) => (
        <>
          <ul className="grid gap-0.5">
            {exams.map((e, i) => {
              const Icon = examIcons[e.slug] ?? GraduationCap;
              return (
                <li key={i}>
                  <Link
                    to="/test-preparation"
                    hash={examAnchor(e, i)}
                    onClick={close}
                    className={countryRowClass}
                  >
                    <span className="surface-brand inline-flex size-7 shrink-0 items-center justify-center rounded-lg">
                      <Icon aria-hidden="true" className="size-3.5" />
                    </span>
                    <span className="truncate">{e.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            to="/test-preparation"
            hash="compare"
            onClick={close}
            className="mt-2 flex items-center justify-between gap-2 border-t border-border px-3 pt-3 text-sm font-semibold text-primary hover:text-primary/80"
          >
            Compare all {exams.length} tests
            <ArrowRight className="size-4" />
          </Link>
        </>
      )}
    </HeaderMenu>
  );
}

/** The collapsible wrapper both sections share inside the mobile menu. */
function MobileSection({ label, children }: { label: string; children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
        className="press flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary"
      >
        {label}
        <ChevronDown
          aria-hidden="true"
          className={`size-4 text-muted-foreground transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && (
        <ul className="animate-in fade-in slide-in-from-top-1 my-1 ml-4 grid gap-0.5 border-l border-border pl-2 duration-150">
          {children}
        </ul>
      )}
    </div>
  );
}

/** The same countries, collapsed by default inside the mobile menu. */
function MobileDestinations({ onNavigate }: { onNavigate: () => void }) {
  const countries = useCountries();

  return (
    <MobileSection label="Destinations">
      <li>
        <Link
          to="/countries"
          onClick={onNavigate}
          className="press flex rounded-xl px-3 py-2 text-sm font-semibold text-primary hover:bg-secondary"
        >
          All {countries.length} destinations
        </Link>
      </li>
      {countries.map((c) => (
        <li key={c.slug}>
          <Link
            to="/countries/$slug"
            params={{ slug: c.slug }}
            onClick={onNavigate}
            className={countryRowClass}
          >
            <FlagChip code={c.flag} />
            {c.name}
          </Link>
        </li>
      ))}
    </MobileSection>
  );
}

/** The same exams, collapsed by default inside the mobile menu. */
function MobileTestPrep({ onNavigate }: { onNavigate: () => void }) {
  const exams = useCollection(examsSpec);

  return (
    <MobileSection label="Test Prep">
      <li>
        <Link
          to="/test-preparation"
          onClick={onNavigate}
          className="press flex rounded-xl px-3 py-2 text-sm font-semibold text-primary hover:bg-secondary"
        >
          All {exams.length} tests
        </Link>
      </li>
      {exams.map((e, i) => {
        const Icon = examIcons[e.slug] ?? GraduationCap;
        return (
          <li key={i}>
            <Link
              to="/test-preparation"
              hash={examAnchor(e, i)}
              onClick={onNavigate}
              className={countryRowClass}
            >
              <span className="surface-brand inline-flex size-7 shrink-0 items-center justify-center rounded-lg">
                <Icon aria-hidden="true" className="size-3.5" />
              </span>
              {e.name}
            </Link>
          </li>
        );
      })}
    </MobileSection>
  );
}

/* -------------------------------------------------------------------------- */
/* Theme toggle                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Light/dark switch for the header.
 *
 * Both icons are rendered and cross-faded rather than swapped conditionally: a
 * conditional render would pop, and it would also make the button's width jump
 * for one frame while the new glyph's font metrics settle. Stacking them in a
 * fixed-size box means the control never moves.
 *
 * `aria-pressed` rather than a switch role, because this is a two-state button
 * and the label already says which state pressing it produces.
 */
function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light mode" : "Dark mode"}
      className={`press relative grid size-10 place-items-center overflow-hidden rounded-full border border-border text-muted-foreground hover:border-primary/40 hover:text-primary ${className}`}
    >
      <Sun
        aria-hidden="true"
        className={`absolute size-4.5 transition-all duration-300 ease-brand ${
          dark ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
      />
      <Moon
        aria-hidden="true"
        className={`absolute size-4.5 transition-all duration-300 ease-brand ${
          dark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"
        }`}
      />
    </button>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const settings = useSettings();
  // The mobile call button uses the mobile number when there is one, falling back
  // to whatever single number the office has left set.
  const phones = sitePhones(settings);
  const callNumber = phones[1] ?? phones[0];

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
          scrolled ? "glass border-border/70 shadow-soft" : "border-transparent bg-background"
        }`}
      >
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-4 px-5">
          <Logo />

          {/* Seven items with two dropdown chevrons leave about 16px spare at the
              lg breakpoint, so the labels are whitespace-nowrap: without it flex
              shrinks the row and the two-word labels quietly wrap to two lines
              instead of anything visibly breaking. Another item needs the width
              found somewhere first. */}
          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
            {nav.map((item) =>
              item.to === "/countries" ? (
                <DestinationsMenu key={item.to} />
              ) : item.to === "/test-preparation" ? (
                <TestPrepMenu key={item.to} />
              ) : (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  activeProps={{ className: "bg-primary-soft text-primary" }}
                  className="press whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <ThemeToggle />
            <Link
              to="/contact"
              {...magneticProps(5)}
              className="surface-sun magnetic press rounded-full px-5 py-2.5 text-sm font-bold shadow-soft hover:shadow-lift"
            >
              Free counselling
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle className="size-11" />
            {callNumber && (
              <a
                href={telHref(callNumber)}
                aria-label={`Call ${callNumber}`}
                className="press rounded-full border border-border p-2.5 text-primary"
              >
                <Phone className="size-4" />
              </a>
            )}
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
            {nav.map((item) =>
              item.to === "/countries" ? (
                <MobileDestinations key={item.to} onNavigate={() => setOpen(false)} />
              ) : item.to === "/test-preparation" ? (
                <MobileTestPrep key={item.to} onNavigate={() => setOpen(false)} />
              ) : (
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
              ),
            )}
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="surface-sun press mt-3 rounded-full px-5 py-3 text-center text-sm font-bold shadow-soft"
            >
              Book free counselling
            </Link>
            <div className="mt-4 grid gap-2 border-t border-border pt-4 text-sm text-muted-foreground">
              {phones[0] && (
                <a href={telHref(phones[0])} className="inline-flex items-center gap-2">
                  <Phone className="size-4 text-accent" /> {phones[0]}
                </a>
              )}
              {settings.email && (
                <a href={`mailto:${settings.email}`} className="inline-flex items-center gap-2">
                  <Mail className="size-4 text-accent" /> {settings.email}
                </a>
              )}
              <p className="inline-flex items-center gap-2">
                <MapPin className="size-4 text-accent" /> {settings.address}
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
  const settings = useSettings();
  const phones = sitePhones(settings);

  return (
    <footer className="surface-brand mt-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo inverted />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-foreground/70">
            {settings.mission}
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-ink-foreground/25 px-3 py-1.5 text-xs font-medium text-ink-foreground/85">
            <BadgeCheck className="size-4 text-accent" />
            {settings.approval}
          </p>
          <div className="mt-6 flex gap-3">
            {settings.facebook && (
              <a
                href={settings.facebook}
                target="_blank"
                rel="noreferrer"
                aria-label={`${settings.name} on Facebook`}
                className="press rounded-full border border-ink-foreground/25 p-2.5 text-ink-foreground/80 hover:-translate-y-0.5 hover:border-accent/50 hover:bg-ink-foreground/10 hover:text-ink-foreground"
              >
                <Facebook className="size-4" />
              </a>
            )}
            {settings.whatsapp && (
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Chat with us on WhatsApp"
                className="press rounded-full border border-ink-foreground/25 p-2.5 text-ink-foreground/80 hover:-translate-y-0.5 hover:border-accent/50 hover:bg-ink-foreground/10 hover:text-ink-foreground"
              >
                <MessageCircle className="size-4" />
              </a>
            )}
            {settings.email && (
              <a
                href={`mailto:${settings.email}`}
                aria-label={`Email ${settings.name}`}
                className="press rounded-full border border-ink-foreground/25 p-2.5 text-ink-foreground/80 hover:-translate-y-0.5 hover:border-accent/50 hover:bg-ink-foreground/10 hover:text-ink-foreground"
              >
                <Mail className="size-4" />
              </a>
            )}
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
              {settings.address}
            </li>
            {phones.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <Phone className="mt-0.5 size-4 shrink-0 text-accent" />
                <a href={telHref(p)} className="transition-colors hover:text-ink-foreground">
                  {p}
                </a>
              </li>
            ))}
            {settings.email && (
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 size-4 shrink-0 text-accent" />
                <a
                  href={`mailto:${settings.email}`}
                  className="transition-colors hover:text-ink-foreground"
                >
                  {settings.email}
                </a>
              </li>
            )}
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 size-4 shrink-0 text-accent" />
              {settings.hours}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-foreground/15">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-xs text-ink-foreground/60">
          <p>
            © {new Date().getFullYear()} {settings.legal_name}. All rights reserved.
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
  const { whatsapp } = useSettings();

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
      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Chat with us on WhatsApp"
          className="press group flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3.5 font-semibold text-white shadow-lift hover:-translate-y-0.5 hover:shadow-float"
        >
          <MessageCircle className="size-5 transition-transform duration-300 group-hover:rotate-12" />
          <span className="hidden text-sm sm:inline">WhatsApp</span>
        </a>
      )}
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
  highlight = 0,
  children,
}: {
  /** Optional: only worth setting where it names a real category. */
  eyebrow?: string;
  title: string;
  intro: string;
  /**
   * Trailing words of the title to paint with the sun gradient. Off by default:
   * a gradient landing on "that fits you" reads as an accident, so each page
   * opts in with a count that ends on a phrase worth emphasising.
   */
  highlight?: number;
  children?: React.ReactNode;
}) {
  return (
    /* `aurora` replaces `surface-brand grid-glow` here: it paints the same brand
       gradient plus two drifting mesh blobs. It carries no `color`, so the ink
       foreground is set alongside it. */
    <section className="aurora relative overflow-hidden text-ink-foreground">
      {/*
        The one decorative light on the site. It lives here and in the home hero
        only — it used to be pasted into twelve places, at which point it stopped
        being a signature and became wallpaper.
      */}
      <div
        aria-hidden="true"
        className="float-drift pointer-events-none absolute -right-24 -top-32 size-96 rounded-full bg-accent/16 blur-3xl"
      />
      {/* Grain over the gradient. Without it the oklch ramp bands on an 8-bit panel. */}
      <span aria-hidden="true" className="noise absolute inset-0" />

      <div className="relative mx-auto max-w-6xl px-5 py-16 md:py-24">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        {/* Fluid display size rather than a 4xl→6xl breakpoint jump, revealed a
            word at a time. */}
        <SplitWords
          as="h1"
          text={title}
          highlightWords={highlight}
          className={`max-w-3xl text-balance font-display text-display-lg font-bold ${
            eyebrow ? "mt-4" : ""
          }`}
        />
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
  eyebrow,
  title,
  intro,
  primary,
  secondary,
  variant = "band",
}: {
  /**
   * Optional line above the heading. No CTA on the site uses one today, and the
   * prop exists because the copy for these bands is edited in /admin: a block
   * that offers an eyebrow box has to be able to render one.
   */
  eyebrow?: string;
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
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h2 className={`font-display text-2xl font-bold md:text-3xl ${eyebrow ? "mt-3" : ""}`}>
              {title}
            </h2>
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
          {eyebrow && <p className="eyebrow text-ink-foreground/70">{eyebrow}</p>}
          <h2
            className={`font-display text-2xl font-bold text-ink-foreground md:text-3xl ${
              eyebrow ? "mt-3" : ""
            }`}
          >
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
      {eyebrow && <p className="eyebrow relative text-ink-foreground/70">{eyebrow}</p>}
      <h2
        className={`relative mx-auto max-w-2xl font-display text-3xl font-bold text-ink-foreground md:text-4xl ${
          eyebrow ? "mt-3" : ""
        }`}
      >
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
