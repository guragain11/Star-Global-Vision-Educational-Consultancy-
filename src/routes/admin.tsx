import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  DownloadCloud,
  ExternalLink,
  Globe2,
  Inbox,
  Loader2,
  LogOut,
  Mail,
  Pencil,
  Phone,
  Plus,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";
import { useState } from "react";

import { AdminShell, LoginCard, Notice, SetupNotice } from "@/components/admin/AdminUI";
import {
  BlogEditor,
  CountryEditor,
  StoryEditor,
  TeamEditor,
  type BlogDraft,
  type CountryDraft,
  type StoryDraft,
  type TeamDraft,
} from "@/components/admin/Editors";
import type { BlogPost, Country, SuccessStory, TeamMember } from "@/data/content";
import { site, telHref } from "@/data/site";
import {
  adminListBlogPosts,
  adminListCountries,
  adminListEnquiries,
  adminListSuccessStories,
  adminListTeamMembers,
  deleteBlogPost,
  deleteCountry,
  deleteEnquiry,
  deleteSuccessStory,
  deleteTeamMember,
  importSeedCountries,
  saveBlogPost,
  saveCountry,
  saveSuccessStory,
  saveTeamMember,
  updateEnquiry,
} from "@/lib/content-api";
import { formatDate } from "@/lib/content-utils";
import { enquiryStatuses, type Enquiry, type EnquiryStatus } from "@/lib/supabase";
import { useAuth } from "@/lib/use-auth";

const logo = "/logo.png";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Content Admin | Star Global Vision" },
      // Keep the admin out of search results.
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { status, email, signIn, signOut } = useAuth();

  if (status === "unconfigured") {
    return (
      <AdminShell>
        <SetupNotice />
      </AdminShell>
    );
  }

  if (status === "loading") {
    return (
      <AdminShell>
        <Loader2 className="size-7 animate-spin text-primary" />
      </AdminShell>
    );
  }

  if (status === "signed-out") {
    return (
      <AdminShell>
        <LoginCard onSignIn={signIn} />
      </AdminShell>
    );
  }

  return <Dashboard email={email} onSignOut={signOut} />;
}

type Tab = "blog" | "stories" | "countries" | "team" | "enquiries";

