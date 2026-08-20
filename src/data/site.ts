/**
 * Business details and SEO defaults for the whole site.
 *
 * One row in the `site_settings` table, edited in /admin. The primary key is the
 * literal `"main"` — the table has a check constraint that allows no other
 * value, so a second row is a database error rather than a silent ambiguity
 * about which one wins.
 *
 * Every field is required, and `site` below is the fallback for a table that has
 * no row yet. That keeps the "is this missing?" question in one place instead of
 * at the fifty-odd call sites that read these values.
 */
export type SiteSettings = {
  id: "main";
  name: string;
  legal_name: string;
  mission: string;
  address: string;
  email: string;
  /**
   * Two numbers, separately: the top bar shows the landline and the mobile CTA
   * shows the mobile, so they are not interchangeable and a positional array
   * left them impossible to label in the editor.
   */
  phone_primary: string;
  phone_secondary: string;
  /** Digits only in international format, for wa.me links. */
  whatsapp: string;
  facebook: string;
  approval: string;
  hours: string;
  /** Free text passed to the Google Maps embed on /contact. */
  map_query: string;
  /** Defaults for pages that do not set their own. */
  seo_title: string;
  seo_description: string;
  og_image: string | null;
};

/**
 * What the site shows before anyone edits it in /admin.
 *
 * Read through `useSettings()` (lib/use-site-content.ts), never imported
 * directly by a page — the point is that staff can change all of this without a
 * deploy. It stays here as the fallback so an empty table, an unconfigured
 * Supabase or a database outage renders the real business details rather than
 * blank space.
 */
export const site: SiteSettings = {
  id: "main",
  name: "Star Global Vision",
  legal_name: "Star Global Vision Educational Consultancy",
  mission:
    "Our mission is to provide proper counselling, documentation, language skill, cultural exchange of desired country, administrative and technical support to the aspiring potential candidates willing to study in different world ranked universities & colleges in the world.",
  address: "Bagbazar-28, Kathmandu, Nepal",
  email: "starglobalvision@gmail.com",
  phone_primary: "977-01-5364635",
  phone_secondary: "977-9841902452",
  whatsapp: "9779841902452",
  facebook: "https://fb.com/starglobalvision",
  approval: "Approved by Ministry of Social Development",
  hours: "Sunday - Friday, 7:00 AM - 6:00 PM",
  map_query: "Bagbazar, Kathmandu, Nepal",
  seo_title: "Star Global Vision Educational Consultancy",
  seo_description:
    "Study abroad consultancy in Bagbazar, Kathmandu, covering Australia, Canada, USA, UK, New Zealand, the Nordics, Japan, South Korea, the UAE and test preparation.",
  og_image: null,
};

/** Digits-only phone number, safe for tel: hrefs. */
export const telHref = (phone: string) => `tel:${phone.replace(/[^0-9]/g, "")}`;

/**
 * Both phone numbers as a list, blanks dropped.
 *
 * The footer and the contact page list every number they have. Staff can clear
 * the second one, and a `tel:` link to an empty string is a dead link, so the
 * filter belongs here rather than in each of those two loops.
 */
export const sitePhones = (settings: SiteSettings): string[] =>
  [settings.phone_primary, settings.phone_secondary].map((p) => p.trim()).filter(Boolean);

export const tests = [
  {
    name: "IELTS",
    detail:
      "Academic & General Training. Four skills, band 5.0-8.0 target classes with weekly mock tests.",
    duration: "6 weeks",
    mode: "Morning / Day / Evening",
  },
  {
    name: "PTE",
    detail:
      "Computer-based training with real scored software practice, template drills and speaking labs.",
    duration: "4-6 weeks",
    mode: "Morning / Evening",
  },
  {
    name: "Duolingo English Test",
    detail:
      "Fast-track coaching for the adaptive DET format, with score-boosting strategy for 105+ results.",
    duration: "3 weeks",
    mode: "Flexible batches",
  },
  {
    name: "Japanese Language",
    detail:
      "JLPT N5 to N3 with native-style conversation, kanji drills and culture orientation for Japan.",
    duration: "3-6 months",
    mode: "Morning / Day",
  },
];

