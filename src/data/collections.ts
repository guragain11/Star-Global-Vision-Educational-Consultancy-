/**
 * Declarations for every editable list on the site.
 *
 * Each list — services, testimonials, the six process steps, FAQs and so on —
 * is one `CollectionSpec`. The spec says what a record looks like, what to call
 * each field in /admin, and what the site shows before anyone has edited it.
 * `/admin` builds its list view and its form from the spec, so adding an
 * editable list is a declaration here rather than a new table, a new API
 * function and a new editor component.
 *
 * All of them live in the single `site_content` table, discriminated by `id`
 * below, which is the value of its `collection` column.
 *
 * Deliberately free of React and of `lib/supabase`: the sitemap route and the
 * `head()` of several pages read these, and neither can pull in a component.
 */
import type { MediaFolder } from "@/lib/storage";

import { chooser, exams, method, testFaqs, type Exam } from "@/data/exams";
import {
  advantageIconNames,
  advantages,
  faqs,
  partners,
  processSteps,
  services,
  stats,
  testimonials,
  tests,
  visitNotes,
  type Advantage,
} from "@/data/site";

/* -------------------------------------------------------------------------- */
/* Rows as they come out of the database                                       */
/* -------------------------------------------------------------------------- */

/**
 * One row of `site_content`. `data` is the record itself, which is why it is
 * `unknown` per key: Postgres cannot enforce a shape inside jsonb, so the shape
 * is asserted once, on the way out, against the spec that wrote it.
 */
export type ContentRow = {
  id: string;
  collection: string;
  sort_order: number;
  published: boolean;
  data: Record<string, unknown>;
};

/**
 * Every published row on the site, grouped by collection.
 *
 * One query fetches all of them — a few kilobytes in total — because the root
 * route loads them for every page. Grouping happens once, there, rather than
 * filtering the flat list again in each of the dozen components that read it.
 */
export type SiteContent = Record<string, ContentRow[]>;

/* -------------------------------------------------------------------------- */
/* Field declarations                                                          */
/* -------------------------------------------------------------------------- */

/**
 * The keys of `T` whose value is assignable to `V`.
 *
 * This is what makes a field declaration typo-proof: a `textarea` field can
 * only name a key that actually holds a string, so renaming `detail` to `body`
 * in the record type turns every stale spec entry into a compile error instead
 * of a silently empty box in /admin.
 */
type KeysOfType<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];

type FieldBase<K> = {
  key: K;
  label: string;
  /** Small grey text under the input. Say where the value shows on the site. */
  hint?: string;
};

/**
 * One column of a `nested` field: a plain text input, one level deep.
 *
 * Deliberately not the full `FieldSpec`. A repeating row inside a repeating
 * record is already the most complicated thing in /admin, and allowing images
 * or further nesting inside one would make it unusable rather than powerful.
 */
type SubFieldSpec<E> = {
  key: KeysOfType<E, string>;
  label: string;
  kind: "text" | "textarea";
  rows?: number;
  placeholder?: string;
};

/**
 * A repeating list of records inside one record — an exam's sections, or its
 * score targets.
 *
 * Written as a mapped type rather than a plain union member so that the
 * sub-field keys are checked against the element type: for `sections`, `key`
 * can only be a string key of `ExamSection`. That is the same guarantee the
 * outer fields get, one level further down.
 */
type NestedFieldSpec<T> = {
  [K in KeysOfType<T, Record<string, string>[]>]: FieldBase<K> & {
    kind: "nested";
    /** Singular, lowercase: "section", "score target". Used on the buttons. */
    itemLabel: string;
    subFields: readonly SubFieldSpec<T[K] extends (infer E)[] ? E : never>[];
  };
}[KeysOfType<T, Record<string, string>[]>];

