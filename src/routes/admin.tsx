import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  DownloadCloud,
  ExternalLink,
  Globe2,
  GraduationCap,
  Inbox,
  LayoutTemplate,
  Loader2,
  LogOut,
  Mail,
  Pencil,
  Phone,
  Plus,
  Save,
  Settings2,
  Trash2,
  Trophy,
  Type,
  Users,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import {
  AdminShell,
  EmptyRow,
  ImageField,
  LoginCard,
  MissingTableNotice,
  Notice,
  RowSkeleton,
  SetupNotice,
  StatusPill,
  TextArea,
  TextField,
} from "@/components/admin/AdminUI";
import { CollectionManager } from "@/components/admin/CollectionEditor";
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
import { PageCopyManager } from "@/components/admin/PageCopyEditor";
import { pageCollections, testPrepCollections, type ErasedSpec } from "@/data/collections";
import type { BlogPost, Country, SuccessStory, TeamMember } from "@/data/content";
import { telHref, type SiteSettings } from "@/data/site";
import {
  adminGetSettings,
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
  importSeedCollections,
  importSeedCountries,
  isMissingTable,
  saveBlogPost,
  saveCountry,
  saveSettings,
  saveSuccessStory,
  saveTeamMember,
  updateEnquiry,
} from "@/lib/content-api";
import { formatDate } from "@/lib/content-utils";
import { settingsFromMatches } from "@/lib/seo";
import { enquiryStatuses, type Enquiry, type EnquiryStatus } from "@/lib/supabase";
import { useAuth } from "@/lib/use-auth";
import { useSettings } from "@/lib/use-site-content";

const logo = "/logo.png";

const tabs = [
  { id: "blog", label: "Blog posts", icon: BookOpen },
  { id: "stories", label: "Success stories", icon: Trophy },
  { id: "countries", label: "Destinations", icon: Globe2 },
  { id: "team", label: "Team", icon: Users },
  { id: "enquiries", label: "Enquiries", icon: Inbox },
  { id: "pages", label: "Page content", icon: LayoutTemplate },
  { id: "test-prep", label: "Test Prep", icon: GraduationCap },
  { id: "copy", label: "Headings & intros", icon: Type },
  { id: "settings", label: "Site settings", icon: Settings2 },
] as const;

type Tab = (typeof tabs)[number]["id"];

const isTab = (value: unknown): value is Tab => tabs.some((t) => t.id === value);

