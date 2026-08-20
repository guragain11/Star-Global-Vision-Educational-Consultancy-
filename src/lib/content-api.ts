import type { ContentRow, ErasedSpec, SiteContent } from "@/data/collections";
import {
  seedBlogPosts,
  seedCountries,
  seedSuccessStories,
  seedTeamMembers,
  type BlogPost,
  type Country,
  type SuccessStory,
  type TeamMember,
} from "@/data/content";
import { copyKey, type CopyRow, type PageCopy } from "@/data/page-copy";
import { site, type SiteSettings } from "@/data/site";
import { getSupabase, type Enquiry, type EnquiryInput, type EnquiryStatus } from "@/lib/supabase";

/**
 * Read helpers for public pages.
 *
 * Each function tries Supabase first and falls back to the seed content when
 * Supabase is unconfigured or the request fails, so a database outage degrades
 * to static content instead of an empty page.
 */

const byNewest = <T extends { published_at: string }>(a: T, b: T) =>
  b.published_at.localeCompare(a.published_at);

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const supabase = getSupabase();
  if (!supabase) return seedBlogPosts.filter((p) => p.published).sort(byNewest);

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error || !data) {
    console.error("Falling back to seed blog posts:", error?.message);
    return seedBlogPosts.filter((p) => p.published).sort(byNewest);
  }
  return data;
}

export async function fetchBlogPost(slug: string): Promise<BlogPost | null> {
  const supabase = getSupabase();
  if (!supabase) return seedBlogPosts.find((p) => p.slug === slug && p.published) ?? null;

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("Falling back to seed blog post:", error.message);
    return seedBlogPosts.find((p) => p.slug === slug && p.published) ?? null;
  }
  return data ?? null;
}

export async function fetchSuccessStories(): Promise<SuccessStory[]> {
  const supabase = getSupabase();
  if (!supabase) return seedSuccessStories.filter((s) => s.published).sort(byNewest);

  const { data, error } = await supabase
    .from("success_stories")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error || !data) {
    console.error("Falling back to seed success stories:", error?.message);
    return seedSuccessStories.filter((s) => s.published).sort(byNewest);
  }
  return data;
}

export async function fetchSuccessStory(slug: string): Promise<SuccessStory | null> {
  const supabase = getSupabase();
  if (!supabase) return seedSuccessStories.find((s) => s.slug === slug && s.published) ?? null;

  const { data, error } = await supabase
    .from("success_stories")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("Falling back to seed success story:", error.message);
    return seedSuccessStories.find((s) => s.slug === slug && s.published) ?? null;
  }
  return data ?? null;
}

/* -------------------------------------------------------------------------- */
/* Admin writes. These require an authenticated Supabase session.             */
/* -------------------------------------------------------------------------- */

/** Admin listing: includes unpublished drafts. */
export async function adminListBlogPosts(): Promise<BlogPost[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function adminListSuccessStories(): Promise<SuccessStory[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase
    .from("success_stories")
    .select("*")
    .order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveBlogPost(post: BlogPost): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { id, ...fields } = post;

  const { error } = id
    ? await supabase.from("blog_posts").update(fields).eq("id", id)
    : await supabase.from("blog_posts").insert(fields);

  if (error) throw new Error(error.message);
}

export async function saveSuccessStory(story: SuccessStory): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { id, ...fields } = story;

  const { error } = id
    ? await supabase.from("success_stories").update(fields).eq("id", id)
    : await supabase.from("success_stories").insert(fields);

  if (error) throw new Error(error.message);
}

export async function deleteBlogPost(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteSuccessStory(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.from("success_stories").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/* -------------------------------------------------------------------------- */
/* Enquiries                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Stores a contact form submission. Unlike the read helpers there is no
 * fallback: if this cannot be written the visitor has to be told, otherwise
 * they walk away believing a counsellor will call them back.
 */
export async function submitEnquiry(input: EnquiryInput): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error("The enquiry form is not connected yet. Please call or email us instead.");
  }

  const { error } = await supabase.from("enquiries").insert(input);
  if (error) throw new Error(error.message);
}

