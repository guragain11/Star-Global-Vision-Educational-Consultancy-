import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Facebook,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  TriangleAlert,
} from "lucide-react";
import { useState } from "react";

import { PageHero, SiteLayout } from "@/components/site/Chrome";
import { testsSpec, visitNotesSpec } from "@/data/collections";
import { contactForm, contactHero, contactWhatsapp } from "@/data/page-copy";
import { sitePhones, telHref } from "@/data/site";
import { submitEnquiry } from "@/lib/content-api";
import { absoluteUrl, defaultOgImage, settingsFromMatches } from "@/lib/seo";
import { useCountries } from "@/lib/use-countries";
import { useCollection, useCopy, useSettings } from "@/lib/use-site-content";

export const Route = createFileRoute("/contact")({
  head: ({ matches }) => {
    const settings = settingsFromMatches(matches);
    const phones = sitePhones(settings);

    return {
      meta: [
        { title: `Contact ${settings.name}, ${settings.address}` },
        {
          name: "description",
          content: `Visit ${settings.legal_name} at ${settings.address}. Call ${
            phones[0] ?? settings.email
          } or email ${settings.email} for free counselling.`,
        },
        { property: "og:title", content: `Contact ${settings.legal_name}` },
        {
          property: "og:description",
          content:
            "Free study abroad counselling in Bagbazar, Kathmandu. Phone, email and office hours.",
        },
        { property: "og:type", content: "article" },
        { property: "og:url", content: absoluteUrl("/contact") },
      ],
      links: [{ rel: "canonical", href: absoluteUrl("/contact") }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: settings.legal_name,
            url: absoluteUrl("/contact"),
            image: defaultOgImage,
            email: settings.email,
            telephone: phones,
            sameAs: settings.facebook ? [settings.facebook] : [],
            address: {
              "@type": "PostalAddress",
              streetAddress: "Bagbazar-28",
              addressLocality: "Kathmandu",
              addressCountry: "NP",
            },
            openingHoursSpecification: [
              {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                opens: "07:00",
                closes: "18:00",
              },
            ],
          }),
        },
      ],
    };
  },
  component: Contact,
});

