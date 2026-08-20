/**
 * The eyebrow, heading and intro above every block of every page.
 *
 * This is the copy that used to be typed into the JSX — "How it works", "Six
 * steps from your first question to the departure gate", and the sentence under
 * it. Fifty-two blocks across ten pages, declared here once so that /admin has
 * something to list and the site has something to show before anybody edits it.
 *
 * The database holds *overrides*, not content: `page_sections` starts empty and
 * a missing row means "use the built-in below". That is why the defaults live in
 * code rather than in a seed script — an unconfigured Supabase, a failed request
 * and an untouched install all render the site as written.
 *
 * Deliberately free of React, like `collections.ts` next to it: the sitemap
 * route and several `head()` functions read from these modules and neither can
 * pull in a component.
 */

/** The three strings above a block. `title` matches the component prop name. */
export type CopyBlock = {
  eyebrow: string;
  title: string;
  intro: string;
};

export type CopyField = keyof CopyBlock;

/**
 * One named slot in a page's layout.
 *
 * `page` and `section` together are the database key, and they are written out
 * rather than derived from the variable name so that a rename in this file
 * cannot silently orphan the rows staff have already saved.
 */
export type CopySection = {
  page: string;
  section: string;
  /** What /admin calls this block. Name the section, not the sentence. */
  label: string;
  /** Small grey text under the inputs in /admin. Say what the block affects. */
  hint?: string;
  /**
   * Which of the three inputs /admin offers.
   *
   * All three for the blocks rendered by `SectionHeading`, `PageHero` and
   * `CtaBand`, which support all three whether or not the block uses one today —
   * adding an intro under a bare heading is a reasonable thing to want. Narrowed
   * only for the handful of hand-built blocks that render fewer, so that /admin
   * never shows a box that changes nothing.
   */
  fields: readonly CopyField[];
  /**
   * What the site shows with no row saved.
   *
   * A blank `title` means the page computes it — a destination count, an exam
   * count — and passes it to `useCopy` as an override. Those blocks say so in
   * their hint, because in /admin they look like an empty box that ought to be
   * filled in.
   */
  default: CopyBlock;
};

/** A page's blocks, in the order they appear on it. */
export type CopyPage = {
  id: string;
  label: string;
  sections: readonly CopySection[];
};

/* -------------------------------------------------------------------------- */
/* Rows as they come out of the database                                       */
/* -------------------------------------------------------------------------- */

/**
 * One row of `page_sections` — an override for a single block.
 *
 * `heading` rather than `title`, matching the column: `title` is already the
 * blog post's own field and the `<title>` tag, and a table with all three would
 * be a guessing game. The one translation to the component's `title` prop
 * happens in `blockFrom` below.
 */
export type CopyRow = {
  id: string;
  page: string;
  section: string;
  eyebrow: string;
  heading: string;
  intro: string;
};

/** Every saved override, keyed by `copyKey`. */
export type PageCopy = Record<string, CopyRow>;

/**
 * The copy for one block, ready to spread onto `SectionHeading`, `PageHero` or
 * `CtaBand`.
 *
 * `overrides` replaces built-in defaults *before* the saved row is applied, and
 * is how a computed value reaches the page: the destinations hero counts the
 * live list, and passing that as an override makes it the default rather than
 * something a save can quietly freeze.
 *
 * A saved blank is how staff say "remove this", so blanks are honoured — except
 * where the code has something of its own to put there, in which case blank
 * means "keep it as the code has it". Concretely:
 *  - `title` falls back to the built-in heading, so a cleared heading shows the
 *    real one rather than leaving a section without a name.
 *  - `eyebrow` and `intro` fall back only to an override, never to the static
 *    default. Clearing a plain one removes it, which is the point; clearing a
 *    computed one goes back to counting, because there is no version of
 *    "narrow fourteen down to a shortlist" that does not have a number in it.
 */
export function blockFrom(
  copy: PageCopy | undefined,
  section: CopySection,
  overrides?: Partial<CopyBlock>,
): CopyBlock {
  const base: CopyBlock = { ...section.default, ...overrides };
  const row = copy?.[copyKey(section)];
  if (!row) return base;

  return {
    eyebrow: row.eyebrow || (overrides?.eyebrow ?? ""),
    title: row.heading || base.title,
    intro: row.intro || (overrides?.intro ?? ""),
  };
}