/** Admin listing, newest first. Requires an authenticated session. */
export async function adminListEnquiries(): Promise<Enquiry[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { data, error } = await supabase
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function updateEnquiry(
  id: string,
  patch: { status?: EnquiryStatus; notes?: string },
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.from("enquiries").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteEnquiry(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.from("enquiries").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/* -------------------------------------------------------------------------- */
/* Team members                                                                */
/* -------------------------------------------------------------------------- */

export async function fetchTeamMembers(): Promise<TeamMember[]> {
  const supabase = getSupabase();
  if (!supabase)
    return seedTeamMembers.filter((m) => m.published).sort((a, b) => a.sort_order - b.sort_order);

  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });

  if (error || !data) {
    console.error("Falling back to seed team members:", error?.message);
    return seedTeamMembers.filter((m) => m.published).sort((a, b) => a.sort_order - b.sort_order);
  }
  return data;
}

export async function adminListTeamMembers(): Promise<TeamMember[]> {
  const supabase = getSupabase();
  if (!supabase) return [...seedTeamMembers].sort((a, b) => a.sort_order - b.sort_order);

  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !data) {
    console.error("Falling back to seed team members:", error?.message);
    return [...seedTeamMembers].sort((a, b) => a.sort_order - b.sort_order);
  }
  return data;
}

export async function saveTeamMember(member: TeamMember): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { id, ...fields } = member;

  const { error } = id
    ? await supabase.from("team_members").update(fields).eq("id", id)
    : await supabase.from("team_members").insert(fields);

  if (error) throw new Error(error.message);
}

export async function deleteTeamMember(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.from("team_members").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/* -------------------------------------------------------------------------- */
/* Study destinations                                                          */
/* -------------------------------------------------------------------------- */

const bySortOrder = (a: Country, b: Country) =>
  a.sort_order - b.sort_order || a.name.localeCompare(b.name);

const publishedSeedCountries = () => seedCountries.filter((c) => c.published).sort(bySortOrder);

/**
 * Published destinations, in display order.
 *
 * Unlike the other read helpers this also falls back to the seeds when the table
 * is *empty*, not only when the request fails. The table ships empty and is
 * filled from /admin, so until staff do that the fourteen destinations we
 * counsel for still drive the site.
 *
 * Never throws: the header nav calls this on every route, so a database outage
 * has to degrade to seed content rather than break every page.
 */
export async function fetchCountries(): Promise<Country[]> {
  const supabase = getSupabase();
  if (!supabase) return publishedSeedCountries();

  const { data, error } = await supabase
    .from("countries")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });

  if (error || !data) {
    console.error("Falling back to seed countries:", error?.message);
    return publishedSeedCountries();
  }
  return data.length > 0 ? data : publishedSeedCountries();
}

/** One published destination by slug, or null when there is no such country. */
export async function fetchCountry(slug: string): Promise<Country | null> {
  const supabase = getSupabase();
  const fromSeed = () => seedCountries.find((c) => c.slug === slug && c.published) ?? null;
  if (!supabase) return fromSeed();

  const { data, error } = await supabase
    .from("countries")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("Falling back to seed country:", error.message);
    return fromSeed();
  }
  // A miss can mean the table is still empty rather than a bad slug, so check
  // the seeds before reporting not-found.
  return data ?? fromSeed();
}

/**
 * Admin listing: includes hidden destinations.
 *
 * Returns the live table as-is, empty included, so staff can tell the difference
 * between "nothing saved yet" and "fourteen rows". The editor offers to import
 * the seed defaults when it comes back empty.
 */
export async function adminListCountries(): Promise<Country[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("countries")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveCountry(country: Country): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { id, ...fields } = country;

  const { error } = id
    ? await supabase.from("countries").update(fields).eq("id", id)
    : await supabase.from("countries").insert(fields);

  if (error) throw new Error(error.message);
}

