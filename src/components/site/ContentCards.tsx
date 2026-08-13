import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  GraduationCap,
  MapPin,
  Quote,
  SearchX,
} from "lucide-react";
import type { CSSProperties } from "react";

import type { BlogPost, SuccessStory } from "@/data/content";
import { formatDate, initials, readingTime } from "@/lib/content-utils";

/** Category chip. Sits over the cover photo, so it carries its own contrast. */
export function CategoryChip({
  category,
  onMedia = false,
}: {
  category: string;
  onMedia?: boolean;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[0.68rem] font-bold uppercase tracking-wider ${
        onMedia
          ? "bg-background/92 text-primary shadow-soft backdrop-blur-sm"
          : "bg-accent-soft text-accent-foreground"
      }`}
    >
      {category}
    </span>
  );
}

/**
 * Small stable hash. Used to vary the placeholder lighting per record, so a
 * grid of cards without photos still reads as six distinct things rather than
 * one gradient repeated six times.
 */
function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) % 100000;
  }
  return hash;
}

/**
 * Branded placeholder shown whenever a record has no image. The monogram is
 * oversized and cropped deliberately: it reads as a designed cover rather than
 * a missing-image box.
 */
function CoverFallback({
  label,
  seed,
  className = "",
}: {
  label: string;
  seed: string;
  className?: string;
}) {
  const hash = hashString(seed);

  return (
    <div
      className={`legacy-glow relative flex items-center justify-center overflow-hidden bg-ink ${className}`}
      style={
        {
          // legacy-glow's gradients fill the box by default, which leaves
          // background-position with nothing to shift. Oversizing them first is
          // what makes the per-record offset below actually visible.
          backgroundSize: "170% 170%",
          // Two independent knobs, so the highlight lands somewhere different
          // on every card while staying inside the brand palette.
          backgroundPosition: `${hash % 60}% ${hash % 40}%`,
          "--fallback-tilt": `${(hash % 24) - 12}deg`,
        } as CSSProperties
      }
    >
      <span
        aria-hidden="true"
        className="brand-grid absolute inset-0 opacity-[0.18] mix-blend-overlay"
      />
      <span
        className="relative font-display text-[3.25rem] font-bold leading-none text-ink-foreground/90 [rotate:var(--fallback-tilt)]"
        style={{ textShadow: "0 2px 24px oklch(0 0 0 / 0.35)" }}
      >
        {label}
      </span>
    </div>
  );
}

/** Bottom-up scrim so overlaid text stays legible on any photo. */
function MediaScrim() {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent"
    />
  );
}

export function BlogCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  const media = featured ? "h-60 md:h-full md:min-h-72" : "h-48";

  return (
    /* `relative` anchors the stretched title link below. Without it the
       after:inset-0 overlay would size to the nearest positioned ancestor. */
    <article
      className={`card-lift group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft ${
        featured ? "md:flex-row" : ""
      }`}
    >
      <div
        className={`sheen relative shrink-0 overflow-hidden ${featured ? "md:w-[46%]" : ""}`}
        aria-hidden="true"
      >
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt={post.title}
            loading="lazy"
            className={`w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] ${media}`}
          />
        ) : (
          <CoverFallback
            label={post.category.slice(0, 2).toUpperCase()}
            seed={post.slug}
            className={`w-full ${media}`}
          />
        )}

        <span className="absolute left-4 top-4 z-1">
          <CategoryChip category={post.category} onMedia />
        </span>
      </div>

      <div className={`flex flex-1 flex-col p-6 ${featured ? "md:p-9" : ""}`}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5 text-accent" />
            {formatDate(post.published_at)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5 text-accent" />
            {readingTime(post.content)} min read
          </span>
        </div>

        <h3
          className={`mt-3 font-display font-bold leading-snug tracking-[-0.01em] ${
            featured ? "text-2xl md:text-[2rem] md:leading-[1.15]" : "text-lg"
          }`}
        >
          <Link
            to="/blog/$slug"
            params={{ slug: post.slug }}
            className="transition-colors after:absolute after:inset-0 hover:text-primary"
          >
            {post.title}
          </Link>
        </h3>

        <p
          className={`mt-3 flex-1 text-sm leading-relaxed text-muted-foreground ${
            featured ? "line-clamp-4 md:text-base" : "line-clamp-3"
          }`}
        >
          {post.excerpt}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
          <span className="truncate text-xs font-medium text-muted-foreground">{post.author}</span>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary">
            Read
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </article>
  );
}

export function StoryCard({ story }: { story: SuccessStory }) {
  return (
    <article className="card-lift group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
      <div className="sheen relative aspect-[4/3] overflow-hidden">
        {story.photo ? (
          <img
            src={story.photo}
            alt={story.student_name}
            loading="lazy"
            className="size-full object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
          />
        ) : (
          <CoverFallback
            label={initials(story.student_name)}
            seed={story.slug}
            className="size-full"
          />
        )}

        <MediaScrim />

        <span className="absolute left-4 top-4 z-1 inline-flex items-center gap-1.5 rounded-full bg-background/92 px-3 py-1.5 text-xs font-bold text-primary shadow-soft backdrop-blur-sm">
          <MapPin className="size-3.5 text-accent" />
          {story.country}
        </span>

        {story.featured && (
          <span className="surface-sun absolute right-4 top-4 z-1 rounded-full px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-wider shadow-soft">
            Featured
          </span>
        )}

        {/* Name and institution sit on the photo: the student is the headline. */}
        <div className="absolute inset-x-0 bottom-0 z-1 p-5">
          <h3 className="font-display text-xl font-bold leading-tight text-ink-foreground drop-shadow-sm">
            {story.student_name}
          </h3>
          <p className="mt-1 inline-flex items-start gap-1.5 text-sm font-semibold text-ink-foreground/85">
            <GraduationCap className="mt-0.5 size-4 shrink-0 text-accent" />
            <span className="line-clamp-1">{story.university}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <blockquote className="flex-1">
          <Quote className="size-4 text-accent" />
          <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
            {story.quote}
          </p>
        </blockquote>

        <div className="mt-5 flex items-end justify-between gap-3 border-t border-border pt-4">
          <span className="min-w-0 text-xs text-muted-foreground">
            <span className="block truncate font-semibold text-foreground">{story.course}</span>
            {story.intake && <span className="mt-0.5 block truncate">{story.intake} intake</span>}
          </span>
          {/* Stretched from here rather than the overlaid name: this sits outside
              the media box, so the overlay covers the card instead of being
              clipped by overflow-hidden. */}
          <Link
            to="/success-stories/$slug"
            params={{ slug: story.slug }}
            aria-label={`Read ${story.student_name}'s story`}
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary after:absolute after:inset-0"
          >
            Read
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}

