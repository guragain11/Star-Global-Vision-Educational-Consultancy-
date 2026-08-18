import { Loader2, Save, Trash2, X } from "lucide-react";
import { useState } from "react";

import {
  ImageField,
  Notice,
  SelectField,
  TextArea,
  TextField,
  ToggleField,
} from "@/components/admin/AdminUI";
import {
  blogCategories,
  countryTiers,
  destinationNames,
  teamDepartments,
  type BlogPost,
  type Country,
  type SuccessStory,
  type TeamMember,
} from "@/data/content";
import { arrayToLines, linesToArray, slugify, todayIso } from "@/lib/content-utils";
import { deleteImage } from "@/lib/storage";

type BlogDraft = Omit<BlogPost, "id">;
type StoryDraft = Omit<SuccessStory, "id">;
type TeamDraft = Omit<TeamMember, "id">;
type CountryDraft = Omit<Country, "id">;

function emptyBlogDraft(): BlogDraft {
  return {
    slug: "",
    title: "",
    excerpt: "",
    content: "",
    category: blogCategories[0],
    author: "Star Global Vision",
    cover_image: null,
    published_at: todayIso(),
    published: false,
  };
}

function emptyStoryDraft(): StoryDraft {
  return {
    slug: "",
    student_name: "",
    country: destinationNames[0] ?? "Australia",
    university: "",
    course: "",
    intake: "",
    quote: "",
    story: "",
    photo: null,
    published_at: todayIso(),
    published: false,
    featured: false,
  };
}

function emptyTeamDraft(): TeamDraft {
  return {
    name: "",
    designation: "",
    department: teamDepartments[0] ?? "Counselling",
    photo: null,
    email: "",
    phone: "",
    bio: "",
    sort_order: 0,
    published: true,
  };
}

function emptyCountryDraft(): CountryDraft {
  return {
    slug: "",
    name: "",
    flag: "",
    tier: "secondary",
    blurb: "",
    overview: "",
    highlights: [],
    intakes: "",
    work: "",
    tests: "",
    tuition: "",
    cost_living: "",
    requirements: "",
    universities: [],
    image: null,
    // 99 rather than 0: a brand-new destination lands at the end of the list
    // instead of jumping to the front of the header menu before anyone has
    // decided where it belongs.
    sort_order: 99,
    published: false,
  };
}

/** Shared action row for both editors. */
function EditorActions({
  busy,
  isEditing,
  onCancel,
  onDelete,
}: {
  busy: boolean;
  isEditing: boolean;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
      <button
        type="submit"
        disabled={busy}
        className="surface-brand inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold shadow-soft transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        {isEditing ? "Save changes" : "Create"}
      </button>

      <button
        type="button"
        onClick={onCancel}
        className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="size-4" /> Cancel
      </button>

      {isEditing && onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="ml-auto inline-flex items-center gap-2 rounded-full border border-destructive/30 px-5 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <Trash2 className="size-4" /> Delete
        </button>
      )}
    </div>
  );
}

const bodyHint =
  "Supports ## heading, ### subheading, - bullets, 1. numbered lists, > quote, **bold** and *italic*. Blank lines separate paragraphs.";

