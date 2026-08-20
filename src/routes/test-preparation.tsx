import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Gauge,
  Laptop,
  ListChecks,
  MonitorSmartphone,
  Target,
  Timer,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import { CtaBand, PageHero, SectionHeading, SiteLayout } from "@/components/site/Chrome";
import { Counter } from "@/components/site/Counter";
import { FaqList } from "@/components/site/Faq";
import { Reveal } from "@/components/site/Reveal";
import {
  chooserSpec,
  examsSpec,
  methodSpec,
  testFaqsSpec,
  type Method as TeachingNote,
} from "@/data/collections";
import { examAnchor, type Exam } from "@/data/exams";
import {
  testPrepChooser,
  testPrepCompare,
  testPrepCta,
  testPrepExams,
  testPrepFaqs,
  testPrepHero,
  testPrepMethod,
} from "@/data/page-copy";
import { capitalise, numberWord } from "@/lib/content-utils";
import { absoluteUrl, collectionFromMatches, faqJsonLd, settingsFromMatches } from "@/lib/seo";
import { useCollection, useCopy } from "@/lib/use-site-content";

export const Route = createFileRoute("/test-preparation")({
  head: ({ matches }) => {
    const settings = settingsFromMatches(matches);

    return {
      meta: [
        { title: `IELTS, PTE, Duolingo & JLPT Classes in Kathmandu | ${settings.name}` },
        {
          name: "description",
          content:
            "IELTS, PTE Academic, Duolingo English Test and JLPT Japanese classes in Bagbazar, Kathmandu. Full exam formats, score targets, weekly mock tests and batches capped at 12.",
        },
        { property: "og:title", content: `Test Preparation Classes | ${settings.name}` },
        {
          property: "og:description",
          content:
            "Every exam format explained, from sections and timing to score scales and the band you need, plus small-batch classes with weekly mocks.",
        },
        { property: "og:type", content: "article" },
        { property: "og:url", content: absoluteUrl("/test-preparation") },
      ],
      links: [{ rel: "canonical", href: absoluteUrl("/test-preparation") }],
      scripts: [
        {
          type: "application/ld+json",
          // The edited questions, not the built-in ones, so what Google is told
          // matches what the page shows.
          children: faqJsonLd(collectionFromMatches(matches, testFaqsSpec)),
        },
      ],
    };
  },
  component: TestPrep,
});

/* -------------------------------------------------------------------------- */
/* Scroll spy: highlights the exam you are currently reading                  */
/* -------------------------------------------------------------------------- */

function useScrollSpy(ids: readonly string[]): string {
  const key = ids.join(",");
  const [active, setActive] = useState("");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );

    for (const id of key.split(",")) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [key]);

  return active;
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

