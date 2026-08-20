import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  Check,
  Clipboard,
  ImagePlus,
  Link2,
  Loader2,
  LogIn,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import schemaSql from "../../../supabase/remaining-tables.sql?raw";
import {
  ACCEPT_ATTRIBUTE,
  MAX_UPLOAD_BYTES,
  formatBytes,
  uploadImage,
  validateImage,
  type MediaFolder,
} from "@/lib/storage";
import { getSupabase, sqlEditorUrl } from "@/lib/supabase";
import { useSettings } from "@/lib/use-site-content";

const logo = "/logo.png";

/* -------------------------------------------------------------------------- */
/* Form primitives                                                            */
/* -------------------------------------------------------------------------- */

const fieldClass =
  "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-ring/30";

/**
 * The remaining-characters line under a length-limited field.
 *
 * Only appears once the value is most of the way to the limit. Shown from the
 * first keystroke it would read as a demand for a certain length, which is not
 * what the limit is for — several of these columns cap at 80 or 200 characters
 * because that is what the design holds, and the whole point is that staff never
 * meet the cap. When they do get close, a Postgres check constraint is waiting,
 * so a count here is the difference between "3 characters left" and a raw
 * `violates check constraint` after they press Save.
 */
function CharCount({ value, max }: { value: string; max: number }) {
  const left = max - value.length;
  if (left > Math.min(24, Math.floor(max / 4))) return null;
  return (
    <span
      className={`text-xs ${left < 0 ? "font-medium text-destructive" : "text-muted-foreground"}`}
    >
      {left < 0 ? `${-left} character${left === -1 ? "" : "s"} too many` : `${left} left`}
    </span>
  );
}