export function BlogEditor({
  initial,
  onSave,
  onDelete,
  onCancel,
}: {
  initial: BlogPost | null;
  onSave: (draft: BlogDraft, id?: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<BlogDraft>(() =>
    initial ? { ...initial } : emptyBlogDraft(),
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = <K extends keyof BlogDraft>(key: K, value: BlogDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const title = draft.title.trim();
    if (!title) return setError("A title is required.");

    // Auto-derive the slug from the title when the field is left blank.
    const slug = draft.slug.trim() ? slugify(draft.slug) : slugify(title);
    if (!slug) return setError("Could not build a URL slug from that title. Add one manually.");

    const cover = draft.cover_image?.trim() ? draft.cover_image.trim() : null;

    setBusy(true);
    try {
      await onSave(
        {
          ...draft,
          title,
          slug,
          excerpt: draft.excerpt.trim(),
          author: draft.author.trim() || "Star Global Vision",
          cover_image: cover,
        },
        initial?.id,
      );

      // Only once the row is safely written: drop the image it used to point at,
      // so a failed save never leaves the post with a deleted cover.
      if (initial?.cover_image && initial.cover_image !== cover) {
        await deleteImage(initial.cover_image);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the post.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!initial || !onDelete) return;
    if (!confirmDelete) return setConfirmDelete(true);
    setBusy(true);
    try {
      await onDelete(initial.id);
      await deleteImage(initial.cover_image);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the post.");
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="grid gap-5 rounded-3xl border border-border bg-card p-6 shadow-soft md:p-8"
    >
      <h2 className="font-display text-xl font-bold">{initial ? "Edit post" : "New blog post"}</h2>

      <TextField label="Title" value={draft.title} onChange={(v) => set("title", v)} required />

      <div className="grid gap-5 md:grid-cols-2">
        <TextField
          label="URL slug"
          value={draft.slug}
          onChange={(v) => set("slug", v)}
          placeholder="auto-generated from the title"
          hint={`Page will live at /blog/${draft.slug.trim() ? slugify(draft.slug) : slugify(draft.title) || "…"}`}
        />
        <SelectField
          label="Category"
          value={draft.category}
          onChange={(v) => set("category", v)}
          options={blogCategories}
        />
      </div>

      <TextArea
        label="Excerpt"
        value={draft.excerpt}
        onChange={(v) => set("excerpt", v)}
        rows={2}
        hint="One or two sentences. Shown on cards and used as the page description for search engines."
      />

      <TextArea
        label="Body"
        value={draft.content}
        onChange={(v) => set("content", v)}
        rows={16}
        hint={bodyHint}
        required
      />

      <div className="grid gap-5 md:grid-cols-2">
        <TextField label="Author" value={draft.author} onChange={(v) => set("author", v)} />
        <TextField
          label="Publish date"
          type="date"
          value={draft.published_at}
          onChange={(v) => set("published_at", v)}
        />
      </div>

      <ImageField
        label="Cover image"
        value={draft.cover_image}
        onChange={(v) => set("cover_image", v)}
        folder="blog"
        hint="Optional. Shown on the blog grid, at the top of the article and when the link is shared. Leave empty for a branded placeholder. Landscape images work best."
      />

      <ToggleField
        label="Published"
        hint="Unpublished posts are only visible here in the admin, never on the public site."
        checked={draft.published}
        onChange={(v) => set("published", v)}
      />

      {error && <Notice tone="error">{error}</Notice>}
      {confirmDelete && (
        <Notice tone="error">
          Press <strong>Delete</strong> once more to permanently remove this post. This cannot be
          undone.
        </Notice>
      )}

      <EditorActions
        busy={busy}
        isEditing={Boolean(initial)}
        onCancel={onCancel}
        {...(onDelete ? { onDelete: remove } : {})}
      />
    </form>
  );
}

export function StoryEditor({
  initial,
  onSave,
  onDelete,
  onCancel,
}: {
  initial: SuccessStory | null;
  onSave: (draft: StoryDraft, id?: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<StoryDraft>(() =>
    initial ? { ...initial } : emptyStoryDraft(),
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = <K extends keyof StoryDraft>(key: K, value: StoryDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const name = draft.student_name.trim();
    if (!name) return setError("The student name is required.");

    const slug = draft.slug.trim() ? slugify(draft.slug) : slugify(`${name} ${draft.country}`);
    if (!slug) return setError("Could not build a URL slug. Add one manually.");

    const photo = draft.photo?.trim() ? draft.photo.trim() : null;

    setBusy(true);
    try {
      await onSave(
        {
          ...draft,
          student_name: name,
          slug,
          university: draft.university.trim(),
          course: draft.course.trim(),
          intake: draft.intake.trim(),
          quote: draft.quote.trim(),
          photo,
        },
        initial?.id,
      );

      if (initial?.photo && initial.photo !== photo) {
        await deleteImage(initial.photo);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the story.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!initial || !onDelete) return;
    if (!confirmDelete) return setConfirmDelete(true);
    setBusy(true);
    try {
      await onDelete(initial.id);
      await deleteImage(initial.photo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the story.");
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="grid gap-5 rounded-3xl border border-border bg-card p-6 shadow-soft md:p-8"
    >
      <h2 className="font-display text-xl font-bold">
        {initial ? "Edit story" : "New success story"}
      </h2>

      <div className="grid gap-5 md:grid-cols-2">
        <TextField
          label="Student name"
          value={draft.student_name}
          onChange={(v) => set("student_name", v)}
          required
        />
        <TextField
          label="URL slug"
          value={draft.slug}
          onChange={(v) => set("slug", v)}
          placeholder="auto-generated"
          hint={`/success-stories/${
            draft.slug.trim()
              ? slugify(draft.slug)
              : slugify(`${draft.student_name} ${draft.country}`) || "…"
          }`}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <SelectField
          label="Destination"
          value={draft.country}
          onChange={(v) => set("country", v)}
          options={destinationNames}
        />
        <TextField
          label="University / college"
          value={draft.university}
          onChange={(v) => set("university", v)}
          placeholder="Deakin University, Melbourne"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <TextField
          label="Course"
          value={draft.course}
          onChange={(v) => set("course", v)}
          placeholder="Master of Data Science"
        />
        <TextField
          label="Intake"
          value={draft.intake}
          onChange={(v) => set("intake", v)}
          placeholder="February 2026"
        />
      </div>

      <TextArea
        label="Short quote"
        value={draft.quote}
        onChange={(v) => set("quote", v)}
        rows={3}
        hint="Shown on the card and pulled out at the top of the story page."
      />

      <TextArea
        label="Full story"
        value={draft.story}
        onChange={(v) => set("story", v)}
        rows={14}
        hint={bodyHint}
      />

      <div className="grid gap-5 md:grid-cols-2">
        <TextField
          label="Publish date"
          type="date"
          value={draft.published_at}
          onChange={(v) => set("published_at", v)}
        />
        <ImageField
          label="Student photo"
          value={draft.photo}
          onChange={(v) => set("photo", v)}
          folder="stories"
          aspect="square"
          hint="Optional. Falls back to the student's initials. A square headshot crops best."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ToggleField
          label="Published"
          hint="Only published stories appear on the public site."
          checked={draft.published}
          onChange={(v) => set("published", v)}
        />
        <ToggleField
          label="Featured"
          hint="Featured stories are highlighted on the home page."
          checked={draft.featured}
          onChange={(v) => set("featured", v)}
        />
      </div>

      {error && <Notice tone="error">{error}</Notice>}
      {confirmDelete && (
        <Notice tone="error">
          Press <strong>Delete</strong> once more to permanently remove this story. This cannot be
          undone.
        </Notice>
      )}

      <EditorActions
        busy={busy}
        isEditing={Boolean(initial)}
        onCancel={onCancel}
        {...(onDelete ? { onDelete: remove } : {})}
      />
    </form>
  );
}

export function TeamEditor({
  initial,
  onSave,
  onDelete,
  onCancel,
}: {
  initial: TeamMember | null;
  onSave: (draft: TeamDraft, id?: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<TeamDraft>(() =>
    initial ? { ...initial } : emptyTeamDraft(),
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = <K extends keyof TeamDraft>(key: K, value: TeamDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const name = draft.name.trim();
    if (!name) return setError("Name is required.");

    const designation = draft.designation.trim();
    if (!designation) return setError("Designation is required.");

    const photo = draft.photo?.trim() ? draft.photo.trim() : null;

    setBusy(true);
    try {
      await onSave(
        {
          ...draft,
          name,
          designation,
          department: draft.department.trim(),
          email: draft.email.trim(),
          phone: draft.phone.trim(),
          bio: draft.bio.trim(),
          photo,
        },
        initial?.id,
      );

      if (initial?.photo && initial.photo !== photo) {
        await deleteImage(initial.photo);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the team member.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!initial || !onDelete) return;
    if (!confirmDelete) return setConfirmDelete(true);
    setBusy(true);
    try {
      await onDelete(initial.id);
      await deleteImage(initial.photo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the team member.");
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="grid gap-5 rounded-3xl border border-border bg-card p-6 shadow-soft md:p-8"
    >
      <h2 className="font-display text-xl font-bold">
        {initial ? "Edit team member" : "Add team member"}
      </h2>

      <div className="grid gap-5 md:grid-cols-2">
        <TextField label="Full name" value={draft.name} onChange={(v) => set("name", v)} required />
        <TextField
          label="Designation"
          value={draft.designation}
          onChange={(v) => set("designation", v)}
          placeholder="Senior Counsellor"
          required
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <SelectField
          label="Department"
          value={draft.department}
          onChange={(v) => set("department", v)}
          options={teamDepartments}
        />
        <TextField
          label="Sort order"
          type="number"
          value={String(draft.sort_order)}
          onChange={(v) => set("sort_order", parseInt(v, 10) || 0)}
          hint="Lower numbers appear first."
        />
      </div>

      <TextArea
        label="Bio"
        value={draft.bio}
        onChange={(v) => set("bio", v)}
        rows={3}
        hint="Short professional bio. Shown on the About page."
      />

      <div className="grid gap-5 md:grid-cols-2">
        <TextField
          label="Email (optional)"
          type="email"
          value={draft.email}
          onChange={(v) => set("email", v)}
          placeholder="name@example.com"
          hint="Optional. Shown as a contact link."
        />
        <TextField
          label="Phone (optional)"
          type="tel"
          value={draft.phone}
          onChange={(v) => set("phone", v)}
          placeholder="+977-9XXXXXXXXX"
          hint="Optional. Shown as a contact link."
        />
      </div>

      <ImageField
        label="Photo"
        value={draft.photo}
        onChange={(v) => set("photo", v)}
        folder="team"
        aspect="square"
        hint="Optional. Square headshots work best. Falls back to initials if not uploaded."
      />

      <ToggleField
        label="Published"
        hint="Unpublished members are only visible in the admin, never on the public site."
        checked={draft.published}
        onChange={(v) => set("published", v)}
      />

      {error && <Notice tone="error">{error}</Notice>}
      {confirmDelete && (
        <Notice tone="error">
          Press <strong>Delete</strong> once more to permanently remove this team member. This
          cannot be undone.
        </Notice>
      )}

      <EditorActions
        busy={busy}
        isEditing={Boolean(initial)}
        onCancel={onCancel}
        {...(onDelete ? { onDelete: remove } : {})}
      />
    </form>
  );
}

export type { BlogDraft, StoryDraft, TeamDraft, CountryDraft };

/* -------------------------------------------------------------------------- */
/* Destinations                                                               */
/* -------------------------------------------------------------------------- */

export function CountryEditor({
  initial,
  onSave,
  onDelete,
  onCancel,
}: {
  initial: Country | null;
  onSave: (draft: CountryDraft, id?: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<CountryDraft>(() =>
    initial ? { ...initial } : emptyCountryDraft(),
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = <K extends keyof CountryDraft>(key: K, value: CountryDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const previewSlug = draft.slug.trim() ? slugify(draft.slug) : slugify(draft.name);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const name = draft.name.trim();
    if (!name) return setError("The destination name is required.");

    const slug = previewSlug;
    if (!slug) return setError("Could not build a URL slug from that name. Add one manually.");

    const image = draft.image?.trim() ? draft.image.trim() : null;

    setBusy(true);
    try {
      await onSave(
        {
          ...draft,
          name,
          slug,
          // Uppercased here rather than in the component that draws it, so the
          // value in the database is the value on the page.
          flag: draft.flag.trim().toUpperCase().slice(0, 3),
          blurb: draft.blurb.trim(),
          intakes: draft.intakes.trim(),
          work: draft.work.trim(),
          tests: draft.tests.trim(),
          tuition: draft.tuition.trim(),
          cost_living: draft.cost_living.trim(),
          image,
        },
        initial?.id,
      );

      // Only after the row is safely written, so a failed save never strips the
      // photo off a destination that is still live.
      if (initial?.image && initial.image !== image) {
        await deleteImage(initial.image);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the destination.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!initial || !onDelete) return;
    if (!confirmDelete) return setConfirmDelete(true);
    setBusy(true);
    try {
      await onDelete(initial.id);
      await deleteImage(initial.image);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the destination.");
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="grid gap-5 rounded-3xl border border-border bg-card p-6 shadow-soft md:p-8"
    >
      <h2 className="font-display text-xl font-bold">
        {initial ? `Edit ${initial.name}` : "Add a destination"}
      </h2>

      <div className="grid gap-5 md:grid-cols-[1.4fr_0.7fr_1fr]">
        <TextField
          label="Country name"
          value={draft.name}
          onChange={(v) => set("name", v)}
          placeholder="Australia"
          required
        />
        <TextField
          label="Flag code"
          value={draft.flag}
          onChange={(v) => set("flag", v)}
          placeholder="AU"
          hint="Two letters. Shown in the nav chip."
        />
        <TextField
          label="URL slug"
          value={draft.slug}
          onChange={(v) => set("slug", v)}
          placeholder="auto-generated from the name"
          hint={`/countries/${previewSlug || "…"}`}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <SelectField
          label="Tier"
          value={draft.tier}
          onChange={(v) => set("tier", v as Country["tier"])}
          options={countryTiers}
        />
        <TextField
          label="Sort order"
          type="number"
          value={String(draft.sort_order)}
          onChange={(v) => set("sort_order", parseInt(v, 10) || 0)}
          hint="Lower numbers appear first, in the nav and on the grid."
        />
      </div>

      <TextArea
        label="Short blurb"
        value={draft.blurb}
        onChange={(v) => set("blurb", v)}
        rows={3}
        hint="One or two sentences. Shown on the card, in the comparison table and as the page description for search engines."
      />

      <TextArea
        label="Highlights"
        value={arrayToLines(draft.highlights)}
        onChange={(v) => set("highlights", linesToArray(v))}
        rows={4}
        hint="One per line. Shown as tick-marked pills in the page hero. Three or four reads best."
      />

      <div className="grid gap-5 md:grid-cols-2">
        <TextField
          label="Intakes"
          value={draft.intakes}
          onChange={(v) => set("intakes", v)}
          placeholder="February, July (limited November)"
        />
        <TextField
          label="Work rights"
          value={draft.work}
          onChange={(v) => set("work", v)}
          placeholder="48 hrs / fortnight, 2-4 yrs post-study"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <TextField
          label="Tests accepted"
          value={draft.tests}
          onChange={(v) => set("tests", v)}
          placeholder="IELTS / PTE / Duolingo"
        />
        <TextField
          label="Tuition"
          value={draft.tuition}
          onChange={(v) => set("tuition", v)}
          placeholder="AUD 25,000 - 45,000 a year"
        />
        <TextField
          label="Cost of living"
          value={draft.cost_living}
          onChange={(v) => set("cost_living", v)}
          placeholder="AUD 24,000 - 29,000 a year"
        />
      </div>

      <TextArea
        label="Overview"
        value={draft.overview}
        onChange={(v) => set("overview", v)}
        rows={14}
        hint={bodyHint}
      />

      <TextArea
        label="Entry and visa requirements"
        value={draft.requirements}
        onChange={(v) => set("requirements", v)}
        rows={10}
        hint={bodyHint}
      />

      <TextArea
        label="Popular universities"
        value={arrayToLines(draft.universities)}
        onChange={(v) => set("universities", linesToArray(v))}
        rows={6}
        hint="One per line. Listed in the sidebar of the destination page."
      />

      <ImageField
        label="Destination photo"
        value={draft.image}
        onChange={(v) => set("image", v)}
        folder="countries"
        hint="Optional, but this is the page hero and the card image — a landscape photo makes the biggest single difference to how the destination looks. Without one it falls back to a branded panel."
      />

      <ToggleField
        label="Published"
        hint="The switch that shows or hides this destination everywhere at once: the header menu, the country guide, the enquiry dropdowns and the sitemap. Unpublished destinations stay here in the admin."
        checked={draft.published}
        onChange={(v) => set("published", v)}
      />

      {error && <Notice tone="error">{error}</Notice>}
      {confirmDelete && (
        <Notice tone="error">
          Press <strong>Delete</strong> once more to permanently remove this destination and its
          page. This cannot be undone — if you only want it off the site, untick Published instead.
        </Notice>
      )}

      <EditorActions
        busy={busy}
        isEditing={Boolean(initial)}
        onCancel={onCancel}
        {...(onDelete ? { onDelete: remove } : {})}
      />
    </form>
  );
}