export async function deleteCountry(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.from("countries").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/**
 * Copies the fourteen seed destinations into the table so staff can edit them.
 *
 * Skips any slug already present, so running it twice cannot duplicate a row or
 * overwrite an edit. Returns how many were inserted.
 */
export async function importSeedCountries(): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");

  const existing = await adminListCountries();
  const taken = new Set(existing.map((c) => c.slug));
  const missing = seedCountries.filter((c) => !taken.has(c.slug));
  if (missing.length === 0) return 0;

  // Strip the seed ids: these are "seed-c1" placeholders, not uuids.
  const rows = missing.map(({ id: _id, ...fields }) => fields);
  const { error } = await supabase.from("countries").insert(rows);
  if (error) throw new Error(error.message);
  return rows.length;
}

/* -------------------------------------------------------------------------- */
/* Site settings                                                               */
/* -------------------------------------------------------------------------- */

/**
 * One of the admin tables is not reachable through the REST API.
 *
 * A class rather than a bare Error, so the UI can offer the one-time setup card
 * instead of showing an error message. The alternative is matching on
 * `error.message`, which breaks silently the moment the wording is edited.
 */
export class MissingTableError extends Error {
  readonly table: string;

  constructor(table: string) {
    super(
      `The "${table}" table is not in the database yet. Apply supabase/schema.sql — ` +
        `or if you already have, reload the API cache with: notify pgrst, 'reload schema';`,
    );
    this.name = "MissingTableError";
    this.table = table;
  }
}

export const isMissingTable = (error: unknown): error is MissingTableError =>
  error instanceof MissingTableError;

/**
 * Turns a failed admin request on one of the three tables this admin work added
 * into a message staff can act on.
 *
 * `supabase/schema.sql` is not applied by anything automatic — no migration
 * runner, no CI — so a table can exist in git and nowhere else. PostgREST
 * reports that as "Could not find the table 'public.site_content' in the schema
 * cache", which reads like a caching bug and sends whoever hits it looking in
 * entirely the wrong place.
 *
 * PGRST205 does not distinguish the two causes: PostgREST answers the same way
 * whether the table is genuinely absent or merely missing from the schema it has
 * cached, and the second happens routinely right after a fresh `create table`.
 * So the message names both fixes rather than guessing. 42P01 is Postgres' own
 * undefined_table, which arrives instead when the request gets past the cache.
 *
 * Public reads deliberately do not use this — they log and fall back to seed
 * content, because a missing table must degrade the site, not explain itself to
 * a visitor.
 */
function adminError(error: { code?: string; message: string }, table: string): Error {
  if (error.code === "PGRST205" || error.code === "42P01") return new MissingTableError(table);
  return new Error(error.message);
}

/**
 * Four fields that would visibly break the page if left blank: an empty
 * `<title>`, an empty meta description or an unnamed organisation in the JSON-LD
 * are all worse than showing the default.
 *
 * Every other field is used verbatim, blank included, because a blank there is a
 * decision — clearing the second phone number means the office has one number,
 * and coalescing it back to the default would make that impossible to express.
 */
const requiredSettings = ["name", "legal_name", "seo_title", "seo_description"] as const;

/**
 * Business details and SEO defaults for every page.
 *
 * Never throws. The header and footer call this through the root loader on every
 * route, so an outage has to degrade to the defaults in `src/data/site.ts`
 * rather than break the whole site — same contract as `fetchCountries`.
 *
 * The table ships with no row at all, so a miss is the normal state until staff
 * save the form once, not an error worth logging.
 */
