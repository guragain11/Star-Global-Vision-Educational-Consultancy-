import type { ReactNode } from "react";

/** "Visa Guidance for 2026!" -> "visa-guidance-for-2026" */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Rounded-up minutes at 200 wpm, minimum 1. */
export function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

/** "2026-06-18" -> "18 June 2026". Falls back to the raw string if unparseable. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/** Today as "YYYY-MM-DD", for date input defaults. */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** First letter of each of the first two words, e.g. "Sujata Karki" -> "SK". */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const numberWords = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
  "twenty",
] as const;

/**
 * 14 -> "fourteen", falling back to digits above twenty.
 *
 * Headline copy like "fourteen destinations" has to track a count that staff can
 * now change from /admin, and spelled-out numbers read better in a sentence than
 * a numeral dropped mid-phrase.
 */
export function numberWord(value: number): string {
  if (!Number.isInteger(value) || value < 0) return String(value);
  return numberWords[value] ?? String(value);
}

/** "fourteen" -> "Fourteen", for a word that has to open a sentence. */
export function capitalise(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/* -------------------------------------------------------------------------- */
/* Postgres text[] columns <-> a textarea                                     */
/* -------------------------------------------------------------------------- */

/**
 * One item per line, blank lines dropped. Used by the admin editors for the
 * `text[]` columns, where a textarea is a plainer control than a repeater and
 * matches how staff already paste lists in.
 */
export function linesToArray(value: string): string[] {
  return value
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/** The inverse: an array back into textarea content. */
export function arrayToLines(value: readonly string[]): string {
  return value.join("\n");
}

/* -------------------------------------------------------------------------- */
/* Minimal markdown-ish renderer                                              */
/* -------------------------------------------------------------------------- */

type Block =
  { kind: "h2" | "h3" | "p" | "quote"; text: string } | { kind: "ul" | "ol"; items: string[] };

/**
 * Parses the small subset of markdown the admin editor supports:
 * `## h2`, `### h3`, `- item`, `1. item`, `> quote`, blank-line paragraphs,
 * plus inline `**bold**` and `*italic*`.
 *
 * Deliberately not a full markdown parser. Raw HTML is never interpreted,
 * so admin-authored content cannot inject markup.
 */
export function parseRichText(source: string): Block[] {
  const blocks: Block[] = [];
  const lines = source.replace(/\r\n/g, "\n").split("\n");

  let paragraph: string[] = [];
  let listKind: "ul" | "ol" | null = null;
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ kind: "p", text: paragraph.join(" ").trim() });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (listKind && listItems.length) {
      blocks.push({ kind: listKind, items: listItems });
    }
    listKind = null;
    listItems = [];
  };
  const flushAll = () => {
    flushParagraph();
    flushList();
  };
  const pushItem = (kind: "ul" | "ol", item: string) => {
    flushParagraph();
    if (listKind !== kind) flushList();
    listKind = kind;
    listItems.push(item);
  };

  for (const raw of lines) {
    const line = raw.trim();

    if (!line) {
      flushAll();
      continue;
    }

    const heading2 = /^##\s+(.*)$/.exec(line);
    const heading3 = /^###\s+(.*)$/.exec(line);
    const quote = /^>\s?(.*)$/.exec(line);
    const bullet = /^[-*]\s+(.*)$/.exec(line);
    const numbered = /^\d+[.)]\s+(.*)$/.exec(line);

    if (heading3) {
      flushAll();
      blocks.push({ kind: "h3", text: heading3[1] ?? "" });
    } else if (heading2) {
      flushAll();
      blocks.push({ kind: "h2", text: heading2[1] ?? "" });
    } else if (quote) {
      flushAll();
      blocks.push({ kind: "quote", text: quote[1] ?? "" });
    } else if (bullet) {
      pushItem("ul", bullet[1] ?? "");
    } else if (numbered) {
      pushItem("ol", numbered[1] ?? "");
    } else {
      flushList();
      paragraph.push(line);
    }
  }

  flushAll();
  return blocks;
}

/**
 * Splits a line into `**bold**` / `*italic*` runs. Returns plain strings and
 * marker-tagged segments the caller turns into elements.
 */
export function parseInline(
  text: string,
): Array<{ type: "text" | "bold" | "italic"; value: string }> {
  const out: Array<{ type: "text" | "bold" | "italic"; value: string }> = [];
  const pattern = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      out.push({ type: "text", value: text.slice(cursor, match.index) });
    }
    if (match[1] !== undefined) out.push({ type: "bold", value: match[1] });
    else out.push({ type: "italic", value: match[2] ?? "" });
    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) out.push({ type: "text", value: text.slice(cursor) });
  return out;
}

/** Plain-text preview used for meta descriptions and card excerpts. */
export function toPlainText(source: string, limit = 200): string {
  const text = source
    .replace(/\r\n/g, "\n")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/^\d+[.)]\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= limit) return text;
  return `${text.slice(0, limit).replace(/\s+\S*$/, "")}…`;
}

export type RichTextBlock = Block;
export type RichTextNode = ReactNode;