/** The database key for a block, and its React key in /admin. */
export function copyKey(section: Pick<CopySection, "page" | "section">): string {
  return `${section.page}/${section.section}`;
}

const all: readonly CopyField[] = ["eyebrow", "title", "intro"];

/* -------------------------------------------------------------------------- */
/* Home                                                                        */
/* -------------------------------------------------------------------------- */

export const homeHero: CopySection = {
  page: "home",
  section: "hero",
  label: "Hero",
  hint: "The first thing a visitor reads. The approval line above it comes from Site settings.",
  // No eyebrow: that slot is the approval pill, which is a settings field.
  fields: ["title", "intro"],
  default: {
    eyebrow: "",
    title: "University applications, test preparation and visa filing, handled in one office.",
    intro:
      "Star Global Vision guides students from Bagbazar, Kathmandu to world-ranked universities in Australia, the USA, Canada, the UK and beyond. Counselling, documentation, language classes and visa support under one roof.",
  },
};

export const homeDestinations: CopySection = {
  page: "home",
  section: "destinations",
  label: "Destinations rail",
  hint: "Leave the heading empty to keep counting your published destinations automatically.",
  fields: all,
  default: { eyebrow: "Where you can go", title: "", intro: "" },
};

export const homePartners: CopySection = {
  page: "home",
  section: "partners",
  label: "Partner band",
  hint: "The one line above the scrolling list of universities. The list itself is the Partners tab. Clear it to leave the band unlabelled.",
  // Heading only in the sense that the band has nothing else — it is a single
  // centred line in eyebrow type, so it is offered as the eyebrow it renders as.
  fields: ["eyebrow"],
  default: { eyebrow: "Students placed at", title: "", intro: "" },
};

export const homeServices: CopySection = {
  page: "home",
  section: "services",
  label: "What we do",
  fields: all,
  default: {
    eyebrow: "",
    title: "Everything from the first question to the airport gate",
    intro: "",
  },
};

export const homeProcess: CopySection = {
  page: "home",
  section: "process",
  label: "The six steps",
  fields: all,
  default: {
    eyebrow: "How it works",
    title: "Six steps from your first question to the departure gate",
    intro:
      "You always know which step you are on, what we are waiting for, and what you need to bring next.",
  },
};

export const homeWhyUs: CopySection = {
  page: "home",
  section: "why-us",
  label: "Why students choose us",
  hint: "The heading over the brand-coloured band. This block shows a heading only.",
  fields: ["title"],
  default: { eyebrow: "", title: "Why students choose us", intro: "" },
};

export const homeTestPrep: CopySection = {
  page: "home",
  section: "test-prep",
  label: "Test preparation",
  fields: all,
  default: {
    eyebrow: "In-house classes",
    title: "Test preparation that moves your score",
    intro:
      "Batches capped at twelve, weekly full-length mocks and writing marked against the official band descriptors, for IELTS, PTE, Duolingo and JLPT Japanese, taught in the same building where your application is prepared.",
  },
};

export const homeStories: CopySection = {
  page: "home",
  section: "stories",
  label: "Student stories",
  fields: all,
  default: { eyebrow: "Student stories", title: "Offers, visas and new beginnings", intro: "" },
};

export const homeBlog: CopySection = {
  page: "home",
  section: "blog",
  label: "Latest posts",
  fields: all,
  default: { eyebrow: "", title: "From our blog", intro: "" },
};

export const homeFaqs: CopySection = {
  page: "home",
  section: "faqs",
  label: "Common questions",
  hint: "Leave the intro empty to keep offering the first phone number from Site settings.",
  fields: all,
  default: {
    eyebrow: "Common questions",
    title: "The things every student asks us first",
    intro: "",
  },
};

export const homeCta: CopySection = {
  page: "home",
  section: "cta",
  label: "Closing call to action",
  fields: all,
  default: {
    eyebrow: "",
    title: "Sit with a counsellor this week, free of cost",
    intro:
      "Visit us at Bagbazar-28, Kathmandu or call and we will map out your country, course and budget.",
  },
};