export async function fetchSettings(): Promise<SiteSettings> {
  const supabase = getSupabase();
  if (!supabase) return site;

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", "main")
    .maybeSingle();

  if (error) {
    console.error("Falling back to default site settings:", error.message);
    return site;
  }
  if (!data) return site;

  /*
    Layered over the defaults rather than used on its own, so a column the row
    does not carry falls back instead of arriving as undefined.

    That is not hypothetical. `create table if not exists` does nothing at all
    when the table already exists, so schema.sql is safe to re-run but does not
    add columns to a table that predates them — and this function runs inside the
    root loader's Promise.all, where one `undefined.trim()` would 500 every page
    on the site, including the ones that never read a setting. Spreading is the
    difference between a missing column degrading to the default, which is this
    file's whole contract, and it taking the site down.

    Only absent keys are filled. A key that is present and empty stays empty,
    because per the note above a blank is a deliberate decision.
  */
  const merged = { ...site, ...data };
  for (const key of requiredSettings) {
    if (!merged[key].trim()) merged[key] = site[key];
  }
  return merged;
}

/**
 * The settings row for the editor.
 *
 * Returns the defaults when there is no row yet, so the form opens pre-filled
 * with the copy that is actually on the site rather than empty boxes. That also
 * means the first save writes real values instead of blanking the footer.
 *
 * Layered over the defaults for the same reason `fetchSettings` is: a column the
 * row does not carry would otherwise reach a text input as undefined, which
 * React turns into an uncontrolled field and the next save writes back as null.
 */
export async function adminGetSettings(): Promise<SiteSettings> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", "main")
    .maybeSingle();

  if (error) throw adminError(error, "site_settings");
  return data ? { ...site, ...data } : site;
}

/**
 * Creates or updates the single settings row.
 *
 * An upsert rather than insert-or-update: the row may not exist on the first
 * save, and `id` is pinned to `"main"` so this can never write a second one.
 */
export async function saveSettings(settings: SiteSettings): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.from("site_settings").upsert({ ...settings, id: "main" });
  if (error) throw adminError(error, "site_settings");
}

/* -------------------------------------------------------------------------- */
/* Site content (the editable lists)                                           */
/* -------------------------------------------------------------------------- */

/**
 * Every published content row on the site, grouped by collection.
 *
 * Never throws, like the other public reads. One request covers all thirteen
 * lists — a few kilobytes — because the root route loads it once per page and
 * thirteen separate queries would be thirteen round trips for the same data.
 *
 * Returns an empty object when there is nothing to read, which each consumer
 * turns into the seed list for its own collection.
 */
export async function fetchSiteContent(): Promise<SiteContent> {
  const supabase = getSupabase();
  if (!supabase) return {};

  const { data, error } = await supabase
    .from("site_content")
    .select("*")
    .eq("published", true)
    .order("collection")
    .order("sort_order");

  if (error || !data) {
    console.error("Falling back to seed site content:", error?.message);
    return {};
  }

  const grouped: SiteContent = {};
  for (const row of data) {
    (grouped[row.collection] ??= []).push(row);
  }
  return grouped;
}

/** Every row of one collection for the editor, drafts included. */
export async function adminListCollection(collection: string): Promise<ContentRow[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("site_content")
    .select("*")
    .eq("collection", collection)
    .order("sort_order");

  if (error) throw adminError(error, "site_content");
  return data ?? [];
}

/** Creates the row when `id` is blank, updates it otherwise. */
export async function saveContentItem(row: ContentRow): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { id, ...fields } = row;

  const { error } = id
    ? await supabase.from("site_content").update(fields).eq("id", id)
    : await supabase.from("site_content").insert(fields);

  if (error) throw adminError(error, "site_content");
}

export async function deleteContentItem(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const { error } = await supabase.from("site_content").delete().eq("id", id);
  if (error) throw adminError(error, "site_content");
}

/**
 * Copies a collection's built-in list into the table so staff can edit it.
 *
 * Refuses when the collection already has rows, rather than merging: unlike the
 * destinations, these records have no natural key to match on, so a second
 * import would silently duplicate every item. Returns how many were inserted.
 */
export async function importSeedCollection(spec: ErasedSpec): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");

  const existing = await adminListCollection(spec.id);
  if (existing.length > 0) return 0;

  const rows = spec.seed.map((data, index) => ({
    collection: spec.id,
    // Tens, so a new item can be slotted between two existing ones without
    // renumbering the whole list.
    sort_order: index * 10,
    published: true,
    data,
  }));

  const { error } = await supabase.from("site_content").insert(rows);
  if (error) throw adminError(error, "site_content");
  return rows.length;
}

