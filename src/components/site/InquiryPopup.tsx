import { useState, useEffect } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { useLocation } from "@tanstack/react-router";

export function InquiryPopup() {
  const location = useLocation();
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

  useEffect(() => {
    if (location.pathname !== "/") return;
    const timer = setTimeout(() => setOpen(true), 2000);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const close = () => {
    setOpen(false);
  };

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
      setTimeout(close, 2000);
    } catch {
      // silently fail
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl bg-card p-6 shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={close}
          className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>

        {sent ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
              <Send className="size-6 text-primary" />
            </div>
            <h2 className="mt-4 font-display text-xl font-bold">Thank You!</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We've received your enquiry. Our team will contact you shortly.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5 text-center">
              <img
                src="/logo.png"
                alt="Star Global Vision"
                className="mx-auto h-10 w-auto"
              />
              <h2 className="mt-3 font-display text-xl font-bold text-foreground">
                Free Consultation
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Tell us your dream destination and we'll guide you there.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                required
                placeholder="Full Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
              <input
                placeholder="Email (optional)"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
              <input
                required
                placeholder="Phone Number *"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
              <select
                value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              >
                <option value="">Preferred Country</option>
                <option>Australia</option>
                <option>USA</option>
                <option>Canada</option>
                <option>UK</option>
                <option>New Zealand</option>
                <option>Europe</option>
                <option>Japan</option>
              </select>
              <textarea
                placeholder="Your message (optional)"
                rows={2}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
              <button
                type="submit"
                disabled={busy}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-50"
              >
                {busy ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                {busy ? "Sending..." : "Get Free Advice"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