export const homePopup: CopySection = {
  page: "home",
  section: "popup",
  label: "Enquiry popup",
  hint: "The invitation that covers the home page a couple of seconds in, once per visit. The logo above it and the fields under it are fixed.",
  // No eyebrow: the logo occupies that slot.
  fields: ["title", "intro"],
  default: {
    eyebrow: "",
    title: "Free consultation",
    intro: "Tell us your destination and we will map out the route.",
  },
};

/* -------------------------------------------------------------------------- */
/* About                                                                       */
/* -------------------------------------------------------------------------- */

export const aboutHero: CopySection = {
  page: "about",
  section: "hero",
  label: "Hero",
  fields: all,
  default: {
    eyebrow: "",
    title: "A Kathmandu consultancy that tells you what your file is actually worth.",
    intro:
      "Star Global Vision Educational Consultancy has guided students from Bagbazar-28 to universities and colleges across four continents, with counselling that starts from your profile, not from a commission list.",
  },
};

export const aboutMission: CopySection = {
  page: "about",
  section: "mission",
  label: "Mission card",
  hint: "The small label above the quote. The mission statement itself is in Site settings.",
  fields: ["eyebrow"],
  default: { eyebrow: "Our mission", title: "", intro: "" },
};

export const aboutApproval: CopySection = {
  page: "about",
  section: "approval",
  label: "Approval card",
  hint: "The paragraph under the approval line. The line itself is in Site settings.",
  fields: ["intro"],
  default: {
    eyebrow: "",
    title: "",
    intro:
      "We operate as a registered and approved educational consultancy, so your documentation and processing follow the standards Nepali authorities and foreign missions expect.",
  },
};

export const aboutServices: CopySection = {
  page: "about",
  section: "services",
  label: "What our support covers",
  fields: all,
  default: {
    eyebrow: "",
    title: "What our support covers",
    intro:
      "Six areas of work, all handled in the same office, so you never have to coordinate between a counsellor, a language institute and a documentation agent.",
  },
};

export const aboutProcess: CopySection = {
  page: "about",
  section: "process",
  label: "How we work with you",
  fields: all,
  default: {
    eyebrow: "The process",
    title: "How we work with you",
    intro:
      "One counsellor stays with you through all six stages, so nothing is repeated and nothing is dropped between desks.",
  },
};

export const aboutAdvantages: CopySection = {
  page: "about",
  section: "advantages",
  label: "What makes us different",
  fields: all,
  default: {
    eyebrow: "",
    title: "What makes us different",
    intro: "The things students tell us they did not get from the consultancy they visited first.",
  },
};

export const aboutTeam: CopySection = {
  page: "about",
  section: "team",
  label: "The team",
  fields: all,
  default: {
    eyebrow: "Our people",
    title: "Meet the team behind your success",
    intro:
      "Experienced counsellors, documentation specialists and language instructors working together under one roof.",
  },
};

export const aboutTestimonials: CopySection = {
  page: "about",
  section: "testimonials",
  label: "In their words",
  fields: all,
  default: {
    eyebrow: "In their words",
    title: "Students who sat where you are sitting",
    intro:
      "Three of the students we have placed, with their course, their university and what the process felt like.",
  },
};

export const aboutCta: CopySection = {
  page: "about",
  section: "cta",
  label: "Closing call to action",
  fields: all,
  default: {
    eyebrow: "",
    title: "Come in and talk it through",
    intro: "Bagbazar-28, Kathmandu. Sunday to Friday, no appointment needed.",
  },
};

/* -------------------------------------------------------------------------- */
/* Contact                                                                     */
/* -------------------------------------------------------------------------- */

export const contactHero: CopySection = {
  page: "contact",
  section: "hero",
  label: "Hero",
  hint: "The address, phone numbers and hours below it all come from Site settings.",
  fields: all,
  default: {
    eyebrow: "Contact",
    title: "Come in for a free counselling session.",
    intro:
      "Walk into our Bagbazar-28 office, call us, or send an enquiry. We usually reply the same working day.",
  },
};

export const contactWhatsapp: CopySection = {
  page: "contact",
  section: "whatsapp",
  label: "WhatsApp card",
  hint: "The one loud card in the details column. It only appears at all when a WhatsApp number is set in Site settings.",
  fields: ["title", "intro"],
  default: {
    eyebrow: "",
    title: "Prefer to message? Chat on WhatsApp",
    intro: "Quickest way to reach a counsellor outside office hours.",
  },
};