/**
 * Imports every still-empty collection in a group, for staff who want the whole
 * site's content in the database rather than one list at a time.
 *
 * Sequential rather than `Promise.all`: thirteen concurrent multi-row inserts on
 * one table is needless contention for a button pressed once, and importing in
 * order means a failure partway through leaves a state someone can reason about
 * — the lists before it imported, the rest untouched — instead of an arbitrary
 * subset. The error names the collection that failed for the same reason.
 *
 * Safe to press twice: `importSeedCollection` refuses a collection that already
 * has rows, so a second press imports whatever was added since and skips the
 * rest. Skipped collections are not counted, so the result reports what actually
 * changed rather than how many were considered.
 */
export async function importSeedCollections(
  specs: readonly ErasedSpec[],
): Promise<{ collections: number; items: number }> {
  let collections = 0;
  let items = 0;

  for (const spec of specs) {
    let inserted: number;
    try {
      inserted = await importSeedCollection(spec);
    } catch (cause) {
      /*
        A missing table is a setup problem, not a problem with this list, and it
        would fail identically for all thirteen. Rethrown as itself so the UI
        offers the setup card rather than naming an arbitrary collection as the
        culprit — which reads as "Headline figures is broken" when nothing is.
      */
      if (isMissingTable(cause)) throw cause;
      const detail = cause instanceof Error ? cause.message : String(cause);
      throw new Error(`Importing "${spec.label}" failed, so the rest were left alone. ${detail}`);
    }
    if (inserted > 0) {
      collections += 1;
      items += inserted;
    }
  }

  return { collections, items };
}

/* -------------------------------------------------------------------------- */
/* Page sections (the headings and intros)                                     */
/* -------------------------------------------------------------------------- */

/**
 * Every saved heading override, keyed by `page/section`.
 *
 * Never throws, like the other public reads, and returns an empty object on a
 * miss — which is also the normal state. The table holds overrides only, so
 * "nothing saved" means every block shows the built-in copy in
 * `src/data/page-copy.ts`. One request covers all fifty-two blocks, because the
 * root route loads them once for every page.
 */
export async function fetchPageCopy(): Promise<PageCopy> {
  const supabase = getSupabase();
  if (!supabase) return {};

  const { data, error } = await supabase.from("page_sections").select("*");

  if (error || !data) {
    console.error("Falling back to built-in page copy:", error?.message);
    return {};
  }

  const keyed: PageCopy = {};
  for (const row of data) {
    keyed[copyKey(row)] = row;
  }
  return keyed;
}

/** Every saved override for the editor, in no particular order. */
export async function adminListPageCopy(): Promise<CopyRow[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase.from("page_sections").select("*");

  if (error) throw adminError(error, "page_sections");
  return data ?? [];
}

/**
 * Saves one block's copy.
 *
 * An upsert on `(page, section)` rather than an insert-or-update on `id`: the
 * editor works from the declared list of blocks, not from the table, so it has
 * no id for a block nobody has edited yet — and two staff members saving the
 * same heading at once must not produce two rows for one slot.
 */
export async function savePageCopy(
  row: Pick<CopyRow, "page" | "section" | "eyebrow" | "heading" | "intro">,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.from("page_sections").upsert(row, {
    onConflict: "page,section",
  });

  if (error) throw adminError(error, "page_sections");
}

/**
 * Drops one block's override, so the page shows its built-in copy again.
 *
 * Deletes by `(page, section)` rather than by id for the same reason the save
 * upserts: the editor addresses blocks by name.
 */
export async function resetPageCopy(page: string, section: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase
    .from("page_sections")
    .delete()
    .eq("page", page)
    .eq("section", section);

  if (error) throw adminError(error, "page_sections");
}