function TestPrep() {
  // Every list on this page is edited in /admin, and falls back to the
  // built-in exam reference data until someone does.
  const exams = useCollection(examsSpec);
  const chooser = useCollection(chooserSpec);
  const method = useCollection(methodSpec);
  const testFaqs = useCollection(testFaqsSpec);
  // Sanitised once here, then used for the nav, the scroll spy and the panel
  // ids, so the three can never disagree about what an anchor is called.
  const anchors = exams.map(examAnchor);
  const active = useScrollSpy(anchors);

  return (
    <SiteLayout>
      <PageHero {...useCopy(testPrepHero)} highlight={4}>
        <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
          {/* `to: null` on the two that are words rather than numbers, so the
              counter is skipped there instead of trying to animate "Weekly". */}
          {[
            { to: exams.length, text: "", label: "Exams taught in-house" },
            { to: 12, text: "", label: "Students per batch" },
            { to: null as number | null, text: "Weekly", label: "Full-length mocks" },
            { to: null as number | null, text: "Free", label: "Repeat until target" },
          ].map((s) => (
            <div key={s.label}>
              <dt className="font-display text-2xl font-bold text-ink-foreground md:text-3xl">
                {s.to === null ? s.text : <Counter to={s.to} />}
              </dt>
              <dd className="mt-1 text-xs text-ink-foreground/60">{s.label}</dd>
            </div>
          ))}
        </dl>
      </PageHero>

      {/* Sticky exam nav */}
      <div className="glass sticky top-18 z-30 border-b border-border">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex items-center gap-4 py-3">
            <span className="hidden shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground xl:block">
              Jump to
            </span>
            <div className="no-scrollbar -mx-1 flex flex-1 gap-1.5 overflow-x-auto px-1 py-0.5">
              {exams.map((e, i) => {
                const anchor = anchors[i] ?? "";
                const isActive = active === anchor;
                return (
                  <a
                    key={i}
                    href={`#${anchor}`}
                    aria-current={isActive ? "true" : undefined}
                    className={`press shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                    }`}
                  >
                    {e.shortName}
                  </a>
                );
              })}
              <a
                href="#compare"
                className="press shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
              >
                Compare
              </a>
              <a
                href="#method"
                className="press shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
              >
                How we teach
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Chooser: the question every student arrives with */}
      <section className="mx-auto max-w-6xl px-5 pt-16 md:pt-24">
        <SectionHeading {...useCopy(testPrepChooser)} />

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {chooser.map((c, i) => (
            <div
              key={i}
              className="card-lift gradient-border rounded-2xl border border-border bg-card p-6 shadow-soft [--lift:-0.1875rem]"
            >
              <p className="text-sm font-semibold leading-snug">{c.situation}</p>
              <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-foreground">
                {c.answer}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.why}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Exam detail: the long read, and the reason most students are on this page. */}
      <section className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <SectionHeading {...useCopy(testPrepExams)} />

        <div className="mt-12 space-y-8 md:space-y-12">
          {exams.map((exam, i) => (
            <ExamPanel key={i} exam={exam} index={i} anchor={anchors[i] ?? ""} />
          ))}
        </div>
      </section>

      <ComparisonTable exams={exams} />

      <Method notes={method} />

      {/* FAQ */}
      <section className="mx-auto max-w-6xl px-5 py-14 md:py-20">
        <SectionHeading {...useCopy(testPrepFaqs)} />

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <FaqList items={testFaqs} />

          <div className="gradient-border sticky top-36 rounded-3xl border border-border bg-secondary/50 p-8 shadow-soft">
            <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <ClipboardList className="size-5" />
            </span>
            <h3 className="mt-5 font-display text-lg font-semibold">
              Sit the free diagnostic first
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              A full timed mock, marked properly, with the band you would score today and a
              realistic date for the band you need. It takes an afternoon, it costs nothing, and it
              is the difference between a plan and a guess.
            </p>
            <ul className="mt-5 grid gap-2.5 text-sm">
              {[
                "Full four-skill paper under exam timing",
                "Marked against the official descriptors",
                "Written plan with a target date",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/contact"
              className="press mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:-translate-y-0.5 hover:shadow-lift"
            >
              Book a free diagnostic <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-4">
        <CtaBand
          {...useCopy(testPrepCta)}
          primary={{ to: "/contact", label: "Reserve a seat" }}
          secondary={{ to: "/success-stories", label: "See student results" }}
        />
      </section>
    </SiteLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* Exam panel                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Header tints, alternating brand and sun, applied by position.
 *
 * Derived from the panel's index rather than stored on the exam: this used to be
 * a raw Tailwind fragment on the record, which is the sort of thing that cannot
 * survive being edited in /admin. Reordering the exams or adding a fifth now
 * tints correctly without anybody touching a class name.
 */
const accents = ["from-primary/12", "from-accent/14", "from-primary/10", "from-accent/12"];

function ExamPanel({ exam, index, anchor }: { exam: Exam; index: number; anchor: string }) {
  const facts = [
    { icon: Timer, label: "Total time", value: exam.totalTime },
    { icon: Gauge, label: "Score scale", value: exam.scale },
    { icon: CalendarClock, label: "Results", value: exam.results },
    { icon: BadgeCheck, label: "Valid for", value: exam.validity },
  ];
  const accent = accents[index % accents.length];

  return (
    <Reveal as="article">
      <div
        id={anchor}
        className="scroll-mt-36 overflow-hidden rounded-4xl border border-border bg-card shadow-soft"
      >
        {/* Header band */}
        <div
          className={`relative overflow-hidden border-b border-border bg-linear-to-br ${accent} to-transparent px-7 py-8 md:px-10`}
        >
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-2xl">
              <p className="eyebrow">Exam {String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-3 font-display text-2xl font-bold md:text-3xl">{exam.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                {exam.tagline}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-semibold shadow-hair">
                <Timer className="size-3.5 text-accent" /> {exam.courseLength} course
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-semibold shadow-hair">
                <Users className="size-3.5 text-accent" /> {exam.batches}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
          {/* Sections */}
          <div className="border-border p-7 md:p-10 lg:border-r">
            <h4 className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <ListChecks className="size-4 text-primary" /> What the paper looks like
            </h4>

            <ol className="mt-6 grid gap-4">
              {exam.sections.map((s, si) => (
                <li
                  key={si}
                  className="group relative rounded-2xl border border-border bg-secondary/40 p-5 transition-colors hover:border-primary/30 hover:bg-secondary/70"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="inline-flex items-baseline gap-2.5 font-semibold">
                      <span className="font-display text-xs text-accent">
                        {String(si + 1).padStart(2, "0")}
                      </span>
                      {s.name}
                    </p>
                    <p className="text-xs font-medium text-primary">{s.time}</p>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.detail}</p>
                </li>
              ))}
            </ol>

            <dl className="mt-7 grid gap-4 sm:grid-cols-2">
              {facts.map((f) => (
                <div key={f.label} className="rounded-2xl bg-secondary/50 p-4">
                  <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <f.icon className="size-3.5 text-primary" /> {f.label}
                  </dt>
                  <dd className="mt-1.5 text-sm font-medium">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Targets + who it suits + our class */}
          <div className="flex flex-col gap-7 border-t border-border p-7 md:p-10 lg:border-t-0">
            <div>
              <h4 className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <Target className="size-4 text-primary" /> Scores you need
              </h4>
              <dl className="mt-5 grid gap-3">
                {exam.targets.map((t, ti) => (
                  <div
                    key={ti}
                    className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 border-b border-border/70 pb-3 last:border-0 last:pb-0"
                  >
                    <dt className="text-sm text-muted-foreground">{t.label}</dt>
                    <dd className="text-sm font-semibold text-primary">{t.score}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-2xl bg-primary-soft/60 p-5">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <MonitorSmartphone className="size-3.5" /> Best for
              </p>
              <p className="mt-2 text-sm leading-relaxed text-secondary-foreground">
                {exam.bestFor}
              </p>
              <p className="mt-4 inline-flex items-start gap-2 text-xs text-muted-foreground">
                <Laptop className="mt-0.5 size-3.5 shrink-0 text-accent" />
                {exam.delivery}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                In our class
              </h4>
              <ul className="mt-4 grid gap-2.5">
                {exam.classNotes.map((n, ni) => (
                  <li key={ni} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" />
                    {n}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to="/contact"
              className="press mt-auto inline-flex items-center justify-center gap-2 self-start rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:-translate-y-0.5 hover:shadow-lift"
            >
              Join the {exam.shortName} batch <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* -------------------------------------------------------------------------- */
/* Comparison table                                                           */
/* -------------------------------------------------------------------------- */

function ComparisonTable({ exams }: { exams: Exam[] }) {
  return (
    <section
      id="compare"
      className="scroll-mt-36 border-y border-border bg-secondary/40 py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          {...useCopy(testPrepCompare, {
            title: `${capitalise(numberWord(exams.length))} exams on one screen`,
          })}
        />

        <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-3xl border-collapse text-left text-sm">
              <caption className="sr-only">
                Comparison of {exams.map((e) => e.shortName).join(", ")} by format, duration, score
                scale, result turnaround and course length
              </caption>
              <thead>
                <tr className="border-b border-border bg-secondary/60">
                  {["Exam", "Format", "Length", "Score scale", "Results", "Our course"].map((h) => (
                    <th key={h} scope="col" className="px-6 py-4 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exams.map((e, i) => (
                  <tr
                    key={i}
                    className="border-b border-border/70 transition-colors last:border-0 hover:bg-secondary/40"
                  >
                    <th scope="row" className="px-6 py-4 align-top font-medium">
                      <a href={`#${examAnchor(e, i)}`} className="link-sweep text-primary">
                        {e.shortName}
                      </a>
                    </th>
                    <td className="px-6 py-4 align-top text-muted-foreground">{e.format}</td>
                    <td className="px-6 py-4 align-top text-muted-foreground">{e.totalTime}</td>
                    <td className="px-6 py-4 align-top text-muted-foreground">{e.scale}</td>
                    <td className="px-6 py-4 align-top text-muted-foreground">{e.results}</td>
                    <td className="px-6 py-4 align-top text-muted-foreground">{e.courseLength}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          Exam boards change formats and fees without much notice. Pearson revised the PTE Academic
          pattern in August 2025 and Duolingo replaced two of its speaking tasks. We confirm the
          current format, fee and university requirement for your intake before you register.
        </p>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Method                                                                     */
/* -------------------------------------------------------------------------- */

function Method({ notes }: { notes: TeachingNote[] }) {
  return (
    <section id="method" className="mx-auto max-w-5xl scroll-mt-36 px-5 py-16 md:py-24">
      <SectionHeading
        {...useCopy(testPrepMethod, {
          title: `${capitalise(numberWord(notes.length))} things we do that a cram school does not`,
        })}
      />

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((m, i) => (
          <div
            key={m.title}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-hair"
          >
            <span className="pointer-events-none absolute -right-2 -top-4 font-display text-7xl font-bold text-primary/5 transition-colors group-hover:text-primary/10">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="relative text-lg font-semibold">{m.title}</h3>
            <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">
              {m.detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
