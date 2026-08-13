export const site = {
  name: "Star Global Vision",
  legalName: "Star Global Vision Educational Consultancy",
  tagline: "Study abroad counselling, test classes and visa filing in Bagbazar, Kathmandu.",
  mission:
    "Our mission is to provide proper counselling, documentation, language skill, cultural exchange of desired country, administrative and technical support to the aspiring potential candidates willing to study in different world ranked universities & colleges in the world.",
  address: "Bagbazar-28, Kathmandu, Nepal",
  email: "starglobalvision@gmail.com",
  facebook: "https://fb.com/starglobalvision",
  phones: ["977-01-5364635", "977-9841902452"] as const,
  approval: "Approved by Ministry of Social Development",
  hours: "Sunday - Friday, 7:00 AM - 6:00 PM",
  /** Digits only in international format, for wa.me links. */
  whatsapp: "9779841902452",
  mapQuery: "Bagbazar, Kathmandu, Nepal",
};

/** Digits-only phone number, safe for tel: hrefs. */
export const telHref = (phone: string) => `tel:${phone.replace(/[^0-9]/g, "")}`;

export type Country = {
  slug: string;
  name: string;
  flag: string;
  tier: "primary" | "secondary";
  blurb: string;
  intakes: string;
  work: string;
  highlights: string[];
  tests: string;
  /**
   * Destination photo served from public/. The filenames are the ones supplied
   * with the brand assets, so they are spelled exactly as they sit on disk.
   * The space in "New Zealand.jpg" is percent-encoded for the URL.
   */
  image: string;
};

export const countries: Country[] = [
  {
    slug: "australia",
    name: "Australia",
    flag: "AU",
    tier: "primary",
    blurb:
      "Globally ranked universities, generous post-study work rights and a strong Nepali student community across Sydney, Melbourne and Brisbane.",
    intakes: "February, July (limited November)",
    work: "48 hrs / fortnight during study, 2-4 yrs post-study work",
    highlights: [
      "Group of Eight & top TAFE pathways",
      "Dependent visa options",
      "Strong part-time job market",
    ],
    tests: "IELTS / PTE / Duolingo",
    image: "/Australia.jpg",
  },
  {
    slug: "usa",
    name: "U.S.A",
    flag: "US",
    tier: "primary",
    blurb:
      "The widest choice of universities in the world, scholarship-rich admissions and OPT/STEM-OPT work experience after graduation.",
    intakes: "Fall, Spring, Summer",
    work: "On-campus work, 12 months OPT + 24 months STEM extension",
    highlights: [
      "F-1 visa interview coaching",
      "Scholarship & assistantship guidance",
      "Community college pathways",
    ],
    tests: "IELTS / PTE / Duolingo / SAT / GRE",
    image: "/Usa.avif",
  },
  {
    slug: "canada",
    name: "Canada",
    flag: "CA",
    tier: "primary",
    blurb:
      "Affordable, safe and residency-friendly. Colleges and universities with co-op programs that lead to a Post-Graduation Work Permit.",
    intakes: "January, May, September",
    work: "24 hrs / week off-campus, up to 3 yrs PGWP",
    highlights: [
      "SDS & non-SDS applications",
      "GIC and proof-of-funds support",
      "Co-op / internship programs",
    ],
    tests: "IELTS / PTE / Duolingo",
    image: "/Canada.jpg",
  },
  {
    slug: "uk",
    name: "U.K",
    flag: "UK",
    tier: "primary",
    blurb:
      "One-year master's degrees, world-heritage universities and a 2-year Graduate Route visa to build your career in Britain.",
    intakes: "September, January",
    work: "20 hrs / week during term, 2 yrs Graduate Route",
    highlights: [
      "1-year master's programs",
      "Russell Group applications",
      "Scholarship & bursary shortlisting",
    ],
    tests: "IELTS UKVI / PTE UKVI",
    image: "/uk.avif",
  },
  {
    slug: "new-zealand",
    name: "New Zealand",
    flag: "NZ",
    tier: "secondary",
    blurb:
      "Small class sizes, high quality of life and clear pathways from diploma to skilled work visas.",
    intakes: "February, July",
    work: "20 hrs / week, up to 3 yrs post-study work",
    highlights: [
      "All 8 universities government-funded",
      "Partner work rights",
      "Balanced cost of living",
    ],
    tests: "IELTS / PTE",
    image: "/New%20Zealand.jpg",
  },
  {
    slug: "europe",
    name: "Europe",
    flag: "EU",
    tier: "secondary",
    blurb:
      "Low-tuition and English-taught degrees across Germany, France, Poland, Malta and the Baltics with Schengen mobility.",
    intakes: "Winter & Summer semesters",
    work: "20 hrs / week (varies by country), 9-18 months job-seeker visa",
    highlights: [
      "Low or no tuition options",
      "Blocked account & finance guidance",
      "Schengen travel access",
    ],
    tests: "IELTS / PTE / Duolingo",
    image: "/Europe.jpg",
  },
  {
    slug: "japan",
    name: "Japan",
    flag: "JP",
    tier: "secondary",
    blurb:
      "Language school to university and vocational pathways, with part-time work and one of Asia's strongest job markets.",
    intakes: "April, July, October, January",
    work: "28 hrs / week with permission",
    highlights: [
      "JLPT N5-N3 preparation in-house",
      "Language school placement",
      "Student dormitory support",
    ],
    tests: "JLPT / NAT-TEST",
    image: "/Japan.jpg",
  },
];

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

export const stats = [
  { value: "3,500+", label: "Students counselled" },
  { value: "98%", label: "Visa success rate" },
  // Kept in step with the `countries` array above: seven entries, seven here.
  { value: "7", label: "Study destinations" },
  { value: "12+", label: "Years of guidance" },
];

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

export type Advantage = {
  title: string;
  detail: string;
  /**
   * Lucide glyph name. Kept as a string so this file stays free of React
   * imports; the name-to-component map lives in the view that renders icons.
   */
  icon: "scale" | "school" | "file-check" | "user-round" | "badge-check" | "life-buoy";
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
