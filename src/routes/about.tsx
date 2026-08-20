import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Mail, Phone, Quote } from "lucide-react";

import { CtaBand, PageHero, SectionHeading, SiteLayout } from "@/components/site/Chrome";
import { Counter } from "@/components/site/Counter";
import { Reveal } from "@/components/site/Reveal";
import { advantageIcon } from "@/components/site/advantage-icons";
import {
  advantagesSpec,
  processStepsSpec,
  servicesSpec,
  testimonialsSpec,
} from "@/data/collections";
import {
  aboutAdvantages,
  aboutApproval,
  aboutCta,
  aboutHero,
  aboutMission,
  aboutProcess,
  aboutServices,
  aboutTeam,
  aboutTestimonials,
} from "@/data/page-copy";
import { fetchTeamMembers } from "@/lib/content-api";
import { initials } from "@/lib/content-utils";
import { absoluteUrl, breadcrumbJsonLd, settingsFromMatches } from "@/lib/seo";
import { useStats } from "@/lib/use-countries";
import { useCollection, useCopy, useSettings } from "@/lib/use-site-content";

export const Route = createFileRoute("/about")({
  head: ({ matches }) => {
    const settings = settingsFromMatches(matches);

    /*
      The accreditation is quoted rather than paraphrased. This sentence used to
      read "is a Ministry of Social Development approved study abroad
      consultancy", which baked the ministry's name into the grammar — so
      changing the approval line in /admin left this page's search description
      still claiming the old accreditation, the one thing on the page that must
      not be wrong.

      Free text, so the trailing full stop is trimmed before one is added, and an
      empty field drops the sentence rather than leaving a stray ".".
    */
    const approval = settings.approval.trim().replace(/\.\s*$/, "");
    const summary = `${settings.legal_name} is a study abroad consultancy in ${settings.address}.`;
    const description = approval ? `${summary} ${approval}.` : summary;

    return {
      meta: [
        { title: `About ${settings.legal_name}, Bagbazar Kathmandu` },
        {
          name: "description",
          content: description,
        },
        { property: "og:title", content: `About ${settings.legal_name}` },
        {
          property: "og:description",
          content:
            "Our mission, our services and the students we have guided to world-ranked universities.",
        },
        { property: "og:type", content: "article" },
        { property: "og:url", content: absoluteUrl("/about") },
      ],
      links: [{ rel: "canonical", href: absoluteUrl("/about") }],
      scripts: [
        {
          type: "application/ld+json",
          children: breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "About", url: "/about" },
          ]),
        },
      ],
    };
  },
  loader: async () => {
    const teamMembers = await fetchTeamMembers();
    return { teamMembers };
  },
  component: About,
});