export const contactForm: CopySection = {
  page: "contact",
  section: "form",
  label: "Enquiry form",
  hint: "The heading over the form. What a visitor sees after sending it is fixed, because that sentence carries the office number as a link.",
  fields: ["title", "intro"],
  default: {
    eyebrow: "",
    title: "Send an enquiry",
    intro: "Tell us your destination and preferred course and a counsellor will get back to you.",
  },
};

/* -------------------------------------------------------------------------- */
/* Test Preparation                                                            */
/* -------------------------------------------------------------------------- */

export const testPrepHero: CopySection = {
  page: "test-prep",
  section: "hero",
  label: "Hero",
  fields: all,
  default: {
    eyebrow: "Test preparation",
    title: "Know the exam before you sit it.",
    intro:
      "IELTS, PTE Academic, the Duolingo English Test and JLPT Japanese, taught in our Bagbazar office, in batches of twelve, by teachers who sit beside the counsellors handling your application. Below is exactly what each exam asks of you.",
  },
};

export const testPrepChooser: CopySection = {
  page: "test-prep",
  section: "chooser",
  label: "Which test should you take",
  fields: all,
  default: {
    eyebrow: "Start here",
    title: "Which test should you take?",
    intro:
      "The right exam is worth about half a band on its own. Find the line that sounds like you, then confirm it with a free diagnostic before you pay any registration fee.",
  },
};

export const testPrepExams: CopySection = {
  page: "test-prep",
  section: "exams",
  label: "The exam panels",
  fields: all,
  default: {
    eyebrow: "",
    title: "Every section, every timing, every score scale",
    intro:
      "Most students walk into the test centre knowing the name of the exam and very little else. Read this properly and you will already be ahead of the room.",
  },
};

export const testPrepFaqs: CopySection = {
  page: "test-prep",
  section: "faqs",
  label: "Class questions",
  fields: all,
  default: {
    eyebrow: "Class questions",
    title: "What students ask us before enrolling",
    intro: "",
  },
};

export const testPrepCompare: CopySection = {
  page: "test-prep",
  section: "compare",
  label: "Comparison table",
  hint: "Leave the heading empty to keep counting the exams automatically.",
  fields: all,
  default: {
    eyebrow: "Compare",
    title: "",
    intro:
      "Length, scoring, turnaround and where each one is taken, so you can rule out the ones that do not suit you.",
  },
};

export const testPrepMethod: CopySection = {
  page: "test-prep",
  section: "method",
  label: "How we teach",
  hint: "Leave the heading empty to keep counting the points below it automatically.",
  fields: all,
  default: {
    eyebrow: "How we teach",
    title: "",
    intro:
      "None of this is complicated. It is just the difference between a class that fills a room and a class that moves a band.",
  },
};

export const testPrepCta: CopySection = {
  page: "test-prep",
  section: "cta",
  label: "Closing call to action",
  fields: all,
  default: {
    eyebrow: "",
    title: "New batches open every two weeks",
    intro:
      "Morning, day and evening timings, Sunday to Friday. Evening batches fill first, so tell us your target score and date and we will hold you a seat.",
  },
};

/* -------------------------------------------------------------------------- */
/* Destinations                                                                */
/* -------------------------------------------------------------------------- */

export const countriesHero: CopySection = {
  page: "countries",
  section: "hero",
  label: "Hero",
  hint: "Leave the heading empty to keep counting your published destinations automatically.",
  fields: all,
  default: {
    eyebrow: "Country guide",
    title: "",
    intro:
      "Australia, Canada, the USA and the UK are our flagship destinations, and we also place students across the Nordics, central Europe, Malta, New Zealand, Japan, South Korea and the UAE. Compare them properly, then let us tell you which one fits your profile.",
  },
};

export const countriesGrid: CopySection = {
  page: "countries",
  section: "grid",
  label: "The destination cards",
  fields: all,
  default: {
    eyebrow: "Where you can go",
    title: "What each destination offers",
    intro:
      "Tap any destination for the full guide: universities, tuition, living costs, entry requirements and the visa route.",
  },
};