export const services = [
  {
    title: "Career counselling",
    detail: "One-to-one profile assessment to match the right country, course and budget.",
  },
  {
    title: "University placement",
    detail: "Applications to world-ranked universities and colleges with our partner network.",
  },
  {
    title: "Documentation",
    detail: "SOP, financial documents, sponsorship and complete visa file preparation.",
  },
  {
    title: "Language & test prep",
    detail: "In-house IELTS, PTE, Duolingo and Japanese language classes.",
  },
  {
    title: "Visa & interview",
    detail: "Mock interviews, visa lodgement support and compliance checks.",
  },
  {
    title: "Pre-departure & beyond",
    detail: "Accommodation, forex, travel, airport pickup and cultural orientation.",
  },
];

export const testimonials = [
  {
    name: "Sujata Karki",
    result: "Master of IT at Deakin University, Australia",
    quote:
      "From my first counselling session to my visa grant, the team explained every step. My documentation was flawless and I got my visa on the first attempt.",
  },
  {
    name: "Bibek Shrestha",
    result: "MSc Data Science at the University of Leeds, U.K",
    quote:
      "Their SOP guidance made a huge difference. I also took IELTS classes here and moved from 6.0 to 7.5 in six weeks.",
  },
  {
    name: "Anisha Gurung",
    result: "Business Diploma at Conestoga College, Canada",
    quote:
      "They were honest about my budget and shortlisted colleges that actually fit me. The GIC and finance support was very organised.",
  },
  {
    name: "Rojan Tamang",
    result: "Language school in Tokyo, Japan",
    quote:
      "I started from zero Japanese and cleared JLPT N5 with their morning class. The teachers made kanji feel easy.",
  },
  {
    name: "Prakriti Adhikari",
    result: "BS Computer Science at Arizona State University, U.S.A",
    quote:
      "The visa interview mock sessions were exactly like the real thing. I felt calm and confident on the day.",
  },
  {
    name: "Nabin Thapa",
    result: "Master of Engineering at the University of Auckland, New Zealand",
    quote:
      "Genuine people who never over-promised. They kept following up with the university until my offer arrived.",
  },
];

/**
 * Headline figures, in the numeric shape the `Counter` component animates.
 *
 * Keyed rather than a list, and deliberately missing the destination count: that
 * figure is derived from the live country list by `useStats()`, because as a
 * hardcoded "14" it went stale the moment anyone added a destination in /admin.
 */
export const stats = {
  counselled: { to: 3500, suffix: "+", label: "Students counselled" },
  visa: { to: 98, suffix: "%", label: "Visa success rate" },
  years: { to: 12, suffix: "+", label: "Years of guidance" },
} as const;

/** Step-by-step process shown on the home page and About page. */
export const processSteps = [
  {
    step: "01",
    title: "Free profile assessment",
    detail:
      "We review your academics, budget, English level and long-term plan, then tell you which countries fit and which do not.",
  },
  {
    step: "02",
    title: "Country & course shortlist",
    detail:
      "You get a written shortlist of universities with tuition, intake dates, entry requirements and scholarship chances side by side.",
  },
  {
    step: "03",
    title: "Language & test preparation",
    detail:
      "Start IELTS, PTE, Duolingo or Japanese classes in our own building while your file is being prepared. No separate institute needed.",
  },
  {
    step: "04",
    title: "Application & offer letter",
    detail:
      "We prepare your SOP, transcripts and references, apply to your shortlist and follow up with universities until offers arrive.",
  },
  {
    step: "05",
    title: "Financial & visa documentation",
    detail:
      "Sponsorship, income source, bank balance, GIC or blocked account, plus a fully compliant visa file checked line by line.",
  },
  {
    step: "06",
    title: "Pre-departure & arrival",
    detail:
      "Mock visa interview, forex, ticketing, accommodation, airport pickup and a cultural briefing before you fly.",
  },
];

/**
 * The Lucide glyphs an advantage can use.
 *
 * A list rather than a union written inline, because /admin offers it as a
 * dropdown: the options and the type have to be the same six names, and
 * deriving one from the other is the only way that stays true.
 */
export const advantageIconNames = [
  "scale",
  "school",
  "file-check",
  "user-round",
  "badge-check",
  "life-buoy",
] as const;

