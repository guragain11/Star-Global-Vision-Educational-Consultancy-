/**
 * One editor and one list view for every editable list on the site.
 *
 * Both are driven by a `CollectionSpec` from `src/data/collections.ts`: the spec
 * says what fields a record has and what to call them, and everything here is
 * written against that rather than against a particular record type. Adding an
 * editable list is a declaration in that file, not a component in this one.
 *
 * The records live inside a jsonb column, so values arrive as `unknown` and are
 * coerced per field kind on the way into the inputs. That is the price of one
 * editor instead of thirteen, and it is paid in this file alone.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, DownloadCloud, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import {
  ImageField,
  MissingTableNotice,
  Notice,
  RowSkeleton,
  SelectField,
  StatusPill,
  TextArea,
  TextField,
  ToggleField,
} from "@/components/admin/AdminUI";
import { EditorActions } from "@/components/admin/Editors";
import { blankItem, type ContentRow, type ErasedSpec } from "@/data/collections";
import {
  adminListCollection,
  deleteContentItem,
  importSeedCollection,
  isMissingTable,
  saveContentItem,
} from "@/lib/content-api";
import { arrayToLines, linesToArray } from "@/lib/content-utils";
import { deleteImage } from "@/lib/storage";

type ErasedField = ErasedSpec["fields"][number];

/* -------------------------------------------------------------------------- */
/* Reading values back out of jsonb                                           */
/* -------------------------------------------------------------------------- */

const asText = (value: unknown) => (typeof value === "string" ? value : "");

const asNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const asLines = (value: unknown) =>
  Array.isArray(value) ? value.filter((line): line is string => typeof line === "string") : [];

const asImage = (value: unknown) => (typeof value === "string" && value ? value : null);

/**
 * The rows of a `nested` field, with every cell forced to a string.
 *
 * Anything that is not an object is dropped rather than repaired: a malformed
 * row has no salvageable meaning, and showing a blank row would invite someone
 * to save it back.
 */
const asRecords = (value: unknown): Record<string, string>[] => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (typeof item !== "object" || item === null || Array.isArray(item)) return [];
    const row: Record<string, string> = {};
    for (const [key, cell] of Object.entries(item as Record<string, unknown>)) {
      row[key] = typeof cell === "string" ? cell : "";
    }
    return [row];
  });
};

/* -------------------------------------------------------------------------- */
/* Fields                                                                     */
/* -------------------------------------------------------------------------- */

type SubField = NonNullable<ErasedField["subFields"]>[number];

/**
 * A repeating list of records inside one record: an exam's sections, or the
 * score targets beside them.
 *
 * The only nested editing in /admin, and kept as plain as it can be — a stack
 * of small cards, each with its own move and remove buttons, rather than a
 * table or a drag handle. Staff edit these rarely and one at a time.
 */