export function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  hint,
  max,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  max?: number;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        /* maxLength stops typing at the cap but not pasting past it in every
           browser, which is why CharCount below counts down rather than
           trusting it. */
        {...(max === undefined ? {} : { maxLength: max })}
        onChange={(e) => onChange(e.target.value)}
        className={fieldClass}
      />
      <span className="flex flex-wrap items-baseline justify-between gap-x-3">
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
        {max !== undefined && <CharCount value={value} max={max} />}
      </span>
    </label>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
  required = false,
  hint,
  max,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  max?: number;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </span>
      <textarea
        value={value}
        rows={rows}
        required={required}
        placeholder={placeholder}
        {...(max === undefined ? {} : { maxLength: max })}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldClass} resize-y font-sans leading-relaxed`}
      />
      <span className="flex flex-wrap items-baseline justify-between gap-x-3">
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
        {max !== undefined && <CharCount value={value} max={max} />}
      </span>
    </label>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={fieldClass}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ToggleField({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-secondary/40 p-4">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 accent-[var(--color-primary)]"
      />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>}
      </span>
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/* Image upload                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Image picker for cover photos and student portraits.
 *
 * Accepts a drop, a file picker or a pasted URL, and stores the resulting
 * public URL on the record. Uploading is deliberately immediate rather than
 * deferred to save: the admin sees the real image in place before committing,
 * and a failed upload never leaves a half-saved post behind.
 *
 * Storage cleanup is not done here. Removing the field only clears the value,
 * so cancelling the form cannot break a photo that is still live on the site.
 * The editors delete the replaced object once a save actually succeeds.
 */
export function ImageField({
  label,
  value,
  onChange,
  folder,
  hint,
  aspect = "video",
}: {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  folder: MediaFolder;
  hint?: string;
  aspect?: "video" | "square";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const [broken, setBroken] = useState(false);

  // A new value from outside (switching records) invalidates the load failure.
  useEffect(() => setBroken(false), [value]);

  const send = async (file: File) => {
    setError(null);
    const invalid = validateImage(file);
    if (invalid) return setError(invalid);

    setBusy(true);
    try {
      onChange(await uploadImage(file, folder));
    } catch (err) {
      setError(err instanceof Error ? err.message : "The upload failed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void send(file);
  };

  const commitUrl = () => {
    const next = urlDraft.trim();
    setError(null);
    if (!next) return setUrlMode(false);
    if (!/^https?:\/\//i.test(next)) {
      return setError("Enter a full URL starting with http:// or https://");
    }
    onChange(next);
    setUrlDraft("");
    setUrlMode(false);
  };

  const frame = aspect === "square" ? "aspect-square max-w-56" : "aspect-video";

  return (
    <div className="grid gap-1.5">
      <span className="text-sm font-medium">{label}</span>

      {value ? (
        <div className="grid gap-3">
          <div
            className={`relative overflow-hidden rounded-2xl border border-border bg-secondary/50 ${frame}`}
          >
            {broken ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
                <AlertCircle className="size-5 text-destructive" />
                <span className="text-xs text-muted-foreground">
                  This image will not load. Check the URL or upload a file instead.
                </span>
              </div>
            ) : (
              <img
                src={value}
                alt=""
                onError={() => setBroken(true)}
                className="size-full object-cover"
              />
            )}
            {busy && (
              <div className="absolute inset-0 grid place-items-center bg-ink/55 backdrop-blur-sm">
                <Loader2 className="size-6 animate-spin text-ink-foreground" />
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-60"
            >
              <Upload className="size-3.5" /> Replace
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setError(null);
              }}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 px-4 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
            >
              <Trash2 className="size-3.5" /> Remove
            </button>
            <span className="truncate text-xs text-muted-foreground">{value}</span>
          </div>
        </div>
      ) : urlMode ? (
        <div className="flex flex-wrap gap-2">
          <input
            type="url"
            value={urlDraft}
            autoFocus
            placeholder="https://images.example.com/photo.jpg"
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitUrl();
              }
            }}
            className={`${fieldClass} flex-1`}
          />
          <button
            type="button"
            onClick={commitUrl}
            className="surface-brand rounded-full px-5 py-2 text-xs font-semibold"
          >
            Use URL
          </button>
          <button
            type="button"
            onClick={() => {
              setUrlMode(false);
              setUrlDraft("");
              setError(null);
            }}
            className="rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`rounded-2xl border border-dashed px-6 py-8 text-center transition-colors ${
            dragging ? "border-primary bg-primary-soft" : "border-border bg-secondary/40"
          }`}
        >
          {busy ? (
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Uploading…
            </span>
          ) : (
            <>
              <span className="mx-auto mb-3 inline-flex size-11 items-center justify-center rounded-2xl bg-card text-primary shadow-hair">
                <ImagePlus className="size-5" />
              </span>
              <p className="text-sm font-medium">Drag an image here</p>
              <p className="mt-1 text-xs text-muted-foreground">
                JPG, PNG, WebP, AVIF or GIF, up to {formatBytes(MAX_UPLOAD_BYTES)}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Upload className="size-3.5" /> Choose a file
                </button>
                <button
                  type="button"
                  onClick={() => setUrlMode(true)}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  <Link2 className="size-3.5" /> Paste a URL
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          // Reset so picking the same file twice still fires a change event.
          e.target.value = "";
          if (file) void send(file);
        }}
      />

      {error && <span className="text-xs font-medium text-destructive">{error}</span>}
      {hint && !error && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Shells                                                                     */
/* -------------------------------------------------------------------------- */

/** Centered card used by the login screen and the setup notice. */
export function AdminShell({ children }: { children: ReactNode }) {
  const { name } = useSettings();

  return (
    <div className="flex min-h-screen flex-col bg-secondary/40">
      <div className="surface-brand grid-glow">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-5">
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
          <Link
            to="/"
            className="text-sm text-ink-foreground/75 transition-colors hover:text-ink-foreground"
          >
            View site
          </Link>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center px-5 py-16">{children}</div>
    </div>
  );
}

/** Inline banner for errors and successes. */
export function Notice({
  tone,
  children,
}: {
  tone: "error" | "success" | "info";
  children: ReactNode;
}) {
  const styles = {
    error: "border-destructive/30 bg-destructive/10 text-destructive",
    success: "border-primary/30 bg-primary-soft text-primary",
    info: "border-border bg-secondary text-muted-foreground",
  }[tone];

  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${styles}`}
      role="status"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* List furniture                                                             */