/** One input in the generated form, and how to render it. */
export type FieldSpec<T> =
  | (FieldBase<KeysOfType<T, string>> & {
      kind: "text";
      placeholder?: string;
      required?: boolean;
    })
  | (FieldBase<KeysOfType<T, string>> & {
      kind: "textarea";
      rows?: number;
      required?: boolean;
    })
  | (FieldBase<KeysOfType<T, string>> & { kind: "select"; options: readonly string[] })
  | (FieldBase<KeysOfType<T, number>> & { kind: "number"; placeholder?: string })
  | (FieldBase<KeysOfType<T, string[]>> & { kind: "lines" })
  | (FieldBase<KeysOfType<T, string | null>> & { kind: "image"; folder: MediaFolder })
  | NestedFieldSpec<T>;

export type CollectionSpec<T> = {
  /** The `collection` column value. Never change one after content exists. */
  id: string;
  /** Tab label in /admin. */
  label: string;
  /** One sentence in /admin saying where this list appears on the site. */
  detail: string;
  /** Which field names the row in the list view. */
  titleField: KeysOfType<T, string>;
  fields: readonly FieldSpec<T>[];
  /** What the site shows until staff import or add rows. */
  seed: readonly T[];
};

/**
 * A spec with its record type widened away, which is what the generic editor
 * works against.
 *
 * The typed `CollectionSpec<T>` is the authoring surface: it is what catches a
 * field naming a key the record does not have. Once declared, the form has to
 * treat every record as an open bag of values anyway — it is editing jsonb, and
 * one component serves thirteen different shapes — so the types stop being useful
 * at exactly this boundary. Any `CollectionSpec<T>` satisfies this structurally,
 * with no cast at the call site.
 */
export type ErasedSpec = {
  id: string;
  label: string;
  detail: string;
  titleField: string;
  fields: readonly {
    kind: "text" | "textarea" | "select" | "number" | "lines" | "image" | "nested";
    key: string;
    label: string;
    hint?: string;
    rows?: number;
    options?: readonly string[];
    placeholder?: string;
    required?: boolean;
    folder?: MediaFolder;
    itemLabel?: string;
    subFields?: readonly {
      key: string;
      label: string;
      kind: "text" | "textarea";
      rows?: number;
      placeholder?: string;
    }[];
  }[];
  seed: readonly Record<string, unknown>[];
};

/**
 * A blank record for the "add" form, derived from the field list rather than
 * written out per collection — one fewer thing to keep in step when a field is
 * added.
 *
 * Also the base every stored record is spread onto, so a row saved before a
 * field existed reads as empty rather than undefined, and the site never has to
 * guard each individual value.
 */
export function blankItem(spec: ErasedSpec): Record<string, unknown> {
  const blank: Record<string, unknown> = {};
  for (const field of spec.fields) {
    switch (field.kind) {
      case "number":
        blank[field.key] = 0;
        break;
      case "lines":
      case "nested":
        blank[field.key] = [];
        break;
      case "image":
        blank[field.key] = null;
        break;
      case "select":
        blank[field.key] = field.options?.[0] ?? "";
        break;
      default:
        blank[field.key] = "";
    }
  }
  return blank;
}

/**
 * The records for one collection, ready to render.
 *
 * Falls back to the seed whenever the table has nothing for this collection —
 * an unconfigured Supabase, a failed request, or simply a list staff have not
 * imported yet all land here, and all of them should show the site as written.
 *
 * An empty list is therefore not expressible through the database. Unpublishing
 * every row shows the seed again rather than an empty section, which is the
 * lesser of the two surprises: a blank hole in the middle of the home page is
 * worse than stale-but-real copy.
 */
export function itemsFrom<T>(content: SiteContent | undefined, spec: CollectionSpec<T>): T[] {
  const rows = content?.[spec.id];
  if (!rows || rows.length === 0) return [...spec.seed];

  /*
    The only two casts in this file, both for the same reason: Postgres cannot
    type the inside of a jsonb column, so a record's shape is guaranteed by the
    form that wrote it rather than by the database. The first is only needed
    because `T` is still open here — at a concrete call site a typed spec is a
    plain `ErasedSpec` with no cast at all. Spreading over the blank record
    covers a row saved before a field was added.
  */
  const blank = blankItem(spec as unknown as ErasedSpec);
  return rows.map((row) => ({ ...blank, ...row.data }) as T);
}