function Contact() {
  const settings = useSettings();
  const phones = sitePhones(settings);
  const visitNotes = useCollection(visitNotesSpec);
  // Read up here rather than at the call site, because the card it belongs to
  // only renders when a WhatsApp number is set, and a hook inside a conditional
  // would run in a different order the moment somebody clears that field.
  const whatsapp = useCopy(contactWhatsapp);
  // The Facebook card shows the URL without its scheme, which is how people read
  // a page name back to you.
  const facebookLabel = settings.facebook.replace(/^https?:\/\//, "").replace(/\/+$/, "");

  return (
    <SiteLayout>
      <PageHero {...useCopy(contactHero)} highlight={3} />

      {/*
        Nothing on this page animates in. It is a page people arrive at with a
        phone in their hand, and the address, the number and the form should be
        readable the instant it paints.
      */}
      <section className="mx-auto max-w-6xl px-5 py-14 md:py-20">
        <div className="grid gap-8 md:grid-cols-[1fr_1.1fr]">
          <div className="space-y-3">
            <InfoCard icon={<MapPin className="size-5 text-primary" />} title="Office">
              {settings.address}
            </InfoCard>
            {phones.length > 0 && (
              <InfoCard icon={<Phone className="size-5 text-primary" />} title="Phone">
                <div className="flex flex-col gap-1">
                  {phones.map((p) => (
                    <a key={p} href={telHref(p)} className="link-sweep w-fit hover:text-primary">
                      {p}
                    </a>
                  ))}
                </div>
              </InfoCard>
            )}
            {settings.email && (
              <InfoCard icon={<Mail className="size-5 text-primary" />} title="Email">
                <a
                  href={`mailto:${settings.email}`}
                  className="link-sweep w-fit hover:text-primary"
                >
                  {settings.email}
                </a>
              </InfoCard>
            )}
            {settings.facebook && (
              <InfoCard icon={<Facebook className="size-5 text-primary" />} title="Facebook">
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="link-sweep w-fit hover:text-primary"
                >
                  {facebookLabel}
                </a>
              </InfoCard>
            )}
            <InfoCard icon={<Clock className="size-5 text-primary" />} title="Office hours">
              {settings.hours}
            </InfoCard>

            {/* The one loud element in this column, so it reads as the shortcut it is. */}
            {settings.whatsapp && (
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="surface-brand press flex items-center gap-4 rounded-2xl p-6 shadow-soft hover:-translate-y-0.5 hover:shadow-lift"
              >
                <MessageCircle className="size-6 shrink-0 text-accent" />
                <span>
                  <span className="block text-sm font-semibold text-ink-foreground">
                    {whatsapp.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-foreground/70">
                    {whatsapp.intro}
                  </span>
                </span>
              </a>
            )}
          </div>

          <div className="h-fit">
            <EnquiryForm />
          </div>
        </div>

        {/* Visiting details: the practical bits people ask on the phone */}
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {visitNotes.map((note) => (
            <div
              key={note.title}
              className="rounded-xl border border-border bg-card p-6 shadow-hair"
            >
              <h2 className="font-semibold">{note.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{note.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-border shadow-hair">
          <iframe
            title={`${settings.name} office location`}
            src={`https://www.google.com/maps?q=${encodeURIComponent(settings.map_query)}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-80 w-full border-0"
          />
        </div>
      </section>
    </SiteLayout>
  );
}

/** One shared input treatment so every control on the form matches. */
const fieldClass =
  "rounded-xl border border-input bg-background px-4 py-2.5 text-sm shadow-hair outline-none transition-[border-color,box-shadow] duration-300 hover:border-primary/30 focus:border-primary/50 focus:ring-2 focus:ring-ring/40";

/* -------------------------------------------------------------------------- */
/* Enquiry form                                                               */
/* -------------------------------------------------------------------------- */

/**
 * A blank form. Takes the default destination as an argument because the country
 * list now comes from the database through the root loader, so it is only known
 * once the component renders.
 */
const emptyEnquiry = (destination: string) => ({
  name: "",
  phone: "",
  email: "",
  destination,
  test: "Not required",
  message: "",
});

type EnquiryValues = ReturnType<typeof emptyEnquiry>;

/**
 * Writes straight into the `enquiries` table, which staff read from /admin.
 *
 * The field limits match the CHECK constraints in supabase/schema.sql so a
 * long message is caught here with a sentence a person can act on, rather than
 * coming back as a database error.
 */
function EnquiryForm() {
  const countries = useCountries();
  const settings = useSettings();
  // The class list the "which test?" dropdown offers, edited in /admin.
  const tests = useCollection(testsSpec);
  // Read before the `sent` branch below, which returns early: a hook after that
  // return would be skipped on the render where somebody has just submitted.
  const heading = useCopy(contactForm);
  // The fallback the visitor is offered when the form itself cannot be submitted:
  // the mobile if there is one, otherwise whichever number is set.
  const fallbackPhones = sitePhones(settings);
  const fallbackPhone = fallbackPhones[1] ?? fallbackPhones[0] ?? "";
  const blank = emptyEnquiry(countries[0]?.name ?? "Australia");
  const [values, setValues] = useState(blank);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (key: keyof EnquiryValues, value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const name = values.name.trim();
    const phone = values.phone.trim();
    const email = values.email.trim();
    const message = values.message.trim();

    if (!name) return setError("Please tell us your name.");
    if (name.length > 120) return setError("That name is too long.");
    if (!phone) return setError("Please add a phone number so a counsellor can reach you.");
    if (phone.length > 40) return setError("That phone number is too long.");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return setError("That email address does not look right. Correct it, or leave it blank.");
    }
    if (email.length > 160) return setError("That email address is too long.");
    if (message.length > 4000) return setError("Please shorten your message a little.");

    setBusy(true);
    try {
      await submitEnquiry({
        name,
        phone,
        email,
        destination: values.destination,
        test: values.test,
        message,
      });
      setSent(true);
      setValues(blank);
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message} You can also call ${fallbackPhone} or email ${settings.email}.`
          : "Something went wrong. Please call us instead.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="gradient-border rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <CheckCircle2 className="size-7" />
        </span>
        <h2 className="mt-5 font-display text-2xl font-bold">Enquiry received</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          A counsellor will call you back, usually the same working day. If it is urgent, phone{" "}
          <a href={telHref(fallbackPhone)} className="font-medium text-primary">
            {fallbackPhone}
          </a>{" "}
          or drop into the Bagbazar office.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="press mt-7 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-primary"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="gradient-border rounded-3xl border border-border bg-card p-8 shadow-soft"
    >
      <h2 className="font-display text-2xl font-bold">{heading.title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{heading.intro}</p>

      <div className="mt-6 grid gap-4">
        <Field
          label="Full name"
          name="name"
          value={values.name}
          onChange={(v) => set("name", v)}
          placeholder="Your name"
          autoComplete="name"
          required
        />
        <Field
          label="Phone"
          name="phone"
          type="tel"
          value={values.phone}
          onChange={(v) => set("phone", v)}
          placeholder="98XXXXXXXX"
          autoComplete="tel"
          required
        />
        <Field
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={(v) => set("email", v)}
          placeholder="you@example.com"
          autoComplete="email"
        />

        <label className="grid gap-1.5 text-sm font-medium">
          Interested destination
          <select
            name="destination"
            value={values.destination}
            onChange={(e) => set("destination", e.target.value)}
            className={fieldClass}
          >
            {countries.map((c) => (
              <option key={c.slug}>{c.name}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-sm font-medium">
          Test preparation
          <select
            name="test"
            value={values.test}
            onChange={(e) => set("test", e.target.value)}
            className={fieldClass}
          >
            <option>Not required</option>
            {tests.map((t) => (
              <option key={t.name}>{t.name}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5 text-sm font-medium">
          Message
          <textarea
            name="message"
            rows={4}
            value={values.message}
            onChange={(e) => set("message", e.target.value)}
            placeholder="Your academic background and questions"
            className={fieldClass}
          />
        </label>

        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="surface-brand press mt-2 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-soft hover:-translate-y-0.5 hover:shadow-lift disabled:cursor-not-allowed disabled:opacity-70"
        >
          {busy ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Sending…
            </>
          ) : (
            <>
              Send enquiry <ArrowRight className="size-4" />
            </>
          )}
        </button>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Your details go straight to our counselling team and are never shared with anyone else.
          Prefer to talk? Call {fallbackPhone} or email{" "}
          <a
            href={`mailto:${settings.email}`}
            className="font-medium text-primary underline underline-offset-2"
          >
            {settings.email}
          </a>
          .
        </p>
      </div>
    </form>
  );
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card-lift flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-hair [--lift:-0.125rem]">
      <div className="mt-0.5">{icon}</div>
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h2>
        <div className="mt-1 text-sm font-medium">{children}</div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      <span>
        {label}
        {required && (
          <span className="ml-1 text-accent" aria-hidden="true">
            *
          </span>
        )}
      </span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className={fieldClass}
      />
    </label>
  );
}
