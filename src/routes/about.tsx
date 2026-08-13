import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Mail, Phone, Quote } from "lucide-react";

import { CtaBand, PageHero, SectionHeading, SiteLayout } from "@/components/site/Chrome";
import { Reveal } from "@/components/site/Reveal";
import { advantageIcons } from "@/components/site/advantage-icons";
import { advantages, processSteps, services, site, stats, testimonials } from "@/data/site";
import { fetchTeamMembers } from "@/lib/content-api";
import { initials } from "@/lib/content-utils";
import { absoluteUrl, breadcrumbJsonLd, defaultOgImage } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Star Global Vision Educational Consultancy, Bagbazar Kathmandu" },
      {
        name: "description",
        content:
          "Star Global Vision Educational Consultancy is a Ministry of Social Development approved study abroad consultancy in Bagbazar-28, Kathmandu, Nepal.",
      },
      { property: "og:title", content: "About Star Global Vision Educational Consultancy" },
      {
        property: "og:description",
        content:
          "Our mission, our services and the students we have guided to world-ranked universities.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: absoluteUrl("/about") },
      { property: "og:image", content: defaultOgImage },
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
  }),
  loader: async () => {
    const teamMembers = await fetchTeamMembers();
    return { teamMembers };
  },
  component: About,
});

function About() {
  const { teamMembers } = Route.useLoaderData();

  return (
    <SiteLayout>
      <PageHero
        title="A Kathmandu consultancy that tells you what your file is actually worth."
        intro="Star Global Vision Educational Consultancy has guided students from Bagbazar-28 to universities and colleges across four continents, with counselling that starts from your profile, not from a commission list."
      />

      {/*
        No scroll reveals on this page. It is the page a parent reads carefully,
        and content that animates in as you scroll gets in the way of reading.
      */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        {/* Mission + credentials */}
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr]">
          <div className="gradient-border rounded-3xl border border-border bg-card p-8 shadow-soft md:p-10">
            <h2 className="eyebrow">Our mission</h2>
            <blockquote className="mt-5 text-lg leading-relaxed text-card-foreground md:text-xl">
              <Quote className="mb-4 size-7 text-accent" />
              {site.mission}
            </blockquote>
            <p className="mt-6 text-sm font-medium text-muted-foreground">{site.legalName}</p>
          </div>

          <div className="space-y-5">
            <div className="surface-brand rounded-3xl p-8 shadow-soft">
              <BadgeCheck className="size-7 text-accent" />
              <h3 className="mt-4 text-xl font-semibold text-ink-foreground">{site.approval}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-foreground/70">
                We operate as a registered and approved educational consultancy, so your
                documentation and processing follow the standards Nepali authorities and foreign
                missions expect.
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-border bg-card p-5 shadow-hair"
                >
                  <dt className="font-display text-2xl font-bold text-primary">{s.value}</dt>
                  <dd className="mt-1 text-xs text-muted-foreground">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Services */}
        <div className="mt-20">
          <SectionHeading
            title="What our support covers"
            intro="Six areas of work, all handled in the same office, so you never have to coordinate between a counsellor, a language institute and a documentation agent."
          />
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
            <SectionHeading
              eyebrow="The process"
              title="How we work with you"
              intro="One counsellor stays with you through all six stages, so nothing is repeated and nothing is dropped between desks."
            />
            <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {processSteps.map((step) => (
                <li
                  key={step.step}
                  className="card-lift group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-soft"
                >
                  {/* Watermark numeral: decorative, the step number is read below. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-2 -top-4 font-display text-7xl font-bold text-primary-soft transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
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
          <SectionHeading
            title="What makes us different"
            intro="The things students tell us they did not get from the consultancy they visited first."
          />
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {advantages.map((a) => {
              const Icon = advantageIcons[a.icon];
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
              <SectionHeading
                eyebrow="Our people"
                title="Meet the team behind your success"
                intro="Experienced counsellors, documentation specialists and language instructors working together under one roof."
              />
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {teamMembers.map((member) => (
                  <Reveal key={member.id} delay={100}>
                    <div className="card-lift group rounded-2xl border border-border bg-card p-6 shadow-soft text-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-md">
                      {/* Photo or initials */}
                      {member.photo ? (
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="mx-auto size-24 rounded-full object-cover shadow-hair ring-4 ring-primary/10 transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-hair ring-4 ring-primary/10 transition-transform duration-300 group-hover:scale-105">
                          <span className="font-display text-2xl font-bold text-white">
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
          <SectionHeading
            eyebrow="In their words"
            title="Students who sat where you are sitting"
            intro="Three of the students we have placed, with their course, their university and what the process felt like."
          />
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
            title="Come in and talk it through"
            intro="Bagbazar-28, Kathmandu. Sunday to Friday, no appointment needed."
            primary={{ to: "/contact", label: "Talk to a counsellor" }}
            secondary={{ to: "/countries", label: "Browse destinations" }}
          />
        </div>
      </section>
    </SiteLayout>
  );
}