function About() {
  const { teamMembers } = Route.useLoaderData();
  const settings = useSettings();
  const headlineStats = useStats();
  // Edited in /admin, falling back to the built-in lists.
  const services = useCollection(servicesSpec);
  const processSteps = useCollection(processStepsSpec);
  const advantages = useCollection(advantagesSpec);
  const testimonials = useCollection(testimonialsSpec);
  // Read up here rather than at the call site, because the team section only
  // renders when there is a team, and a hook inside a conditional would run in
  // a different order once somebody adds the first member.
  const teamHeading = useCopy(aboutTeam);

  return (
    <SiteLayout>
      <PageHero {...useCopy(aboutHero)} highlight={2} />

      {/*
        No scroll reveals on this page. It is the page a parent reads carefully,
        and content that animates in as you scroll gets in the way of reading.
      */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        {/* Mission + credentials */}
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr]">
          <div className="gradient-border rounded-3xl border border-border bg-card p-8 shadow-soft md:p-10">
            <h2 className="eyebrow">{useCopy(aboutMission).eyebrow}</h2>
            <blockquote className="mt-5 text-lg leading-relaxed text-card-foreground md:text-xl">
              <Quote className="mb-4 size-7 text-accent" />
              {settings.mission}
            </blockquote>
            <p className="mt-6 text-sm font-medium text-muted-foreground">{settings.legal_name}</p>
          </div>

          <div className="space-y-5">
            <div className="surface-brand rounded-3xl p-8 shadow-soft">
              <BadgeCheck className="size-7 text-accent" />
              <h3 className="mt-4 text-xl font-semibold text-ink-foreground">
                {settings.approval}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-foreground/70">
                {useCopy(aboutApproval).intro}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-4">
              {headlineStats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-border bg-card p-5 shadow-hair"
                >
                  <dt className="font-display text-2xl font-bold text-primary">
                    <Counter to={s.to} suffix={s.suffix} />
                  </dt>
                  <dd className="mt-1 text-xs text-muted-foreground">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Services */}
        <div className="mt-20">
          <SectionHeading {...useCopy(aboutServices)} />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {services.map((s) => (
              <div
                key={s.title}
                className="card-lift rounded-xl border border-border bg-card p-6 shadow-hair [--lift:-0.125rem]"
              >
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Process: banded out of the page rhythm so it reads as its own chapter. */}
        <div className="mt-24 rounded-3xl border-y border-border bg-secondary/50 px-6 py-14 md:mt-28 md:px-10">
          <div className="mx-auto max-w-4xl">
            <SectionHeading {...useCopy(aboutProcess)} />
            <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {processSteps.map((step) => (
                <li
                  key={step.step}
                  className="card-lift group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-soft"
                >
                  {/* Watermark numeral: decorative, the step number is read below. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-2 -top-4 font-display text-7xl font-bold text-primary-soft transition-transform duration-500 ease-brand group-hover:scale-110"
                  >
                    {step.step}
                  </span>
                  <div className="relative">
                    <span className="inline-flex items-center rounded-full bg-primary-soft px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-primary">
                      Step {step.step}
                    </span>
                    <h3 className="mt-3 font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {step.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Differentiators */}
        <div className="mt-20">
          <SectionHeading {...useCopy(aboutAdvantages)} />
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {advantages.map((a) => {
              const Icon = advantageIcon(a.icon);
              return (
                <div
                  key={a.title}
                  className="card-lift rounded-2xl border border-border bg-card p-6 shadow-soft"
                >
                  <Icon className="size-5 text-primary" />
                  <h3 className="mt-4 font-semibold">{a.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.detail}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team */}
        {teamMembers.length > 0 && (
          <div className="mt-24 rounded-3xl border-y border-border bg-secondary/50 px-6 py-14 md:mt-28 md:px-10">
            <div className="mx-auto max-w-5xl">
              <SectionHeading {...teamHeading} />
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {teamMembers.map((member) => (
                  <Reveal key={member.id} delay={100}>
                    {/* `card-lift` already owns the hover lift and shadow; this used to
                        add a second -4px translate and an off-scale shadow-md on top,
                        so the card moved twice as far as every other card on the site. */}
                    <div className="card-lift group rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
                      {/* Photo or initials */}
                      {member.photo ? (
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="mx-auto size-24 rounded-full object-cover shadow-hair ring-4 ring-primary/10 transition-transform duration-300 ease-brand group-hover:scale-105"
                        />
                      ) : (
                        <div className="surface-sun mx-auto flex size-24 items-center justify-center rounded-full shadow-hair ring-4 ring-primary/10 transition-transform duration-300 ease-brand group-hover:scale-105">
                          <span className="font-display text-2xl font-bold">
                            {initials(member.name)}
                          </span>
                        </div>
                      )}

                      <h3 className="mt-4 font-display text-lg font-semibold">{member.name}</h3>
                      <p className="mt-1 text-sm font-medium text-primary">{member.designation}</p>
                      {member.department && (
                        <span className="mt-2 inline-block rounded-full bg-primary-soft px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-primary">
                          {member.department}
                        </span>
                      )}

                      {member.bio && (
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                          {member.bio}
                        </p>
                      )}

                      {/* Contact links */}
                      {(member.email || member.phone) && (
                        <div className="mt-4 flex items-center justify-center gap-3 border-t border-border pt-4">
                          {member.email && (
                            <a
                              href={`mailto:${member.email}`}
                              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
                              title={`Email ${member.name}`}
                            >
                              <Mail className="size-3.5" />
                              <span className="hidden sm:inline">Email</span>
                            </a>
                          )}
                          {member.phone && (
                            <a
                              href={`tel:${member.phone.replace(/\s/g, "")}`}
                              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
                              title={`Call ${member.name}`}
                            >
                              <Phone className="size-3.5" />
                              <span className="hidden sm:inline">Call</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Testimonials */}
        <div className="mt-20">
          <SectionHeading {...useCopy(aboutTestimonials)} />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {testimonials.slice(0, 3).map((t) => (
              <figure
                key={t.name}
                className="rounded-2xl border border-border bg-card p-6 shadow-hair"
              >
                <Quote className="size-5 text-accent" />
                <blockquote className="mt-3 text-sm leading-relaxed">“{t.quote}”</blockquote>
                <figcaption className="mt-4 flex items-center gap-3 border-t border-border pt-4 text-xs">
                  <span className="surface-sun inline-flex size-9 shrink-0 items-center justify-center rounded-full font-display text-xs font-bold shadow-hair">
                    {initials(t.name)}
                  </span>
                  <span>
                    <span className="block font-semibold">{t.name}</span>
                    <span className="text-muted-foreground">{t.result}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div className="mt-20">
          <CtaBand
            variant="quiet"
            {...useCopy(aboutCta)}
            primary={{ to: "/contact", label: "Talk to a counsellor" }}
            secondary={{ to: "/countries", label: "Browse destinations" }}
          />
        </div>
      </section>
    </SiteLayout>
  );
}