function Dashboard({ email, onSignOut }: { email: string | null; onSignOut: () => Promise<void> }) {
  const [tab, setTab] = useState<Tab>("blog");

  // Shared with EnquiryManager through the query cache, so the badge and the
  // list are never out of step and only one request goes out.
  const { data: enquiries } = useQuery({
    queryKey: ["admin", "enquiries"],
    queryFn: adminListEnquiries,
  });
  const unread = enquiries?.filter((e) => e.status === "new").length ?? 0;

  return (
    <div className="flex min-h-screen flex-col bg-secondary/40">
      <header className="surface-brand grid-glow sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="" className="h-10 w-auto rounded-lg bg-ink-foreground p-1" />
            <span className="leading-tight">
              <span className="block font-display text-sm font-bold text-ink-foreground">
                {site.name}
              </span>
              <span className="block text-[0.62rem] uppercase tracking-[0.16em] text-ink-foreground/60">
                Content admin
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-3 text-sm">
            {email && <span className="hidden text-ink-foreground/70 sm:inline">{email}</span>}
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-ink-foreground/25 px-4 py-2 text-ink-foreground/85 transition-colors hover:bg-ink-foreground/10"
            >
              <ExternalLink className="size-4" /> View site
            </Link>
            <button
              onClick={() => void onSignOut()}
              className="inline-flex items-center gap-1.5 rounded-full border border-ink-foreground/25 px-4 py-2 text-ink-foreground/85 transition-colors hover:bg-ink-foreground/10"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </div>

        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5">
          {(
            [
              { id: "blog", label: "Blog posts", icon: BookOpen, badge: 0 },
              { id: "stories", label: "Success stories", icon: Trophy, badge: 0 },
              { id: "countries", label: "Destinations", icon: Globe2, badge: 0 },
              { id: "team", label: "Team", icon: Users, badge: 0 },
              { id: "enquiries", label: "Enquiries", icon: Inbox, badge: unread },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              aria-current={tab === item.id ? "page" : undefined}
              className={`inline-flex shrink-0 items-center gap-2 rounded-t-xl px-5 py-3 text-sm font-semibold transition-colors ${
                tab === item.id
                  ? "bg-secondary/40 text-primary"
                  : "text-ink-foreground/70 hover:bg-ink-foreground/10 hover:text-ink-foreground"
              }`}
            >
              <item.icon className="size-4" />
              {item.label}
              {item.badge > 0 && (
                <span className="surface-sun rounded-full px-2 py-0.5 text-[0.65rem] font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
        {tab === "blog" && <BlogManager />}
        {tab === "stories" && <StoryManager />}
        {tab === "countries" && <CountryManager />}
        {tab === "team" && <TeamManager />}
        {tab === "enquiries" && <EnquiryManager />}
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Blog manager                                                               */
/* -------------------------------------------------------------------------- */

function BlogManager() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<BlogPost | null | undefined>(undefined);

  const { data, isPending, error } = useQuery({
    queryKey: ["admin", "blog"],
    queryFn: adminListBlogPosts,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
    void queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    setEditing(undefined);
  };

  const save = useMutation({
    mutationFn: ({ draft, id }: { draft: BlogDraft; id?: string }) =>
      saveBlogPost({ ...draft, id: id ?? "" }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteBlogPost(id),
    onSuccess: invalidate,
  });

  if (editing !== undefined) {
    return (
      <BlogEditor
        initial={editing}
        onCancel={() => setEditing(undefined)}
        onSave={(draft, id) => save.mutateAsync(id ? { draft, id } : { draft })}
        onDelete={(id) => remove.mutateAsync(id)}
      />
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Blog posts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data ? `${data.length} post${data.length === 1 ? "" : "s"}` : "Loading…"}
          </p>
        </div>
        <button
          onClick={() => setEditing(null)}
          className="surface-brand inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-soft transition-transform hover:-translate-y-0.5"
        >
          <Plus className="size-4" /> New post
        </button>
      </div>

      <div className="mt-8">
        {error ? (
          <Notice tone="error">{(error as Error).message}</Notice>
        ) : isPending ? (
          <CardSkeletonGrid />
        ) : data.length === 0 ? (
          <EmptyRow
            title="No blog posts yet"
            detail="Create your first article. It will appear on /blog as soon as you tick Published."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((post) => (
              <div
                key={post.id}
                className="group flex flex-col rounded-2xl border border-border bg-card shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Cover image or fallback */}
                <div className="relative h-40 overflow-hidden rounded-t-2xl bg-secondary/50">
                  {post.cover_image ? (
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="font-display text-3xl font-bold text-muted-foreground/30">
                        {post.title.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="absolute left-3 top-3">
                    <StatusPill published={post.published} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-4">
                  <span className="mb-2 inline-block w-fit rounded-full bg-accent-soft px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-accent-foreground">
                    {post.category}
                  </span>
                  <h2 className="line-clamp-2 font-semibold leading-snug">{post.title}</h2>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {post.excerpt || "No excerpt"}
                  </p>

                  <div className="mt-auto pt-4">
                    <p className="mb-3 text-[0.65rem] text-muted-foreground">
                      {formatDate(post.published_at)} · {post.author}
                    </p>
                    <div className="flex items-center gap-2">
                      {post.published && (
                        <Link
                          to="/blog/$slug"
                          params={{ slug: post.slug }}
                          target="_blank"
                          className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:text-primary"
                          aria-label={`View ${post.title}`}
                        >
                          <ExternalLink className="size-3.5" />
                        </Link>
                      )}
                      <button
                        onClick={() => setEditing(post)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
                      >
                        <Pencil className="size-3.5" /> Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Success story manager                                                      */
/* -------------------------------------------------------------------------- */

function StoryManager() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<SuccessStory | null | undefined>(undefined);

  const { data, isPending, error } = useQuery({
    queryKey: ["admin", "stories"],
    queryFn: adminListSuccessStories,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "stories"] });
    void queryClient.invalidateQueries({ queryKey: ["success-stories"] });
    setEditing(undefined);
  };

  const save = useMutation({
    mutationFn: ({ draft, id }: { draft: StoryDraft; id?: string }) =>
      saveSuccessStory({ ...draft, id: id ?? "" }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteSuccessStory(id),
    onSuccess: invalidate,
  });

  if (editing !== undefined) {
    return (
      <StoryEditor
        initial={editing}
        onCancel={() => setEditing(undefined)}
        onSave={(draft, id) => save.mutateAsync(id ? { draft, id } : { draft })}
        onDelete={(id) => remove.mutateAsync(id)}
      />
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Success stories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data ? `${data.length} stor${data.length === 1 ? "y" : "ies"}` : "Loading…"}
          </p>
        </div>
        <button
          onClick={() => setEditing(null)}
          className="surface-brand inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-soft transition-transform hover:-translate-y-0.5"
        >
          <Plus className="size-4" /> New story
        </button>
      </div>

      <div className="mt-8">
        {error ? (
          <Notice tone="error">{(error as Error).message}</Notice>
        ) : isPending ? (
          <CardSkeletonGrid />
        ) : data.length === 0 ? (
          <EmptyRow
            title="No success stories yet"
            detail="Add your first student. Published stories appear on /success-stories and on the home page."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((story) => (
              <div
                key={story.id}
                className="group flex flex-col rounded-2xl border border-border bg-card shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Photo or fallback */}
                <div className="relative h-44 overflow-hidden rounded-t-2xl bg-secondary/50">
                  {story.photo ? (
                    <img
                      src={story.photo}
                      alt={story.student_name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-linear-to-br from-primary/10 to-accent/10">
                      <span className="font-display text-4xl font-bold text-primary/30">
                        {story.student_name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="absolute left-3 top-3 flex gap-2">
                    <StatusPill published={story.published} />
                    {story.featured && (
                      <span className="surface-sun rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider">
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-4">
                  <span className="mb-2 inline-block w-fit rounded-full bg-primary-soft px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-primary">
                    {story.country}
                  </span>
                  <h2 className="font-semibold leading-snug">{story.student_name}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{story.university}</p>
                  {story.course && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{story.course}</p>
                  )}

                  {story.quote && (
                    <p className="mt-3 line-clamp-2 text-xs italic text-muted-foreground/80">
                      "{story.quote}"
                    </p>
                  )}

                  <div className="mt-auto pt-4">
                    <p className="mb-3 text-[0.65rem] text-muted-foreground">
                      {formatDate(story.published_at)}
                    </p>
                    <div className="flex items-center gap-2">
                      {story.published && (
                        <Link
                          to="/success-stories/$slug"
                          params={{ slug: story.slug }}
                          target="_blank"
                          className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:text-primary"
                          aria-label={`View ${story.student_name}`}
                        >
                          <ExternalLink className="size-3.5" />
                        </Link>
                      )}
                      <button
                        onClick={() => setEditing(story)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
                      >
                        <Pencil className="size-3.5" /> Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Team manager                                                                */
/* -------------------------------------------------------------------------- */

function TeamManager() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<TeamMember | null | undefined>(undefined);

  const { data, isPending, error } = useQuery({
    queryKey: ["admin", "team"],
    queryFn: adminListTeamMembers,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "team"] });
    void queryClient.invalidateQueries({ queryKey: ["team-members"] });
    setEditing(undefined);
  };

  const save = useMutation({
    mutationFn: ({ draft, id }: { draft: TeamDraft; id?: string }) =>
      saveTeamMember({ ...draft, id: id ?? "" }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteTeamMember(id),
    onSuccess: invalidate,
  });

  if (editing !== undefined) {
    return (
      <TeamEditor
        initial={editing}
        onCancel={() => setEditing(undefined)}
        onSave={(draft, id) => save.mutateAsync(id ? { draft, id } : { draft })}
        onDelete={(id) => remove.mutateAsync(id)}
      />
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Team members</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data ? `${data.length} member${data.length === 1 ? "" : "s"}` : "Loading…"}
          </p>
        </div>
        <button
          onClick={() => setEditing(null)}
          className="surface-brand inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-soft transition-transform hover:-translate-y-0.5"
        >
          <Plus className="size-4" /> Add member
        </button>
      </div>

      <div className="mt-8">
        {error ? (
          <Notice tone="error">{(error as Error).message}</Notice>
        ) : isPending ? (
          <CardSkeletonGrid />
        ) : data.length === 0 ? (
          <EmptyRow
            title="No team members yet"
            detail="Add your first team member. They will appear on the About page when published."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.map((member) => (
              <div
                key={member.id}
                className="group flex flex-col items-center rounded-2xl border border-border bg-card p-6 shadow-soft text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Photo or initials */}
                {member.photo ? (
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="size-20 rounded-full object-cover shadow-hair ring-4 ring-primary/10 transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="surface-sun flex size-20 items-center justify-center rounded-full shadow-hair ring-4 ring-primary/10 transition-transform duration-300 ease-brand group-hover:scale-105">
                    <span className="font-display text-xl font-bold">
                      {member.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}

                <div className="mt-3 flex gap-2">
                  <StatusPill published={member.published} />
                  {member.department && (
                    <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-accent-foreground">
                      {member.department}
                    </span>
                  )}
                </div>

                <h2 className="mt-3 font-semibold leading-snug">{member.name}</h2>
                <p className="mt-1 text-xs font-medium text-primary">{member.designation}</p>

                {member.bio && (
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{member.bio}</p>
                )}

                {(member.email || member.phone) && (
                  <p className="mt-2 text-[0.65rem] text-muted-foreground">
                    {member.email && <span className="block">{member.email}</span>}
                    {member.phone && <span className="block">{member.phone}</span>}
                  </p>
                )}

                <div className="mt-4 w-full">
                  <button
                    onClick={() => setEditing(member)}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <Pencil className="size-3.5" /> Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Destination manager                                                        */
/* -------------------------------------------------------------------------- */

function CountryManager() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [editing, setEditing] = useState<Country | null | undefined>(undefined);

  const { data, isPending, error } = useQuery({
    queryKey: ["admin", "countries"],
    queryFn: adminListCountries,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "countries"] });
    setEditing(undefined);
    /*
      The public destination list comes from the root route loader, not a query,
      because the header renders it on every page. Invalidating the router is
      what pushes a change out to the nav, the country guide, the enquiry
      dropdowns and the sitemap in one go.
    */
    void router.invalidate();
  };

  const save = useMutation({
    mutationFn: ({ draft, id }: { draft: CountryDraft; id?: string }) =>
      saveCountry({ ...draft, id: id ?? "" }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteCountry(id),
    onSuccess: invalidate,
  });

  const importSeeds = useMutation({
    mutationFn: importSeedCountries,
    onSuccess: invalidate,
  });

  if (editing !== undefined) {
    return (
      <CountryEditor
        initial={editing}
        onCancel={() => setEditing(undefined)}
        onSave={(draft, id) => save.mutateAsync(id ? { draft, id } : { draft })}
        onDelete={(id) => remove.mutateAsync(id)}
      />
    );
  }

  const live = data?.filter((c) => c.published).length ?? 0;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Destinations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data
              ? `${data.length} destination${data.length === 1 ? "" : "s"}, ${live} live on the site`
              : "Loading…"}
          </p>
        </div>
        <button
          onClick={() => setEditing(null)}
          className="surface-brand press inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-soft hover:-translate-y-0.5 hover:shadow-lift"
        >
          <Plus className="size-4" /> Add destination
        </button>
      </div>

      <div className="mt-8">
        {error ? (
          <Notice tone="error">{(error as Error).message}</Notice>
        ) : isPending ? (
          <CardSkeletonGrid />
        ) : data.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
            <h2 className="font-display text-lg font-semibold">No destinations saved yet</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
              The site is currently showing the fourteen destinations built into the code. Import
              them here to make each one editable — the pages will not change, they simply become
              yours to edit. Or start from scratch and add your own.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => importSeeds.mutate()}
                disabled={importSeeds.isPending}
                className="surface-brand press inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-soft hover:-translate-y-0.5 hover:shadow-lift disabled:cursor-not-allowed disabled:opacity-60"
              >
                {importSeeds.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <DownloadCloud className="size-4" />
                )}
                Import the 14 defaults
              </button>
              <button
                onClick={() => setEditing(null)}
                className="press inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary"
              >
                <Plus className="size-4" /> Start from scratch
              </button>
            </div>
            {importSeeds.error && (
              <div className="mx-auto mt-6 max-w-lg text-left">
                <Notice tone="error">{(importSeeds.error as Error).message}</Notice>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((country) => (
                <div
                  key={country.id}
                  className="card-lift group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft [--lift:-0.125rem]"
                >
                  <div className="relative h-36 overflow-hidden bg-secondary/50">
                    {country.image ? (
                      <img
                        src={country.image}
                        alt=""
                        className="size-full object-cover transition-transform duration-500 ease-brand group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-linear-to-br from-primary/10 to-accent/10">
                        <span className="font-display text-3xl font-bold text-primary/30">
                          {country.flag || country.name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                      <StatusPill published={country.published} />
                      {country.tier === "primary" && (
                        <span className="surface-sun rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider">
                          Flagship
                        </span>
                      )}
                    </div>
                    <span className="absolute right-3 top-3 rounded-full bg-ink/70 px-2.5 py-0.5 text-[0.65rem] font-bold text-ink-foreground backdrop-blur-sm">
                      #{country.sort_order}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <h2 className="font-semibold leading-snug">{country.name}</h2>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {country.blurb || "No blurb yet"}
                    </p>

                    <dl className="mt-3 grid gap-1 text-[0.65rem] text-muted-foreground">
                      <div className="flex gap-1.5">
                        <dt className="font-semibold">Intakes:</dt>
                        <dd className="truncate">{country.intakes || "—"}</dd>
                      </div>
                      <div className="flex gap-1.5">
                        <dt className="font-semibold">Universities:</dt>
                        <dd>{country.universities.length}</dd>
                      </div>
                    </dl>

                    <div className="mt-auto flex items-center gap-2 pt-4">
                      {country.published && (
                        <Link
                          to="/countries/$slug"
                          params={{ slug: country.slug }}
                          target="_blank"
                          className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:text-primary"
                          aria-label={`View the ${country.name} page`}
                        >
                          <ExternalLink className="size-3.5" />
                        </Link>
                      )}
                      <button
                        onClick={() => setEditing(country)}
                        className="press inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium hover:border-primary/40 hover:text-primary"
                      >
                        <Pencil className="size-3.5" /> Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/*
              Still offered once rows exist, because it is also the recovery path
              after someone deletes a destination they wanted back. It skips any
              slug already present, so it can never duplicate or overwrite.
            */}
            <div className="mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card/60 px-5 py-4">
              <p className="flex-1 text-xs leading-relaxed text-muted-foreground">
                Missing one of the fourteen destinations the site shipped with? Importing again adds
                only the ones that are not already in this list — it never overwrites your edits.
              </p>
              <button
                onClick={() => importSeeds.mutate()}
                disabled={importSeeds.isPending}
                className="press inline-flex shrink-0 items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold hover:border-primary/40 hover:text-primary disabled:opacity-60"
              >
                {importSeeds.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <DownloadCloud className="size-3.5" />
                )}
                Import missing defaults
              </button>
            </div>
            {importSeeds.isSuccess && (
              <div className="mt-4">
                <Notice tone={importSeeds.data > 0 ? "success" : "info"}>
                  {importSeeds.data > 0
                    ? `Imported ${importSeeds.data} destination${importSeeds.data === 1 ? "" : "s"}.`
                    : "Nothing to import — every default destination is already in the list."}
                </Notice>
              </div>
            )}
            {importSeeds.error && (
              <div className="mt-4">
                <Notice tone="error">{(importSeeds.error as Error).message}</Notice>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Enquiry manager                                                            */
/* -------------------------------------------------------------------------- */

const statusLabels: Record<EnquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
};

function EnquiryManager() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<EnquiryStatus | "all">("all");

  const { data, isPending, error } = useQuery({
    queryKey: ["admin", "enquiries"],
    queryFn: adminListEnquiries,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "enquiries"] });

  const patch = useMutation({
    mutationFn: ({ id, ...rest }: { id: string; status?: EnquiryStatus; notes?: string }) =>
      updateEnquiry(id, rest),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteEnquiry(id),
    onSuccess: invalidate,
  });

  const counts = {
    all: data?.length ?? 0,
    new: data?.filter((e) => e.status === "new").length ?? 0,
    contacted: data?.filter((e) => e.status === "contacted").length ?? 0,
    closed: data?.filter((e) => e.status === "closed").length ?? 0,
  };

  const visible = data?.filter((e) => filter === "all" || e.status === filter) ?? [];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Enquiries</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data ? `${counts.all} total, ${counts.new} waiting for a reply` : "Loading…"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["all", ...enquiryStatuses] as const).map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              aria-pressed={filter === option}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                filter === option
                  ? "surface-brand shadow-soft"
                  : "border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {option === "all" ? "All" : statusLabels[option]} ({counts[option]})
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        {error ? (
          <Notice tone="error">{(error as Error).message}</Notice>
        ) : isPending ? (
          <RowSkeleton />
        ) : visible.length === 0 ? (
          <EmptyRow
            title={counts.all === 0 ? "No enquiries yet" : "Nothing in this view"}
            detail={
              counts.all === 0
                ? "Submissions from the contact form land here the moment a visitor sends one."
                : "Switch to another status to see the rest of the enquiries."
            }
          />
        ) : (
          <ul className="grid gap-3">
            {visible.map((enquiry) => (
              <EnquiryRow
                key={enquiry.id}
                enquiry={enquiry}
                busy={patch.isPending || remove.isPending}
                onStatus={(status) => patch.mutate({ id: enquiry.id, status })}
                onNotes={(notes) => patch.mutate({ id: enquiry.id, notes })}
                onDelete={() => remove.mutate(enquiry.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function EnquiryRow({
  enquiry,
  busy,
  onStatus,
  onNotes,
  onDelete,
}: {
  enquiry: Enquiry;
  busy: boolean;
  onStatus: (status: EnquiryStatus) => void;
  onNotes: (notes: string) => void;
  onDelete: () => void;
}) {
  const [notes, setNotes] = useState(enquiry.notes);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const tone: Record<EnquiryStatus, string> = {
    new: "bg-accent text-accent-foreground",
    contacted: "bg-primary text-primary-foreground",
    closed: "bg-secondary text-muted-foreground",
  };

  return (
    <li className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${tone[enquiry.status]}`}
            >
              {statusLabels[enquiry.status]}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(enquiry.created_at).toLocaleString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <h2 className="mt-2 font-semibold">{enquiry.name}</h2>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <a
              href={telHref(enquiry.phone)}
              className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
            >
              <Phone className="size-3.5" /> {enquiry.phone}
            </a>
            {enquiry.email && (
              <a
                href={`mailto:${enquiry.email}`}
                className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
              >
                <Mail className="size-3.5" /> {enquiry.email}
              </a>
            )}
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            {enquiry.destination}
            {enquiry.test && enquiry.test !== "Not required" ? ` · ${enquiry.test}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor={`status-${enquiry.id}`}>
            Status for {enquiry.name}
          </label>
          <select
            id={`status-${enquiry.id}`}
            value={enquiry.status}
            disabled={busy}
            onChange={(e) => onStatus(e.target.value as EnquiryStatus)}
            className="rounded-full border border-input bg-background px-4 py-2 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-ring/30 disabled:opacity-60"
          >
            {enquiryStatuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>

          <button
            onClick={() => (confirmDelete ? onDelete() : setConfirmDelete(true))}
            disabled={busy}
            className={`rounded-full border p-2.5 transition-colors disabled:opacity-60 ${
              confirmDelete
                ? "border-destructive bg-destructive/10 text-destructive"
                : "border-border text-muted-foreground hover:border-destructive/40 hover:text-destructive"
            }`}
            aria-label={
              confirmDelete
                ? `Confirm deleting the enquiry from ${enquiry.name}`
                : `Delete the enquiry from ${enquiry.name}`
            }
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {enquiry.message && (
        <p className="mt-4 whitespace-pre-line rounded-xl bg-secondary/50 p-4 text-sm leading-relaxed">
          {enquiry.message}
        </p>
      )}

      <div className="mt-4 grid gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Internal notes
          <textarea
            value={notes}
            rows={2}
            disabled={busy}
            placeholder="What was discussed, what happens next"
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => notes !== enquiry.notes && onNotes(notes)}
            className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-normal normal-case tracking-normal text-foreground outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-ring/30 disabled:opacity-60"
          />
        </label>
        {notes !== enquiry.notes && (
          <span className="text-xs text-muted-foreground">
            Click outside the box to save your note.
          </span>
        )}
      </div>

      {confirmDelete && (
        <p className="mt-3 text-xs font-medium text-destructive">
          Press the bin again to permanently delete this enquiry.
        </p>
      )}
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/* Small shared pieces                                                        */
/* -------------------------------------------------------------------------- */

function StatusPill({ published }: { published: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
        published ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${published ? "bg-accent" : "bg-muted-foreground"}`}
      />
      {published ? "Live" : "Draft"}
    </span>
  );
}

function RowSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl border border-border bg-card" />
      ))}
    </div>
  );
}

function CardSkeletonGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-2xl border border-border bg-card"
        >
          <div className="h-40 bg-secondary/50" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-16 rounded-full bg-secondary/50" />
            <div className="h-5 w-3/4 rounded bg-secondary/50" />
            <div className="h-3 w-full rounded bg-secondary/50" />
            <div className="h-3 w-2/3 rounded bg-secondary/50" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyRow({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}
