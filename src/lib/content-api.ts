import {
  seedBlogPosts,
  seedSuccessStories,
  seedTeamMembers,
  type BlogPost,
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
    return seedTeamMembers
      .filter((m) => m.published)
      .sort((a, b) => a.sort_order - b.sort_order);

  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });

  if (error || !data) {
    console.error("Falling back to seed team members:", error?.message);
    return seedTeamMembers
      .filter((m) => m.published)
      .sort((a, b) => a.sort_order - b.sort_order);
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
