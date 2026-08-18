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