/* -------------------------------------------------------------------------- */
/* The collections                                                             */
/* -------------------------------------------------------------------------- */

export type TestClass = (typeof tests)[number];
export type Service = (typeof services)[number];
export type Testimonial = (typeof testimonials)[number];
export type Figure = { to: number; suffix: string; label: string };
export type ProcessStep = (typeof processSteps)[number];
/** The marquee is a list of names, so each row is a record with one field. */
export type Partner = { name: string };
export type Faq = (typeof faqs)[number];

export const testsSpec: CollectionSpec<TestClass> = {
  id: "tests",
  label: "Test classes",
  detail:
    "The classes you run. Shown on the home page, and offered as options in the enquiry form.",
  titleField: "name",
  fields: [
    { kind: "text", key: "name", label: "Test", placeholder: "IELTS", required: true },
    {
      kind: "textarea",
      key: "detail",
      label: "What the class covers",
      rows: 3,
      required: true,
    },
    { kind: "text", key: "duration", label: "Course length", placeholder: "6 weeks" },
    { kind: "text", key: "mode", label: "Batches", placeholder: "Morning / Day / Evening" },
  ],
  seed: tests,
};

export const servicesSpec: CollectionSpec<Service> = {
  id: "services",
  label: "Services",
  detail: "The areas of work your support covers. Shown on the home page and the About page.",
  titleField: "title",
  fields: [
    {
      kind: "text",
      key: "title",
      label: "Service",
      placeholder: "Career counselling",
      required: true,
    },
    { kind: "textarea", key: "detail", label: "One-line description", rows: 2, required: true },
  ],
  seed: services,
};

export const testimonialsSpec: CollectionSpec<Testimonial> = {
  id: "testimonials",
  label: "Testimonials",
  detail:
    "Short student quotes. Used on the About page, and on the home page whenever there are no published success stories.",
  titleField: "name",
  fields: [
    { kind: "text", key: "name", label: "Student name", required: true },
    {
      kind: "text",
      key: "result",
      label: "Where they went",
      placeholder: "Master of IT at Deakin University, Australia",
      required: true,
    },
    { kind: "textarea", key: "quote", label: "What they said", rows: 4, required: true },
  ],
  seed: testimonials,
};

export const figuresSpec: CollectionSpec<Figure> = {
  id: "figures",
  label: "Headline figures",
  detail:
    "The numbers that count up on the home page, About page and success stories. The destination count is added automatically from your live destination list.",
  titleField: "label",
  fields: [
    {
      kind: "number",
      key: "to",
      label: "Number",
      placeholder: "3500",
    },
    {
      kind: "text",
      key: "suffix",
      label: "Suffix",
      placeholder: "+",
      hint: "Written straight after the number, e.g. + or %. Leave blank for none.",
    },
    { kind: "text", key: "label", label: "What it counts", required: true },
  ],
  seed: [stats.counselled, stats.visa, stats.years],
};

export const processStepsSpec: CollectionSpec<ProcessStep> = {
  id: "process-steps",
  label: "How we work",
  detail: "The numbered stages shown on the home page and the About page.",
  titleField: "title",
  fields: [
    {
      kind: "text",
      key: "step",
      label: "Step number",
      placeholder: "01",
      hint: "Shown as a large watermark on the card. Two digits reads best.",
      required: true,
    },
    { kind: "text", key: "title", label: "Stage", required: true },
    { kind: "textarea", key: "detail", label: "What happens", rows: 3, required: true },
  ],
  seed: processSteps,
};

export const advantagesSpec: CollectionSpec<Advantage> = {
  id: "advantages",
  label: "Why us",
  detail: "The differentiators in the “What makes us different” band on the home and About pages.",
  titleField: "title",
  fields: [
    { kind: "text", key: "title", label: "Claim", required: true },
    { kind: "textarea", key: "detail", label: "Why it is true", rows: 3, required: true },
    {
      kind: "select",
      key: "icon",
      label: "Icon",
      options: advantageIconNames,
      // Named rather than previewed: a dropdown of glyph names is honest about
      // what it is, and the six are distinct enough to pick from a word.
    },
  ],
  seed: advantages,
};