export const countriesCompare: CopySection = {
  page: "countries",
  section: "compare",
  label: "Comparison table",
  hint: "Leave the intro empty to keep counting the destinations in the table automatically.",
  fields: all,
  default: { eyebrow: "Compare", title: "The whole picture on one screen", intro: "" },
};

export const countriesChooser: CopySection = {
  page: "countries",
  section: "chooser",
  label: "Help me choose",
  fields: all,
  default: {
    eyebrow: "Help me choose",
    title: "Start from what matters most to you",
    intro:
      "Most students arrive with a country in mind and leave with a better one. Pick the priority that sounds like you and see where it points.",
  },
};

export const countriesCta: CopySection = {
  page: "countries",
  section: "cta",
  label: "Closing call to action",
  fields: all,
  default: {
    eyebrow: "",
    title: "Not sure which country fits your profile and budget?",
    intro:
      "Bring your transcripts to a free session and we will compare two or three realistic options side by side, including the ones we think you should rule out.",
  },
};

export const countryFacts: CopySection = {
  page: "country",
  section: "facts",
  label: "At a glance",
  hint: "Shown above the fact cards on every destination page.",
  fields: ["eyebrow", "title"],
  default: { eyebrow: "At a glance", title: "The numbers that decide it", intro: "" },
};

export const countryOverview: CopySection = {
  page: "country",
  section: "overview",
  label: "Overview",
  hint: "Shown above the written guide on every destination page. Leave the heading empty to keep naming the country in it.",
  fields: ["eyebrow", "title"],
  default: { eyebrow: "The full picture", title: "", intro: "" },
};

export const countryUniversities: CopySection = {
  page: "country",
  section: "universities",
  label: "Universities panel",
  hint: "The card beside the guide. Its list comes from the destination itself, in the Destinations tab.",
  fields: ["title"],
  default: { eyebrow: "", title: "Popular universities", intro: "" },
};

export const countryRequirements: CopySection = {
  page: "country",
  section: "requirements",
  label: "Entry and visa",
  hint: "Shown above the requirements on every destination page. Leave the heading empty to keep naming the country in it.",
  fields: ["eyebrow", "title"],
  default: { eyebrow: "Entry and visa", title: "", intro: "" },
};

export const countryDisclaimer: CopySection = {
  page: "country",
  section: "disclaimer",
  label: "Policy note",
  hint: "The small grey box under the requirements, on every destination page. Clear it to remove the box.",
  fields: ["intro"],
  default: {
    eyebrow: "",
    title: "",
    intro:
      "Visa policy, fees and work rules change regularly. Everything above is what applies at the time of writing; we confirm the current rules for your course and intake before you pay anything or lodge an application.",
  },
};

export const countryRelated: CopySection = {
  page: "country",
  section: "related",
  label: "Related destinations",
  hint: "The heading over the three destinations suggested at the foot of every destination page.",
  fields: ["title"],
  default: { eyebrow: "", title: "Also worth comparing", intro: "" },
};

export const countryCta: CopySection = {
  page: "country",
  section: "cta",
  label: "Closing call to action",
  hint: "Shown on every single destination page. Leave the heading empty to keep naming the country in it.",
  fields: all,
  default: {
    eyebrow: "",
    title: "",
    intro:
      "Bring your transcripts to the Bagbazar office for a free session. We will tell you which universities are realistic, what it will actually cost, and whether another destination would serve you better.",
  },
};

/* -------------------------------------------------------------------------- */
/* Blog                                                                        */
/* -------------------------------------------------------------------------- */

export const blogHero: CopySection = {
  page: "blog",
  section: "hero",
  label: "Hero",
  fields: all,
  default: {
    eyebrow: "Blog & resources",
    title: "Guides written by the people who file the applications.",
    intro:
      "Visa documentation, test strategy, scholarships and destination comparisons, written by the counsellors and teachers who handle these files every day.",
  },
};

export const blogTopics: CopySection = {
  page: "blog",
  section: "topics",
  label: "Browse by topic",
  fields: all,
  default: {
    eyebrow: "Browse by topic",
    title: "Find the guide for the stage you are at",
    intro:
      "Filter by topic, or search by keyword to go straight to the article that covers your question.",
  },
};

export const postRelated: CopySection = {
  page: "post",
  section: "related",
  label: "More articles",
  hint: "The heading over the articles suggested at the foot of every post.",
  fields: ["title"],
  default: { eyebrow: "", title: "More from our counselling desk", intro: "" },
};