export type Advantage = {
  title: string;
  detail: string;
  /**
   * Lucide glyph name. Kept as a string so this file stays free of React
   * imports; the name-to-component map lives in the view that renders icons.
   */
  icon: (typeof advantageIconNames)[number];
};

/** Differentiators used in the "Why us" band. */
export const advantages: Advantage[] = [
  {
    title: "We shortlist on your profile, not on commission",
    icon: "scale",
    detail:
      "We shortlist on your profile and budget, not on which university pays the most. If a country is wrong for you, we say so.",
  },
  {
    title: "Test classes in-house",
    icon: "school",
    detail:
      "IELTS, PTE, Duolingo and JLPT taught in the same office that files your application, so teachers and counsellors share your progress.",
  },
  {
    title: "Documentation done properly",
    icon: "file-check",
    detail:
      "Financial papers, sponsorship and SOPs prepared to the standard that Nepali authorities and foreign missions expect.",
  },
  {
    title: "One counsellor, start to finish",
    icon: "user-round",
    detail:
      "You are not passed between desks. The counsellor who assesses you also handles your offer, visa file and departure.",
  },
  {
    title: "Government approved",
    icon: "badge-check",
    detail:
      "Registered and approved by the Ministry of Social Development, so your processing follows official channels throughout.",
  },
  {
    title: "Support after you land",
    icon: "life-buoy",
    detail:
      "Accommodation, part-time job guidance and a Nepali student network in each destination city you can lean on.",
  },
];

/** Partner institution names for the logo/marquee band. */
export const partners = [
  "Deakin University",
  "University of Leeds",
  "Conestoga College",
  "Arizona State University",
  "University of Auckland",
  "RMIT University",
  "Coventry University",
  "Seneca Polytechnic",
  "Griffith University",
  "Trent University",
];

export const faqs = [
  {
    q: "How much does your counselling cost?",
    a: "Counselling, country shortlisting and profile assessment are completely free. You only pay official university application fees, test registration fees and government charges, and we show you every amount in writing before you pay anything.",
  },
  {
    q: "Which bank balance do I need to show?",
    a: "It depends on the country and the length of your course, but roughly one year of tuition plus living costs for most destinations. We calculate the exact figure for your chosen university and guide you on income source, sponsorship and the maturity period the embassy expects.",
  },
  {
    q: "Can I apply without IELTS or PTE?",
    a: "Yes for several destinations. Many universities accept Duolingo, a Medium of Instruction letter, or their own internal English test. We will tell you which of your shortlisted universities allow this, though a good IELTS or PTE score still widens your options and helps your visa.",
  },
  {
    q: "How long does the whole process take?",
    a: "Plan for three to six months from first counselling to visa, depending on the country and intake. Test preparation, offer letters and visa processing each take a few weeks, so applying early for your intended intake matters more than anything else.",
  },
  {
    q: "Can my spouse come with me?",
    a: "Australia, the U.K (for some courses), Canada and New Zealand allow dependants under specific conditions, and rules change often. We check the current policy for your course level and prepare the dependant file alongside your own.",
  },
  {
    q: "Do you help students who already have a refusal?",
    a: "Yes. Bring your refusal letter and previous file. We identify exactly what went wrong, rebuild the documentation and re-apply with a stronger case. A previous refusal does not end your plan, but it does have to be addressed head on.",
  },
  {
    q: "Will I be able to work while studying?",
    a: "Every destination we handle allows part-time work during study, from 20 hours a week in the U.K to 48 hours a fortnight in Australia. We are realistic with you about earnings: part-time work supports your living costs, it does not fund your tuition.",
  },
];

/**
 * Practical notes for a first visit: the questions we field most on the phone.
 *
 * Lived in the Contact route until it became editable. Kept here with the other
 * seed lists so `collections.ts` has one place to import from.
 */
export const visitNotes = [
  {
    title: "No appointment needed",
    detail:
      "Walk in during office hours and a counsellor will see you. Booking ahead just means less waiting during the busy intake months.",
  },
  {
    title: "What to bring",
    detail:
      "Your academic transcripts and certificates, citizenship or passport, and any IELTS, PTE or Duolingo score you already have. Photocopies are fine for a first session.",
  },
  {
    title: "Counselling is free",
    detail:
      "Profile assessment, country shortlisting and course advice cost nothing. You only pay official university, test and government fees, always shown to you in writing first.",
  },
];