/** Pill row used for category / country filtering on the list pages. */
export function FilterPills({
  options,
  active,
  onChange,
  allLabel = "All",
}: {
  options: string[];
  active: string;
  onChange: (value: string) => void;
  allLabel?: string;
}) {
  const all = [allLabel, ...options];

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter">
      {all.map((option) => {
        const isActive = active === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={isActive}
            className={`press rounded-full px-4 py-2 text-sm font-medium ${
              isActive
                ? "surface-brand shadow-soft"
                : "border border-border bg-card text-muted-foreground shadow-hair hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

/** Shown when a filter or search returns nothing. */
export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="animate-in fade-in rounded-3xl border border-dashed border-border bg-secondary/40 px-6 py-16 text-center duration-500">
      <span className="mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-card text-muted-foreground shadow-hair">
        <SearchX className="size-5" />
      </span>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}

/**
 * Skeleton grid displayed while Supabase content loads. A directional shimmer
 * reads as loading; a flat pulse reads as a broken card.
 */
export function CardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="shimmer overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
        >
          <div className="h-48 bg-secondary/70" />
          <div className="space-y-3 p-6">
            <div className="h-4 w-24 rounded-full bg-secondary/70" />
            <div className="h-5 w-full rounded bg-secondary/70" />
            <div className="h-4 w-3/4 rounded bg-secondary/70" />
          </div>
        </div>
      ))}
    </div>
  );
}