export const postCta: CopySection = {
  page: "post",
  section: "cta",
  label: "Closing call to action",
  hint: "Shown at the end of every blog post.",
  fields: all,
  default: {
    eyebrow: "",
    title: "Questions about your own application?",
    intro:
      "Bring your documents to our Bagbazar office and a counsellor will map out your country, course and budget, free of cost.",
  },
};

/* -------------------------------------------------------------------------- */
/* Success stories                                                             */
/* -------------------------------------------------------------------------- */

export const storiesHero: CopySection = {
  page: "stories",
  section: "hero",
  label: "Hero",
  fields: all,
  default: {
    eyebrow: "Success stories",
    title: "Offers, visas and new beginnings.",
    intro:
      "Every student below sat in our Bagbazar office with the same questions you have now. These are their universities, their courses and what the process looked like.",
  },
};

export const storiesFilter: CopySection = {
  page: "stories",
  section: "filter",
  label: "Filter by destination",
  fields: all,
  default: {
    eyebrow: "Filter by destination",
    title: "Where our students are studying now",
    intro:
      "Pick a country to see the students we have placed there, and the universities that accepted them.",
  },
};

export const storiesCta: CopySection = {
  page: "stories",
  section: "cta",
  label: "Closing call to action",
  fields: all,
  default: {
    eyebrow: "",
    title: "Your story could be the next one here",
    intro:
      "Start with a free profile assessment. We will tell you which countries and universities are realistic for your academics and your budget.",
  },
};

export const storyRelated: CopySection = {
  page: "story",
  section: "related",
  label: "Other students",
  hint: "The heading over the stories suggested at the foot of every story. Leave it empty to keep naming the student in it.",
  fields: ["title"],
  default: { eyebrow: "", title: "", intro: "" },
};

export const storyCta: CopySection = {
  page: "story",
  section: "cta",
  label: "Closing call to action",
  hint: "Shown at the end of every success story.",
  fields: all,
  default: {
    eyebrow: "",
    title: "Ready to write your own story?",
    intro:
      "Free profile assessment, a realistic shortlist and documentation handled properly from the first day.",
  },
};

/* -------------------------------------------------------------------------- */
/* The catalogue                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Every block, grouped the way /admin lists them.
 *
 * Ordered as a visitor meets them: down each page, and pages in the order of the
 * header nav. The single-record pages — one destination, one post, one story —
 * come after their list page, because their one block is shown on all of them.
 */
export const copyPages: readonly CopyPage[] = [
  {
    id: "home",
    label: "Home",
    sections: [
      homeHero,
      homeDestinations,
      homePartners,
      homeServices,
      homeProcess,
      homeWhyUs,
      homeTestPrep,
      homeStories,
      homeBlog,
      homeFaqs,
      homeCta,
      homePopup,
    ],
  },
  {
    id: "about",
    label: "About",
    sections: [
      aboutHero,
      aboutMission,
      aboutApproval,
      aboutServices,
      aboutProcess,
      aboutAdvantages,
      aboutTeam,
      aboutTestimonials,
      aboutCta,
    ],
  },
  {
    id: "test-prep",
    label: "Test Prep",
    sections: [
      testPrepHero,
      testPrepChooser,
      testPrepExams,
      testPrepFaqs,
      testPrepCompare,
      testPrepMethod,
      testPrepCta,
    ],
  },
  {
    id: "countries",
    label: "Destinations",
    sections: [countriesHero, countriesGrid, countriesCompare, countriesChooser, countriesCta],
  },
  {
    id: "country",
    label: "One destination",
    sections: [
      countryFacts,
      countryOverview,
      countryUniversities,
      countryRequirements,
      countryDisclaimer,
      countryRelated,
      countryCta,
    ],
  },
  { id: "blog", label: "Blog", sections: [blogHero, blogTopics] },
  { id: "post", label: "One post", sections: [postRelated, postCta] },
  { id: "stories", label: "Success stories", sections: [storiesHero, storiesFilter, storiesCta] },
  { id: "story", label: "One story", sections: [storyRelated, storyCta] },
  { id: "contact", label: "Contact", sections: [contactHero, contactWhatsapp, contactForm] },
];
