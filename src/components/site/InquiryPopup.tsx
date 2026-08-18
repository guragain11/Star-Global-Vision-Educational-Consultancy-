import { useLocation } from "@tanstack/react-router";
import { Loader2, Send, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { getSupabase } from "@/lib/supabase";
import { useCountries } from "@/lib/use-countries";

/** Shared field treatment, so the five inputs cannot drift apart. */
const fieldClass =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm transition-colors duration-200 outline-none placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25";

/**
 * The home-page enquiry invitation.
 *
 * A real modal, not a floating panel: it takes focus on open, traps Tab inside
 * itself while it is up, closes on Escape and on a click outside, and returns
 * focus to whatever had it before. Those four behaviours are what separate a
 * dialog from something that merely covers the page — without them a keyboard
 * user tabs straight through into the page underneath and cannot get back out.
 *
 * Shown once per browser session and only on the home page. Re-appearing on
 * every visit is what makes a popup like this feel like an advert.
 */
const DISMISSED_KEY = "sgv-inquiry-seen";

export function InquiryPopup() {
  const location = useLocation();
  const countries = useCountries();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    destination: "",
    message: "",
  });

  const panel = useRef<HTMLDivElement>(null);
  const nameField = useRef<HTMLInputElement>(null);
  /** Whatever was focused before the dialog opened, to hand focus back to. */
  const restoreTo = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    try {
      sessionStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Private browsing can refuse sessionStorage. Not worth failing over.
    }
    restoreTo.current?.focus();
  }, []);

  useEffect(() => {
    if (location.pathname !== "/") return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(DISMISSED_KEY) === "1";
    } catch {
      // Treat an unreadable store as "not seen".
    }
    if (seen) return;

    const timer = setTimeout(() => setOpen(true), 2000);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Focus in, focus trapped, focus back out again.
  useEffect(() => {
    if (!open) return;

    restoreTo.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    // The first field rather than the panel: someone who opened a form wants to
    // start typing, and the heading is read out by the dialog label anyway.
    nameField.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;

      const node = panel.current;
      if (!node) return;

      // Queried per keypress rather than cached: the panel swaps its whole
      // contents for the thank-you state, so a cached list would go stale.
      const focusable = node.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    setBusy(true);
    try {
      const supabase = getSupabase();
      if (supabase) {
        await supabase.from("enquiries").insert({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          destination: form.destination,
          test: "",
          message: form.message.trim(),
        });
      }
      setSent(true);
      setTimeout(close, 2400);
    } catch {
      // Nothing useful to tell the visitor here: the office phone number is on
      // every page, and a failed insert should not turn into a scary dialog.
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="animate-in fade-in fixed inset-0 z-60 flex items-center justify-center p-4 duration-200"
      /* Scrim from the ink token rather than raw black, so it reads as the brand
         dimming the page in either theme instead of a grey wash. */
      style={{ backgroundColor: "color-mix(in oklab, var(--color-ink) 62%, transparent)" }}
    >
      {/* Click-outside. A sibling button rather than a handler on the scrim div,
          so it is a real control with a real label instead of a click target
          that only a mouse can find. */}
      <button
        type="button"
        aria-label="Close enquiry form"
        onClick={close}
        className="absolute inset-0 cursor-default"
      />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-title"
        className="animate-in zoom-in-95 slide-in-from-bottom-2 relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-float duration-300"
      >
        <button
          type="button"
          onClick={close}
          className="press absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>

        {sent ? (
          <div className="py-8 text-center">
            <div className="surface-sun mx-auto flex size-14 items-center justify-center rounded-full shadow-soft">
              <Send className="size-6" />
            </div>
            <h2 id="inquiry-title" className="mt-4 font-display text-xl font-bold">
              Thank you
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We have your enquiry. A counsellor will call you shortly.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5 text-center">
              <img src="/logo.png" alt="" className="mx-auto h-10 w-auto" />
              <h2 id="inquiry-title" className="mt-3 font-display text-xl font-bold">
                Free consultation
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Tell us your destination and we will map out the route.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Labelled by placeholder alone previously, which disappears the
                  moment you type. Real labels, visually hidden to keep the panel
                  compact. */}
              <label className="sr-only" htmlFor="inquiry-name">
                Full name
              </label>
              <input
                ref={nameField}
                id="inquiry-name"
                required
                placeholder="Full name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={fieldClass}
              />

              <label className="sr-only" htmlFor="inquiry-email">
                Email address
              </label>
              <input
                id="inquiry-email"
                type="email"
                placeholder="Email (optional)"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={fieldClass}
              />

              <label className="sr-only" htmlFor="inquiry-phone">
                Phone number
              </label>
              <input
                id="inquiry-phone"
                required
                type="tel"
                placeholder="Phone number *"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={fieldClass}
              />

              <label className="sr-only" htmlFor="inquiry-destination">
                Preferred destination
              </label>
              <select
                id="inquiry-destination"
                value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })}
                className={fieldClass}
              >
                <option value="">Preferred country</option>
                {countries.map((c) => (
                  <option key={c.slug}>{c.name}</option>
                ))}
              </select>

              <label className="sr-only" htmlFor="inquiry-message">
                Your message
              </label>
              <textarea
                id="inquiry-message"
                placeholder="Your message (optional)"
                rows={2}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className={`${fieldClass} resize-none`}
              />

              <button
                type="submit"
                disabled={busy}
                className="press inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:shadow-lift disabled:opacity-50"
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                {busy ? "Sending…" : "Get free advice"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