export const partnersSpec: CollectionSpec<Partner> = {
  id: "partners",
  label: "Partner institutions",
  detail: "Names in the scrolling band on the home page. Text only, no logos.",
  titleField: "name",
  fields: [{ kind: "text", key: "name", label: "University or college", required: true }],
  seed: partners.map((name) => ({ name })),
};

export const faqsSpec: CollectionSpec<Faq> = {
  id: "faqs",
  label: "FAQs",
  detail:
    "The questions at the bottom of the home page. These are also sent to Google, which sometimes shows them directly in search results.",
  titleField: "q",
  fields: [
    { kind: "text", key: "q", label: "Question", required: true },
    {
      kind: "textarea",
      key: "a",
      label: "Answer",
      rows: 5,
      required: true,
      hint: "Answer it properly. A vague answer here is worse than no question.",
    },
  ],
  seed: faqs,
};

export type VisitNote = (typeof visitNotes)[number];

export const visitNotesSpec: CollectionSpec<VisitNote> = {
  id: "visit-notes",
  label: "Visiting notes",
  detail: "Three cards under the enquiry form on the Contact page.",
  titleField: "title",
  fields: [
    { kind: "text", key: "title", label: "Heading", required: true },
    {
      kind: "textarea",
      key: "detail",
      label: "Detail",
      rows: 4,
      required: true,
      hint: "The practical answer. These are the questions people ask on the phone before coming in.",
    },
  ],
  seed: visitNotes,
};

/**
 * The collections that make up the home page, the About page and the Contact
 * page, in the order /admin lists them.
 *
 * Erased on the way in: each spec has a different record type, so the only list
 * that can hold all nine is a list of erased ones. The navigation is the only
 * thing that reads this; each page reads its own typed spec directly.
 */
export const pageCollections: ErasedSpec[] = [
  figuresSpec,
  servicesSpec,
  processStepsSpec,
  advantagesSpec,
  testsSpec,
  testimonialsSpec,
  partnersSpec,
  faqsSpec,
  visitNotesSpec,
];

/* -------------------------------------------------------------------------- */
/* Test Preparation                                                            */
/* -------------------------------------------------------------------------- */

export type Chooser = (typeof chooser)[number];
export type Method = (typeof method)[number];
export type TestFaq = (typeof testFaqs)[number];

/**
 * The four exams, and the only collection with fields inside fields.
 *
 * `accent` is not here on purpose. The header tint used to be a raw Tailwind
 * fragment on the record, and asking staff to type `from-primary/12` would be
 * asking them to write CSS; the page derives it from the panel's position
 * instead, so a reordered or a fifth exam is tinted correctly for free.
 */
