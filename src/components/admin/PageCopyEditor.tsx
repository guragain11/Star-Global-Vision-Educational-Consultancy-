import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { useState } from "react";

import { Notice, MissingTableNotice, TextArea, TextField } from "@/components/admin/AdminUI";
import {
  copyKey,
  copyPages,
  type CopyBlock,
  type CopyPage,
  type CopySection,
  type PageCopy,
} from "@/data/page-copy";
import { adminListPageCopy, isMissingTable, resetPageCopy, savePageCopy } from "@/lib/content-api";

/**
 * The eyebrows, headings and intro paragraphs on the marketing pages.
 *
 * Every block on the site is listed here whether or not it has been edited, and
 * a block that has never been saved shows the copy the page is rendering today
 * rather than an empty box. That is the difference between "change the heading
 * on the process section" and "guess which of fifty-two headings this row is".
 *
 * Each block saves on its own. A page has up to twelve of them, and one Save at
 * the bottom of fifty-two inputs would mean a stray keystroke in an unrelated
 * block goes live with the one you meant to change.
 */
export function PageCopyManager() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [pageId, setPageId] = useState(copyPages[0]?.id ?? "");
  const page: CopyPage | undefined = copyPages.find((p) => p.id === pageId) ?? copyPages[0];

  const { data, isPending, error } = useQuery({
    queryKey: ["admin", "page-copy"],
    queryFn: adminListPageCopy,
  });

  /*
    Keyed the same way the public pages key it, so a block can find its own row
    without scanning the list once per block.
  */
  const saved: PageCopy = Object.fromEntries((data ?? []).map((row) => [copyKey(row), row]));

  /*
    Both mutations refresh the same two things: this tab's list, and the router.
    The public pages read copy from the root loader rather than a query, because
    the header and footer need it on every route, so invalidating the router is
    what makes an edit show up without a rebuild.
  */
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "page-copy"] });
    void router.invalidate();
  };

  if (!page) return null;

  return (
    <>
      <div>
        <h1 className="font-display text-2xl font-bold">Headings &amp; intros</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The small label, the heading and the paragraph above each section of the site. The lists
          underneath them are edited in the other tabs.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {copyPages.map((item) => {
          const edited = item.sections.filter((s) => saved[copyKey(s)]).length;
          return (
            <button
              key={item.id}
              onClick={() => setPageId(item.id)}
              aria-current={item.id === page.id ? "true" : undefined}
              className={`press inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                item.id === page.id
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
              }`}
            >
              {item.label}
              {edited > 0 && (
                <span className="rounded-full bg-accent-soft px-1.5 py-0.5 text-[0.65rem] font-bold text-accent-foreground">
                  {edited}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        {error ? (
          isMissingTable(error) ? (
            <MissingTableNotice table={error.table} />
          ) : (
            <Notice tone="error">{(error as Error).message}</Notice>
          )
        ) : isPending ? (
          <div className="grid gap-4">
            {page.sections.map((s) => (
              <div
                key={copyKey(s)}
                className="h-52 animate-pulse rounded-3xl border border-border bg-card"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {page.sections.map((section) => (
              <CopyBlockForm
                /*
                  Keyed on the page too, so switching pages remounts the forms
                  rather than leaving one page's draft in another page's boxes.
                */
                key={copyKey(section)}
                section={section}
                row={saved[copyKey(section)]}
                onSaved={refresh}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/**
 * The lengths the `page_sections` check constraints enforce.
 *
 * Kept beside the inputs rather than only in the schema, because Postgres
 * rejecting an over-long paste surfaces as `violates check constraint
 * "page_sections_intro_check"` in the error notice, which tells a staff member
 * nothing about what to shorten. These have to match supabase/schema.sql:465-467.
 */
const limits = { eyebrow: 80, title: 200, intro: 1000 } as const;

/**
 * One block. Shows only the fields the block actually renders.
 *
 * Several sections use one part of the trio and ignore the rest — the About
 * mission panel renders an eyebrow and nothing else, the home hero's eyebrow
 * slot is the approval line from Site settings, the enquiry popup's is its logo.
 * Offering all three everywhere would put boxes on screen that change nothing on
 * the page, which is worse than offering fewer.
 */
function CopyBlockForm({
  section,
  row,
  onSaved,
}: {
  section: CopySection;
  row: { eyebrow: string; heading: string; intro: string } | undefined;
  onSaved: () => void;
}) {
  // A block that has never been saved starts from the built-in copy, so staff
  // edit the sentence that is on the page rather than typing one from scratch.
  const start: CopyBlock = row
    ? { eyebrow: row.eyebrow, title: row.heading, intro: row.intro }
    : { ...section.default };

  const [draft, setDraft] = useState<CopyBlock>(start);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const set = (key: keyof CopyBlock, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const save = useMutation({
    mutationFn: () =>
      savePageCopy({
        page: section.page,
        section: section.section,
        eyebrow: draft.eyebrow,
        heading: draft.title,
        intro: draft.intro,
      }),
    onSuccess: () => {
      setError(null);
      setSaved(true);
      onSaved();
    },
    onError: (err: Error) => setError(err.message),
  });

  const reset = useMutation({
    mutationFn: () => resetPageCopy(section.page, section.section),
    onSuccess: () => {
      setError(null);
      setSaved(false);
      setDraft({ ...section.default });
      onSaved();
    },
    onError: (err: Error) => setError(err.message),
  });

  const busy = save.isPending || reset.isPending;
  const shows = (field: keyof CopyBlock) => section.fields.includes(field);
  /*
    The generic "clear it to remove this" hints are suppressed on a block that
    has its own note, because on those blocks they are wrong: leaving the
    comparison table's intro empty keeps it counting the destinations rather
    than removing the paragraph, and the block's own hint says so.
  */
  const hintFor = (text: string) => (section.hint ? {} : { hint: text });

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-soft md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold">{section.label}</h2>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
            row ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
          }`}
        >
          {row ? "Edited" : "Built-in"}
        </span>
      </div>
      {section.hint && (
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{section.hint}</p>
      )}

      <div className="mt-5 grid gap-5">
        {shows("eyebrow") && (
          <TextField
            label="Small label above the heading"
            value={draft.eyebrow}
            onChange={(v) => set("eyebrow", v)}
            max={limits.eyebrow}
            {...hintFor("Two or three words, shown in capitals. Clear it to remove the label.")}
          />
        )}
        {shows("title") && (
          <TextField
            label="Heading"
            value={draft.title}
            onChange={(v) => set("title", v)}
            max={limits.title}
            {...hintFor("Clear it to go back to the built-in heading.")}
          />
        )}
        {shows("intro") && (
          <TextArea
            label="Intro paragraph"
            value={draft.intro}
            onChange={(v) => set("intro", v)}
            rows={3}
            max={limits.intro}
            {...hintFor(
              "One or two sentences under the heading. Clear it to remove the paragraph.",
            )}
          />
        )}
      </div>

      {error && (
        <div className="mt-5">
          <Notice tone="error">{error}</Notice>
        </div>
      )}
      {saved && (
        <div className="mt-5">
          <Notice tone="success">Saved. It is live on the site now.</Notice>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => save.mutate()}
          disabled={busy}
          className="surface-brand inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-soft transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {save.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save
        </button>
        {/*
          Only offered once there is a row to delete. On a block that has never
          been edited it would look like a way to undo your typing, and it is
          not — it clears what is stored, which is nothing.
        */}
        {row && (
          <button
            type="button"
            onClick={() => reset.mutate()}
            disabled={busy}
            className="press inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {reset.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RotateCcw className="size-4" />
            )}
            Back to the built-in wording
          </button>
        )}
      </div>
    </section>
  );
}