function NestedField({
  label,
  hint,
  itemLabel,
  subFields,
  rows,
  onChange,
}: {
  label: string;
  hint: string;
  itemLabel: string;
  subFields: readonly SubField[];
  rows: Record<string, string>[];
  onChange: (rows: Record<string, string>[]) => void;
}) {
  const blank = () => Object.fromEntries(subFields.map((f) => [f.key, ""]));

  const setCell = (index: number, key: string, value: string) =>
    onChange(rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));

  const move = (from: number, to: number) => {
    if (to < 0 || to >= rows.length) return;
    const next = [...rows];
    const [moved] = next.splice(from, 1);
    if (moved) next.splice(to, 0, moved);
    onChange(next);
  };

  return (
    <div className="grid gap-3 rounded-2xl border border-border bg-secondary/30 p-5">
      <div>
        <span className="text-sm font-medium">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>}
      </div>

      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Nothing here yet. Add the first {itemLabel}.
        </p>
      ) : (
        <div className="grid gap-3">
          {rows.map((row, index) => (
            /*
              Keyed by position, not by content. The fields are what is being
              typed into, so any content-derived key changes on every keystroke
              and costs the input its focus.
            */
            <div key={index} className="grid gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {itemLabel} {index + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, index - 1)}
                    disabled={index === 0}
                    aria-label={`Move this ${itemLabel} up`}
                    className="inline-flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, index + 1)}
                    disabled={index === rows.length - 1}
                    aria-label={`Move this ${itemLabel} down`}
                    className="inline-flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange(rows.filter((_, i) => i !== index))}
                    aria-label={`Remove this ${itemLabel}`}
                    className="inline-flex size-8 items-center justify-center rounded-full border border-destructive/30 text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>

              {subFields.map((sub) =>
                sub.kind === "textarea" ? (
                  <TextArea
                    key={sub.key}
                    label={sub.label}
                    value={row[sub.key] ?? ""}
                    onChange={(value) => setCell(index, sub.key, value)}
                    rows={sub.rows ?? 3}
                    placeholder={sub.placeholder ?? ""}
                  />
                ) : (
                  <TextField
                    key={sub.key}
                    label={sub.label}
                    value={row[sub.key] ?? ""}
                    onChange={(value) => setCell(index, sub.key, value)}
                    placeholder={sub.placeholder ?? ""}
                  />
                ),
              )}
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => onChange([...rows, blank()])}
        className="press inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold transition-colors hover:border-primary/40 hover:text-primary"
      >
        <Plus className="size-3.5" /> Add {itemLabel}
      </button>
    </div>
  );
}

/**
 * A number input that keeps its own text while being typed.
 *
 * Storing only the parsed number meant deleting the last digit rewrote the box
 * as "0", and the next keystroke landed after it. The record still receives a
 * number; this only holds what is on screen.
 */
function NumberField({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder: string;
  hint: string;
}) {
  const [text, setText] = useState(String(value));

  return (
    <TextField
      label={label}
      type="number"
      value={text}
      placeholder={placeholder}
      hint={hint}
      onChange={(next) => {
        setText(next);
        const parsed = Number(next);
        onChange(Number.isFinite(parsed) ? parsed : 0);
      }}
    />
  );
}

/** One input, chosen by the field's kind. */
function FieldInput({
  field,
  value,
  onChange,
}: {
  field: ErasedField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  /*
    Optional spec properties are defaulted rather than forwarded as undefined:
    the primitives in AdminUI take a plain string, and an empty hint or
    placeholder renders nothing anyway.
  */
  const hint = field.hint ?? "";
  const placeholder = field.placeholder ?? "";
  const required = field.required ?? false;

  switch (field.kind) {
    case "textarea":
      return (
        <TextArea
          label={field.label}
          value={asText(value)}
          onChange={onChange}
          rows={field.rows ?? 4}
          placeholder={placeholder}
          required={required}
          hint={hint}
        />
      );

    case "select":
      return (
        <SelectField
          label={field.label}
          value={asText(value)}
          onChange={onChange}
          options={field.options ?? []}
        />
      );

    case "number":
      return (
        <NumberField
          label={field.label}
          value={asNumber(value)}
          onChange={onChange}
          placeholder={placeholder}
          hint={hint}
        />
      );

    case "lines":
      return (
        <TextArea
          label={field.label}
          value={arrayToLines(asLines(value))}
          onChange={(next) => onChange(linesToArray(next))}
          rows={field.rows ?? 5}
          hint={hint || "One per line."}
        />
      );

    case "image":
      return (
        <ImageField
          label={field.label}
          value={asImage(value)}
          onChange={onChange}
          folder={field.folder ?? "site"}
          hint={hint}
        />
      );

    case "nested":
      return (
        <NestedField
          label={field.label}
          hint={hint}
          itemLabel={field.itemLabel ?? "item"}
          subFields={field.subFields ?? []}
          rows={asRecords(value)}
          onChange={onChange}
        />
      );

    default:
      return (
        <TextField
          label={field.label}
          value={asText(value)}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          hint={hint}
        />
      );
  }
}

/* -------------------------------------------------------------------------- */
/* The editor                                                                 */
/* -------------------------------------------------------------------------- */

/** A blank row at the end of the list, for the "add" form. */
function emptyRowFor(spec: ErasedSpec, lastSortOrder: number): ContentRow {
  return {
    id: "",
    collection: spec.id,
    sort_order: lastSortOrder + 10,
    published: true,
    data: blankItem(spec),
  };
}

export function SpecEditor({
  spec,
  initial,
  onSave,
  onDelete,
  onCancel,
}: {
  spec: ErasedSpec;
  initial: ContentRow;
  onSave: (row: ContentRow) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<ContentRow>(() => ({
    ...initial,
    // Spread over a blank record so a row saved before a field was added still
    // fills every input, rather than leaving React with an undefined value.
    data: { ...blankItem(spec), ...initial.data },
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isEditing = Boolean(initial.id);

  const setValue = (key: string, value: unknown) =>
    setDraft((current) => ({ ...current, data: { ...current.data, [key]: value } }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onSave(draft);

      /*
        Only once the row is safely written: drop any image this record has
        stopped pointing at, so a failed save never deletes a picture that is
        still live on the site.
      */
      for (const field of spec.fields) {
        if (field.kind !== "image") continue;
        const before = asImage(initial.data[field.key]);
        if (before && before !== asImage(draft.data[field.key])) await deleteImage(before);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this item.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!isEditing || !onDelete) return;
    if (!confirmDelete) return setConfirmDelete(true);
    setBusy(true);
    try {
      await onDelete(initial.id);
      for (const field of spec.fields) {
        if (field.kind !== "image") continue;
        const image = asImage(initial.data[field.key]);
        if (image) await deleteImage(image);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete this item.");
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="grid gap-5 rounded-3xl border border-border bg-card p-6 shadow-soft md:p-8"
    >
      <h2 className="font-display text-xl font-bold">
        {isEditing ? `Edit ${spec.label.toLowerCase()}` : `New ${spec.label.toLowerCase()}`}
      </h2>

      {spec.fields.map((field) => (
        <FieldInput
          key={field.key}
          field={field}
          value={draft.data[field.key]}
          onChange={(value) => setValue(field.key, value)}
        />
      ))}

      <ToggleField
        label="Show this on the website"
        hint="Untick to keep the item without showing it. Hiding every item in this list brings back the built-in content."
        checked={draft.published}
        onChange={(published) => setDraft((current) => ({ ...current, published }))}
      />

      {error && <Notice tone="error">{error}</Notice>}
      {confirmDelete && (
        <Notice tone="error">
          Press Delete again to remove this permanently. There is no undo.
        </Notice>
      )}

      <EditorActions busy={busy} isEditing={isEditing} onCancel={onCancel} onDelete={remove} />
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* The list                                                                   */
/* -------------------------------------------------------------------------- */

/** The first text field that is not the title, used as the row's summary line. */
function summaryOf(spec: ErasedSpec, row: ContentRow): string {
  const field = spec.fields.find(
    (f) => f.key !== spec.titleField && (f.kind === "text" || f.kind === "textarea"),
  );
  return field ? asText(row.data[field.key]) : "";
}

export function CollectionManager({ spec }: { spec: ErasedSpec }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [editing, setEditing] = useState<ContentRow | undefined>(undefined);

  const { data, isPending, error } = useQuery({
    queryKey: ["admin", "content", spec.id],
    queryFn: () => adminListCollection(spec.id),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "content", spec.id] });
    setEditing(undefined);
    /*
      The public pages read these lists from the root route loader, not from a
      query, because the header and footer need part of it on every page.
      Invalidating the router is what pushes an edit out to the live site.
    */
    void router.invalidate();
  };

  const save = useMutation({ mutationFn: saveContentItem, onSuccess: invalidate });
  const remove = useMutation({ mutationFn: deleteContentItem, onSuccess: invalidate });
  const importSeeds = useMutation({
    mutationFn: () => importSeedCollection(spec),
    onSuccess: invalidate,
  });

  /**
   * Moves one item and renumbers the list.
   *
   * Renumbering rather than swapping two values: rows imported or inserted
   * together can share a `sort_order`, and swapping equal numbers changes
   * nothing. Only the rows whose position actually moved are written.
   */
  const reorder = useMutation({
    mutationFn: async ({ from, to }: { from: number; to: number }) => {
      const rows = [...(data ?? [])];
      const moved = rows[from];
      if (!moved || to < 0 || to >= rows.length) return;
      rows.splice(from, 1);
      rows.splice(to, 0, moved);

      await Promise.all(
        rows
          .map((row, index) => ({ row, sort_order: index * 10 }))
          .filter(({ row, sort_order }) => row.sort_order !== sort_order)
          .map(({ row, sort_order }) => saveContentItem({ ...row, sort_order })),
      );
    },
    onSuccess: invalidate,
  });

  if (editing) {
    return (
      <SpecEditor
        spec={spec}
        initial={editing}
        onCancel={() => setEditing(undefined)}
        onSave={(row) => save.mutateAsync(row)}
        {...(editing.id ? { onDelete: (id: string) => remove.mutateAsync(id) } : {})}
      />
    );
  }

  const rows = data ?? [];
  const live = rows.filter((row) => row.published).length;
  const lastSortOrder = rows.reduce((max, row) => Math.max(max, row.sort_order), 0);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">{spec.label}</h1>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {spec.detail}
          </p>
        </div>
        {rows.length > 0 && (
          <button
            onClick={() => setEditing(emptyRowFor(spec, lastSortOrder))}
            className="surface-brand press inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-soft hover:-translate-y-0.5 hover:shadow-lift"
          >
            <Plus className="size-4" /> Add
          </button>
        )}
      </div>

      <div className="mt-8">
        {error ? (
          isMissingTable(error) ? (
            <MissingTableNotice table={error.table} />
          ) : (
            <Notice tone="error">{(error as Error).message}</Notice>
          )
        ) : isPending ? (
          <RowSkeleton />
        ) : rows.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
            <h2 className="font-display text-lg font-semibold">
              Nothing saved here yet — the site is showing the built-in version
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Import the {spec.seed.length} item{spec.seed.length === 1 ? "" : "s"} that are on the
              website right now to make each one editable. Nothing on the page changes — the words
              simply become yours to change.
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
                Import what is on the site
              </button>
              <button
                onClick={() => setEditing(emptyRowFor(spec, 0))}
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
            <p className="text-xs text-muted-foreground">
              {rows.length} item{rows.length === 1 ? "" : "s"}, {live} showing on the site. They
              appear in this order.
            </p>

            <div className="mt-4 grid gap-3">
              {rows.map((row, index) => (
                <div
                  key={row.id}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-hair"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-semibold">
                        {asText(row.data[spec.titleField]) || "Untitled"}
                      </h3>
                      <StatusPill published={row.published} />
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {summaryOf(spec, row)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => reorder.mutate({ from: index, to: index - 1 })}
                      disabled={index === 0 || reorder.isPending}
                      aria-label="Move up"
                      className="inline-flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowUp className="size-4" />
                    </button>
                    <button
                      onClick={() => reorder.mutate({ from: index, to: index + 1 })}
                      disabled={index === rows.length - 1 || reorder.isPending}
                      aria-label="Move down"
                      className="inline-flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowDown className="size-4" />
                    </button>
                    <button
                      onClick={() => setEditing(row)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      <Pencil className="size-3.5" /> Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {live === 0 && (
              <div className="mt-5">
                <Notice tone="info">
                  Nothing in this list is showing, so the site has fallen back to the built-in
                  version. Tick “Show this on the website” on at least one item to use your own.
                </Notice>
              </div>
            )}

            {reorder.error && (
              <div className="mt-5">
                <Notice tone="error">{(reorder.error as Error).message}</Notice>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