export const examsSpec: CollectionSpec<Exam> = {
  id: "exams",
  label: "Exams",
  detail:
    "One panel each on the Test Preparation page, plus the Test Prep menu in the header and the comparison table.",
  titleField: "name",
  fields: [
    {
      kind: "text",
      key: "name",
      label: "Exam name",
      placeholder: "IELTS Academic",
      required: true,
    },
    {
      kind: "text",
      key: "shortName",
      label: "Short name",
      placeholder: "IELTS",
      hint: "Used in the jump-to bar, the header menu and the comparison table. One or two words.",
      required: true,
    },
    {
      kind: "text",
      key: "slug",
      label: "Link name",
      placeholder: "ielts",
      hint: "The end of the link to this panel, as in /test-preparation#ielts. Lowercase letters and hyphens only, and changing it breaks any link already shared.",
      required: true,
    },
    {
      kind: "textarea",
      key: "tagline",
      label: "One-line summary",
      rows: 2,
      required: true,
      hint: "Sits under the exam name. Say what sets this test apart from the others.",
    },
    {
      kind: "textarea",
      key: "bestFor",
      label: "Who it suits",
      rows: 3,
      required: true,
      hint: "Shown in the highlighted “Best for” box.",
    },
    {
      kind: "text",
      key: "format",
      label: "Format",
      placeholder: "Four skills, computer-delivered",
    },
    { kind: "text", key: "totalTime", label: "Total time", placeholder: "2 hours 45 minutes" },
    { kind: "text", key: "scale", label: "Score scale", placeholder: "Band 0-9, in half bands" },
    { kind: "text", key: "results", label: "Results in", placeholder: "3-5 days on computer" },
    { kind: "text", key: "validity", label: "Valid for", placeholder: "2 years" },
    {
      kind: "text",
      key: "delivery",
      label: "Where it is taken",
      placeholder: "Test centre (Kathmandu)",
    },
    {
      kind: "nested",
      key: "sections",
      label: "What the paper looks like",
      itemLabel: "section",
      hint: "The parts of the exam, in the order they are sat. Numbered automatically.",
      subFields: [
        { key: "name", label: "Section", kind: "text", placeholder: "Listening" },
        {
          key: "time",
          label: "Time and length",
          kind: "text",
          placeholder: "30 min · 40 questions",
        },
        { key: "detail", label: "What it asks of you", kind: "textarea", rows: 3 },
      ],
    },
    {
      kind: "nested",
      key: "targets",
      label: "Scores you need",
      itemLabel: "score target",
      hint: "The bands you see on real offer letters. Keep it honest — these are not promises from the test owner.",
      subFields: [
        { key: "label", label: "For", kind: "text", placeholder: "Most master's programs" },
        {
          key: "score",
          label: "Score",
          kind: "text",
          placeholder: "6.5 overall, no band under 6.0",
        },
      ],
    },
    {
      kind: "lines",
      key: "classNotes",
      label: "In our class",
      hint: "One per line. What your class does differently for this exam.",
    },
    { kind: "text", key: "courseLength", label: "Course length", placeholder: "6 weeks" },
    { kind: "text", key: "batches", label: "Batches", placeholder: "Morning · Day · Evening" },
  ],
  seed: exams,
};

export const chooserSpec: CollectionSpec<Chooser> = {
  id: "chooser",
  label: "Which test to take",
  detail: "The “Which test should you take?” cards near the top of the Test Preparation page.",
  titleField: "situation",
  fields: [
    {
      kind: "text",
      key: "situation",
      label: "The student's situation",
      placeholder: "You need a score fast",
      required: true,
    },
    {
      kind: "text",
      key: "answer",
      label: "Our answer",
      placeholder: "PTE or Duolingo",
      hint: "Shown as a small badge, so keep it to the test name or two.",
      required: true,
    },
    { kind: "textarea", key: "why", label: "Why", rows: 2, required: true },
  ],
  seed: chooser,
};

export const methodSpec: CollectionSpec<Method> = {
  id: "method",
  label: "How we teach",
  detail: "The numbered cards in the “How we teach” section of the Test Preparation page.",
  titleField: "title",
  fields: [
    {
      kind: "text",
      key: "title",
      label: "What you do",
      placeholder: "Batches capped at 12",
      required: true,
    },
    { kind: "textarea", key: "detail", label: "Why it matters", rows: 4, required: true },
  ],
  seed: method,
};

export const testFaqsSpec: CollectionSpec<TestFaq> = {
  id: "test-faqs",
  label: "Class questions",
  detail:
    "The questions at the bottom of the Test Preparation page. Also sent to Google, which sometimes shows them in search results.",
  titleField: "q",
  fields: [
    { kind: "text", key: "q", label: "Question", required: true },
    {
      kind: "textarea",
      key: "a",
      label: "Answer",
      rows: 5,
      required: true,
      hint: "Answer it the way a counsellor would on the phone. Vague answers put people off enrolling.",
    },
  ],
  seed: testFaqs,
};

/** The Test Preparation page's four lists, in the order /admin lists them. */
export const testPrepCollections: ErasedSpec[] = [examsSpec, chooserSpec, methodSpec, testFaqsSpec];