export const Route = createFileRoute("/admin")({
  /*
    The open tab lives in the URL rather than in component state. With nine
    tabs, three of which have a picker inside them, a reload used to drop staff
    back on Blog posts — and there was no way to send a colleague a link to the
    list you were looking at. Anything unrecognised falls back to Blog rather
    than erroring, so an old bookmark still opens the admin.
  */
  validateSearch: (search: Record<string, unknown>): { tab: Tab } => ({
    tab: isTab(search["tab"]) ? search["tab"] : "blog",
  }),
  head: ({ matches }) => ({
    meta: [
      { title: `Content admin | ${settingsFromMatches(matches).name}` },
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

function Dashboard({ email, onSignOut }: { email: string | null; onSignOut: () => Promise<void> }) {
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { name } = useSettings();

  /*
    Replace rather than push: these tabs are views of one page, not places you
    have been. Pushing would mean nine presses of Back to leave /admin.
  */
  const setTab = (next: Tab) => void navigate({ search: { tab: next }, replace: true });

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
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="" className="h-10 w-auto rounded-lg bg-ink-foreground p-1" />
            <span className="leading-tight">
              <span className="block font-display text-sm font-bold text-ink-foreground">
                {name}
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
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-0">
        <nav className="sticky top-[73px] hidden w-56 shrink-0 self-start border-r border-border bg-card/60 py-4 lg:block">
          <div className="grid gap-1 px-3">
            {tabs.map((item) => {
              const badge = item.id === "enquiries" ? unread : 0;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  aria-current={tab === item.id ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition-colors ${
                    tab === item.id
                      ? "bg-primary-soft text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <item.icon className="size-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {badge > 0 && (
                    <span className="surface-sun rounded-full px-2 py-0.5 text-[0.65rem] font-bold">
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Mobile tab bar */}
        <div className="flex gap-1 overflow-x-auto border-b border-border bg-card/60 px-5 py-2 lg:hidden">
          {tabs.map((item) => {
            const badge = item.id === "enquiries" ? unread : 0;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                aria-current={tab === item.id ? "page" : undefined}
                className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  tab === item.id
                    ? "bg-primary-soft text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="size-4" />
                {item.label}
                {badge > 0 && (
                  <span className="surface-sun rounded-full px-2 py-0.5 text-[0.65rem] font-bold">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <main className="flex-1 px-6 py-10 lg:px-10">
          {tab === "blog" && <BlogManager />}
          {tab === "stories" && <StoryManager />}
          {tab === "countries" && <CountryManager />}
          {tab === "team" && <TeamManager />}
          {tab === "enquiries" && <EnquiryManager />}
          {tab === "pages" && <CollectionPicker specs={pageCollections} />}
          {tab === "test-prep" && <CollectionPicker specs={testPrepCollections} />}
          {tab === "copy" && <PageCopyManager />}
          {tab === "settings" && <SettingsManager />}
        </main>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Blog manager                                                               */
/* -------------------------------------------------------------------------- */

function BlogManager() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [editing, setEditing] = useState<BlogPost | null | undefined>(undefined);

  const { data, isPending, error } = useQuery({
    queryKey: ["admin", "blog"],
    queryFn: adminListBlogPosts,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "blog"] });
    setEditing(undefined);
    /*
      The public blog reads its posts from a route loader, not a query — see the
      loader in routes/blog/index.tsx — so invalidating the router is what pushes
      a saved post out to the site. Without it a save showed here and nowhere
      else until the next full page load.
    */
    void router.invalidate();
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
  const router = useRouter();
  const [editing, setEditing] = useState<SuccessStory | null | undefined>(undefined);

  const { data, isPending, error } = useQuery({
    queryKey: ["admin", "stories"],
    queryFn: adminListSuccessStories,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "stories"] });
    setEditing(undefined);
    // Same as the blog: the public rails come from route loaders, not queries.
    void router.invalidate();
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
  const router = useRouter();
  const [editing, setEditing] = useState<TeamMember | null | undefined>(undefined);

  const { data, isPending, error } = useQuery({
    queryKey: ["admin", "team"],
    queryFn: adminListTeamMembers,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "team"] });
    setEditing(undefined);
    // The About page loads the team in its own loader, so the router has to know.
    void router.invalidate();
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
            /* Matches the check constraint on the column, so a long paste is
               truncated at the box rather than rejected by Postgres. */
            maxLength={4000}
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
/* Page content (the editable lists)                                          */
/* -------------------------------------------------------------------------- */

/**
 * A group of related lists behind one tab, with a pill picker across the top.
 *
 * A picker rather than a tab each: the thirteen lists are two jobs — the
 * marketing pages, and the Test Prep page — and thirteen more tabs across the
 * header would push the ones staff use daily off the edge of the screen.
 */
function CollectionPicker({ specs }: { specs: ErasedSpec[] }) {
  const [id, setId] = useState(specs[0]?.id ?? "");
  const spec = specs.find((s) => s.id === id) ?? specs[0];

  const queryClient = useQueryClient();
  const router = useRouter();

  /*
    Imports every list behind this tab in one press, for the initial setup —
    otherwise getting the site's own content into the database means visiting
    nine lists here and four on Test Prep and pressing Import in each.

    Collections that already have rows are skipped rather than duplicated, so
    this is safe to press again after adding a list, and safe to press twice by
    accident.
  */
  const importAll = useMutation({
    mutationFn: () => importSeedCollections(specs),
    onSuccess: () => {
      // Every list in the group, not just the open one: the others were imported
      // too and their cached row counts are now wrong.
      void queryClient.invalidateQueries({ queryKey: ["admin", "content"] });
      // Pushes the imported copy out to the public pages, which read these lists
      // from the root loader rather than from a query.
      void router.invalidate();
    },
  });

  if (!spec) return null;

  const totalItems = specs.reduce((sum, item) => sum + item.seed.length, 0);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {specs.map((item) => (
            <button
              key={item.id}
              onClick={() => setId(item.id)}
              aria-current={item.id === spec.id ? "true" : undefined}
              className={`press rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                item.id === spec.id
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => importAll.mutate()}
          disabled={importAll.isPending}
          title={`Copy all ${totalItems} items from the live website into the database, across every list on this tab`}
          className="press inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {importAll.isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <DownloadCloud className="size-3.5" />
          )}
          Import all {specs.length} lists
        </button>
      </div>

      {(importAll.data || importAll.error) && (
        <div className="mt-4">
          {importAll.error ? (
            isMissingTable(importAll.error) ? (
              <MissingTableNotice table={importAll.error.table} />
            ) : (
              <Notice tone="error">{(importAll.error as Error).message}</Notice>
            )
          ) : importAll.data ? (
            <Notice tone={importAll.data.collections > 0 ? "success" : "info"}>
              {importAll.data.collections > 0
                ? `Imported ${importAll.data.items} items across ${importAll.data.collections} list${
                    importAll.data.collections === 1 ? "" : "s"
                  }. Nothing on the site changed — the words are now yours to edit.`
                : "Every list on this tab already has content, so nothing was imported."}
            </Notice>
          ) : null}
        </div>
      )}

      <div className="mt-8">
        {/* Keyed, so switching lists starts fresh rather than reusing the open form. */}
        <CollectionManager key={spec.id} spec={spec} />
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Site settings                                                              */
/* -------------------------------------------------------------------------- */

function SettingsManager() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isPending, error } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: adminGetSettings,
  });

  const save = useMutation({
    mutationFn: saveSettings,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
      /*
        The top bar, the footer, the contact page and every page's JSON-LD read
        these through the root route loader rather than a query, because they
        render on every route and cannot wait. Invalidating the router is what
        pushes a change out to all of them, same as the destinations tab.
      */
      void router.invalidate();
    },
  });

  return (
    <>
      <div>
        <h1 className="font-display text-2xl font-bold">Site settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your contact details, mission and search listing. Unlike the other tabs, this is not a
          list — it is the one set of details that appears on every page of the site.
        </p>
      </div>

      <div className="mt-8">
        {error ? (
          isMissingTable(error) ? (
            <MissingTableNotice table={error.table} />
          ) : (
            <Notice tone="error">{(error as Error).message}</Notice>
          )
        ) : isPending ? (
          <div className="h-[32rem] animate-pulse rounded-3xl border border-border bg-card" />
        ) : (
          <SettingsForm initial={data} onSave={(next) => save.mutateAsync(next)} />
        )}
      </div>
    </>
  );
}

/** One titled group of fields within the settings form. */
function SettingsGroup({
  title,
  detail,
  children,
}: {
  title: string;
  detail: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-5 rounded-3xl border border-border bg-card p-6 shadow-soft md:p-8">
      <div>
        <h2 className="font-display text-lg font-bold">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{detail}</p>
      </div>
      {children}
    </section>
  );
}

/**
 * Every field on the site's single settings row.
 *
 * Clearing an optional field removes the thing it feeds rather than leaving a
 * dead link — no Facebook URL means no Facebook icon, no second number means
 * one number in the footer. The four fields marked required are the ones where
 * blank has no sensible meaning, and a blank there falls back to the built-in
 * default rather than shipping an empty page title.
 */
function SettingsForm({
  initial,
  onSave,
}: {
  initial: SiteSettings;
  onSave: (settings: SiteSettings) => Promise<void>;
}) {
  const [draft, setDraft] = useState<SiteSettings>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    // Any further edit makes the confirmation below stale.
    setSaved(false);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onSave(draft);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the settings.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-6">
      <SettingsGroup
        title="The business"
        detail="The short name goes in the header, the footer and the browser tab. The full legal name signs the footer and identifies you to Google."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            label="Short name"
            value={draft.name}
            onChange={(v) => set("name", v)}
            placeholder="Star Global Vision"
            required
          />
          <TextField
            label="Full legal name"
            value={draft.legal_name}
            onChange={(v) => set("legal_name", v)}
            placeholder="Star Global Vision Educational Consultancy"
            required
          />
        </div>
        <TextArea
          label="Mission statement"
          value={draft.mission}
          onChange={(v) => set("mission", v)}
          rows={5}
          hint="Quoted in full on the About page and in the footer."
        />
        <TextField
          label="Approval line"
          value={draft.approval}
          onChange={(v) => set("approval", v)}
          placeholder="Approved by Ministry of Social Development"
          hint="Your accreditation, shown as a badge on the home page and the About page."
        />
      </SettingsGroup>

      <SettingsGroup
        title="How students reach you"
        detail="Clearing any of these removes it from the site rather than leaving a link that goes nowhere."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            label="Landline"
            type="tel"
            value={draft.phone_primary}
            onChange={(v) => set("phone_primary", v)}
            placeholder="977-01-5364635"
            hint="Shown in the top bar. Written however you like — the dial link strips the punctuation."
          />
          <TextField
            label="Mobile"
            type="tel"
            value={draft.phone_secondary}
            onChange={(v) => set("phone_secondary", v)}
            placeholder="977-9841902452"
            hint="The number the Call button dials on a phone. Leave blank to use the landline."
          />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            label="Email"
            type="email"
            value={draft.email}
            onChange={(v) => set("email", v)}
            placeholder="starglobalvision@gmail.com"
          />
          <TextField
            label="WhatsApp number"
            value={draft.whatsapp}
            onChange={(v) => set("whatsapp", v)}
            placeholder="9779841902452"
            hint="Digits only, starting with the country code. Powers the floating WhatsApp button."
          />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            label="Office address"
            value={draft.address}
            onChange={(v) => set("address", v)}
            placeholder="Bagbazar-28, Kathmandu, Nepal"
          />
          <TextField
            label="Opening hours"
            value={draft.hours}
            onChange={(v) => set("hours", v)}
            placeholder="Sunday - Friday, 7:00 AM - 6:00 PM"
          />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            label="Facebook page"
            type="url"
            value={draft.facebook}
            onChange={(v) => set("facebook", v)}
            placeholder="https://fb.com/starglobalvision"
            hint="The full URL, including https://"
          />
          <TextField
            label="Map location"
            value={draft.map_query}
            onChange={(v) => set("map_query", v)}
            placeholder="Bagbazar, Kathmandu, Nepal"
            hint="Searched on Google Maps for the map on the contact page. A place name works better than coordinates."
          />
        </div>
      </SettingsGroup>

      <SettingsGroup
        title="Search engines and sharing"
        detail="What Google lists and what Facebook shows when someone shares a page that has no picture of its own."
      >
        <TextField
          label="Default page title"
          value={draft.seo_title}
          onChange={(v) => set("seo_title", v)}
          placeholder="Star Global Vision Educational Consultancy"
          required
          hint="Used on the home page and anywhere without its own title. Keep it under about 60 characters."
        />
        <TextArea
          label="Default description"
          value={draft.seo_description}
          onChange={(v) => set("seo_description", v)}
          rows={3}
          required
          hint="The grey paragraph under your name in Google results. Around 150 characters reads best."
        />
        <ImageField
          label="Sharing image"
          value={draft.og_image}
          onChange={(v) => set("og_image", v)}
          folder="site"
          hint="Shown when a page is shared on Facebook, Viber or WhatsApp. Landscape, at least 1200×630. Falls back to the site logo card."
        />
      </SettingsGroup>

      {error && <Notice tone="error">{error}</Notice>}
      {saved && (
        <Notice tone="success">Saved. The change is live on the site — go and have a look.</Notice>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="surface-brand inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold shadow-soft transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save changes
        </button>
        <span className="text-xs text-muted-foreground">
          There is nothing to publish — these details are live as soon as you save.
        </span>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* Small shared pieces                                                        */
/* -------------------------------------------------------------------------- */

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