/* -------------------------------------------------------------------------- */

/** Live/Draft badge. Shared by every list in /admin. */
export function StatusPill({ published }: { published: boolean }) {
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

/** Placeholder rows while a list loads. */
export function RowSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl border border-border bg-card" />
      ))}
    </div>
  );
}

/** Dashed panel shown when a list has nothing in it. */
export function EmptyRow({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Login                                                                      */
/* -------------------------------------------------------------------------- */

export function LoginCard({
  onSignIn,
}: {
  onSignIn: (email: string, password: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { name } = useSettings();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onSignIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-lift"
    >
      <h1 className="font-display text-2xl font-bold">Staff sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Manage blog posts and success stories for {name}.
      </p>

      <div className="mt-7 grid gap-4">
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="admin@starglobalvision.com"
          required
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          required
        />

        {error && <Notice tone="error">{error}</Notice>}

        <button
          type="submit"
          disabled={busy}
          className="surface-brand mt-1 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-soft transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* Setup instructions when a table has not been created yet                    */
/* -------------------------------------------------------------------------- */

/**
 * Shown in place of an error when one of the content tables is missing.
 *
 * This is a setup step, not a fault: `supabase/schema.sql` lives in the repo and
 * nothing applies it automatically, so the tables exist in git and nowhere else
 * until somebody runs the file. PostgREST's own wording for this — "Could not
 * find the table in the schema cache" — sends people hunting for a caching bug,
 * so the instructions replace it rather than sit underneath it.
 *
 * The public website is unaffected while this shows: every public read falls back
 * to the built-in content, so visitors see the site as normal.
 */
export function MissingTableNotice({ table }: { table: string }) {
  const [copied, setCopied] = useState(false);
  const [polling, setPolling] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  const handleSetup = async () => {
    try {
      await navigator.clipboard.writeText(schemaSql);
      setCopied(true);
      setPolling(true);
    } catch {
      setCopied(false);
    }
    if (sqlEditorUrl) window.open(sqlEditorUrl, "_blank");
  };

  useEffect(() => {
    if (!polling) return;
    const id = setInterval(async () => {
      setPollCount((c) => c + 1);
      const supabase = getSupabase();
      if (!supabase) return;
      try {
        const { error } = await supabase
          .from(table as "site_content" | "page_sections")
          .select("id")
          .limit(1);
        if (!error) {
          clearInterval(id);
          window.location.reload();
        }
      } catch {
        /* table still missing — keep polling */
      }
    }, 2500);
    return () => clearInterval(id);
  }, [polling, table]);

  return (
    <div className="rounded-3xl border border-dashed border-accent/50 bg-card px-6 py-10 md:px-10">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
        One-time setup
      </p>
      <h2 className="mt-3 font-display text-xl font-bold md:text-2xl">
        This part of the database has not been created yet
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        The <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">{table}</code> table is
        missing, so there is nothing here to edit yet. Your public website is running normally on
        its built-in content — visitors see no difference, and nothing has been lost.
      </p>

      <div className="mt-7">
        <button
          onClick={handleSetup}
          disabled={polling}
          className="surface-brand press inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-soft hover:-translate-y-0.5 hover:shadow-lift disabled:cursor-not-allowed disabled:opacity-60"
        >
          {polling ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Waiting for tables…
            </>
          ) : copied ? (
            <>
              <Check className="size-4" /> SQL copied — paste it &amp; click Run
            </>
          ) : (
            <>
              <Clipboard className="size-4" /> Copy SQL &amp; Open Editor
            </>
          )}
        </button>
        {polling && (
          <p className="mt-3 max-w-2xl text-xs text-muted-foreground">
            {pollCount < 4
              ? "Watching for the table — paste the SQL into the editor and click Run."
              : "Still waiting — make sure you pressed Run in the SQL editor. This will auto-refresh once the table exists."}
          </p>
        )}
        {!polling && (
          <ol className="mt-7 grid max-w-2xl gap-4 text-sm leading-relaxed">
            <li className="flex gap-3">
              <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                1
              </span>
              <span>
                Click the button above — the SQL for the missing tables is copied to your clipboard
                and the Supabase SQL editor opens in a new tab.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                2
              </span>
              <span>
                Paste (<kbd className="rounded bg-secondary px-1.5 py-0.5 text-xs">Ctrl+V</kbd>) into
                the editor and press <strong>Run</strong>. It is safe to run on a database that already
                has content — existing tables and rows are left alone.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                3
              </span>
              <span>
                Come back here — this page will auto-refresh once the table is detected. Then use{" "}
                <strong>Import all lists</strong> to copy the website's current wording in, ready to
                edit.
              </span>
            </li>
          </ol>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Setup instructions when Supabase env vars are missing                      */
/* -------------------------------------------------------------------------- */

export function SetupNotice() {
  return (
    <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-8 shadow-lift md:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
        One-time setup
      </p>
      <h1 className="mt-3 font-display text-2xl font-bold md:text-3xl">
        Connect Supabase to enable /admin
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        The public website is running normally on its built-in starter content. To edit blog posts
        and success stories from this page, connect a free Supabase project. It takes about five
        minutes.
      </p>

      <ol className="mt-7 grid gap-5">
        {[
          {
            title: "Create a project",
            body: (
              <>
                Sign up at{" "}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-primary underline underline-offset-2"
                >
                  supabase.com
                </a>{" "}
                and create a new project. Any region near Nepal (Singapore or Mumbai) works well.
              </>
            ),
          },
          {
            title: "Run the schema",
            body: (
              <>
                Open <strong>SQL Editor → New query</strong>, paste the contents of{" "}
                <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">
                  supabase/schema.sql
                </code>{" "}
                from this project, and run it. This creates both tables with the right security
                rules.
              </>
            ),
          },
          {
            title: "Create your admin user",
            body: (
              <>
                Go to <strong>Authentication → Users → Add user</strong>, enter your email and a
                strong password, and tick <em>Auto Confirm User</em>. Then under{" "}
                <strong>Authentication → Providers → Email</strong>, turn off <em>Enable signup</em>{" "}
                so nobody else can register.
              </>
            ),
          },
          {
            title: "Add the keys",
            body: (
              <>
                Copy the Project URL and anon key from <strong>Project Settings → API</strong> into
                a <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">.env</code> file at
                the project root:
                <pre className="mt-2 overflow-x-auto rounded-xl bg-ink p-4 text-xs leading-relaxed text-ink-foreground">
                  {`VITE_SUPABASE_URL=https://xxxx.supabase.co\nVITE_SUPABASE_ANON_KEY=eyJhbGci...`}
                </pre>
                Restart the dev server afterwards, then reload this page.
              </>
            ),
          },
        ].map((step, i) => (
          <li key={step.title} className="flex gap-4">
            <span className="surface-sun flex size-8 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold">
              {i + 1}
            </span>
            <div>
              <h2 className="text-sm font-semibold">{step.title}</h2>
              <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</div>
            </div>
          </li>
        ))}
      </ol>

      <Notice tone="info">
        Until this is done, the blog and success stories pages show the starter articles bundled in{" "}
        <code className="text-xs">src/data/content.ts</code>, which you can also edit directly in
        code.
      </Notice>
    </div>
  );
}
