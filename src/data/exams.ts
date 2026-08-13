/**
 * Exam reference data for the Test Preparation page.
 *
 * Formats, timings and score scales are taken from the official test owners
 * (ielts.org, pearsonpte.com, englishtest.duolingo.com, jlpt.jp) and reflect
 * the current published patterns. Note in particular that Pearson revised the
 * PTE Academic format on 7 August 2025, and the Duolingo English Test replaced
 * Read Aloud / Listen Then Speak with interactive speaking tasks.
 *
 * Anything that a test owner can change without notice (fees, section timings,
 * university cut-offs) is written as an approximate range and paired with the
 * `verify` note rendered on the page. Score targets are the requirements our
 * counsellors see on offer letters, not promises made by the test owner.
 */

export type ExamSection = {
  name: string;
  time: string;
  detail: string;
};

export type Exam = {
  slug: string;
  name: string;
  shortName: string;
  /** One line for the card and the sticky nav. */
  tagline: string;
  /** Who should sit this test rather than one of the others. */
  bestFor: string;
  format: string;
  totalTime: string;
  scale: string;
  results: string;
  validity: string;
  delivery: string;
  sections: ExamSection[];
  /** Typical requirement bands we see on offers, not official cut-offs. */
  targets: { label: string; score: string }[];
  /** What our class does differently for this test. */
  classNotes: string[];
  courseLength: string;
  batches: string;
  accent: string;
};

export const exams: Exam[] = [
  {
    slug: "ielts",
    name: "IELTS Academic",
    shortName: "IELTS",
    tagline: "The most widely accepted test, and the safest choice for a visa file.",
    bestFor:
      "Anyone applying to the U.K, Australia or New Zealand, and anyone who wants one score that no university or embassy will question.",
    format: "Four skills, paper-based or computer-delivered",
    totalTime: "2 hours 45 minutes",
    scale: "Band 0-9, in half bands",
    results: "3-5 days on computer, ~13 days on paper",
    validity: "2 years",
    delivery: "Test centre (Kathmandu), IELTS on Computer or on paper",
    sections: [
      {
        name: "Listening",
        time: "30 min · 40 questions",
        detail:
          "Four recordings (two conversations, two monologues) played once only. On paper you get 10 extra minutes to transfer answers.",
      },
      {
        name: "Reading",
        time: "60 min · 40 questions",
        detail:
          "Three long academic passages from journals, books and newspapers. No extra transfer time, so answers go straight onto the sheet.",
      },
      {
        name: "Writing",
        time: "60 min · 2 tasks",
        detail:
          "Task 1 describes a chart, graph, map or process in 150 words. Task 2 is a 250-word argument essay and carries twice the weight.",
      },
      {
        name: "Speaking",
        time: "11-14 min · 3 parts",
        detail:
          "A face-to-face interview with a real examiner: introduction, a 2-minute long turn from a cue card, then a two-way discussion.",
      },
    ],
    targets: [
      { label: "Most bachelor's programs", score: "6.0 overall, no band under 5.5" },
      { label: "Most master's programs", score: "6.5 overall, no band under 6.0" },
      { label: "Nursing, teaching, law", score: "7.0 overall and above" },
      { label: "U.K student visa (below degree)", score: "IELTS UKVI 5.5 in each skill" },
    ],
    classNotes: [
      "Speaking practised one-to-one with a teacher, never in a group of thirty",
      "Writing Task 2 marked against the four official band descriptors, returned with a band",
      "Full four-skill mock every Saturday under real timing",
    ],
    courseLength: "6 weeks",
    batches: "Morning · Day · Evening",
    accent: "from-primary/12",
  },
  {
    slug: "pte",
    name: "PTE Academic",
    shortName: "PTE",
    tagline: "Computer-scored, fastest results, and predictable if you learn the templates.",
    bestFor:
      "Students who freeze in front of a human examiner, anyone who needs a score inside a week, and Australia and New Zealand applicants.",
    format: "Three timed parts, fully computer-based",
    totalTime: "About 2 hours",
    scale: "10-90 on the Global Scale of English",
    results: "Typically within 48 hours",
    validity: "2 years",
    delivery: "Pearson test centre, computer with headset",
    sections: [
      {
        name: "Speaking & Writing",
        time: "76-84 min",
        detail:
          "Read Aloud, Repeat Sentence, Describe Image, Re-tell Lecture, Answer Short Question, Summarise Written Text and Write Essay, plus the newer Summarize Group Discussion and Respond to a Situation tasks.",
      },
      {
        name: "Reading",
        time: "23-30 min",
        detail:
          "Fill in the blanks, re-order paragraphs and multiple choice. Several tasks are scored for listening or writing as well as reading.",
      },
      {
        name: "Listening",
        time: "29-36 min",
        detail:
          "Summarise Spoken Text, Highlight Correct Summary, Write From Dictation and more. Dictation alone carries a large share of the listening score.",
      },
    ],
    targets: [
      { label: "Most bachelor's programs", score: "50-58 overall" },
      { label: "Most master's programs", score: "58-65 overall" },
      { label: "Competitive universities", score: "65-79 overall" },
      { label: "Rough IELTS equivalence", score: "PTE 58 ≈ IELTS 6.5, PTE 65 ≈ IELTS 7.0" },
    ],
    classNotes: [
      "Every class on scored practice software, so you see the machine's marking, not ours",
      "Write From Dictation bank drilled daily, because it feeds both listening and writing",
      "Template discipline for Describe Image and Re-tell Lecture, then timed repetition",
    ],
    courseLength: "4-6 weeks",
    batches: "Morning · Evening",
    accent: "from-accent/14",
  },
  {
    slug: "duolingo",
    name: "Duolingo English Test",
    shortName: "Duolingo",
    tagline: "One hour, taken at home, and cheap enough to sit twice.",
    bestFor:
      "U.S.A and Canada applicants working to a deadline, and students who need a score before the next IELTS date in Kathmandu.",
    format: "Adaptive computer test taken at home",
    totalTime: "About 1 hour",
    scale: "10-160 overall, plus four subscores",
    results: "Usually within 48 hours",
    validity: "2 years",
    delivery: "At home on your own laptop, webcam and ID required",
    sections: [
      {
        name: "Setup & ID check",
        time: "5 min · not scored",
        detail:
          "Identity verification to camera, an interface walkthrough and checks on your microphone, camera and connection.",
      },
      {
        name: "Adaptive test",
        time: "45 min · scored",
        detail:
          "Read and Complete, Interactive Reading, Interactive Listening, Speak About the Photo and interactive speaking. Difficulty rises when you are right and drops when you are wrong, so there is no fixed question count.",
      },
      {
        name: "Writing & speaking sample",
        time: "10 min · ungraded",
        detail:
          "Open prompts that are not scored but are sent to every university with your result, so they still get judged, just by a person.",
      },
    ],
    targets: [
      { label: "Many U.S bachelor's programs", score: "105-115" },
      { label: "Many U.S master's programs", score: "115-125" },
      { label: "Competitive universities", score: "130+" },
      { label: "Rough IELTS equivalence", score: "DET 115 ≈ IELTS 6.5, DET 125 ≈ IELTS 7.0" },
    ],
    classNotes: [
      "We check your room, laptop and internet against the rules before you book",
      "Adaptive strategy: how the engine reads an early wrong answer, and why rushing costs you",
      "The ungraded video sample rehearsed properly, because admissions officers do watch it",
    ],
    courseLength: "3 weeks",
    batches: "Flexible batches",
    accent: "from-primary/10",
  },
  {
    slug: "jlpt",
    name: "Japanese (JLPT N5 to N3)",
    shortName: "Japanese",
    tagline: "The language first, then the language school placement.",
    bestFor:
      "Students heading to a Japanese language school or vocational college, where N5 is the usual entry expectation.",
    format: "Multiple choice, paper-based, twice a year",
    totalTime: "N5 about 90 min · N4 about 115 min · N3 about 140 min",
    scale: "0-180 total, with a minimum in every section",
    results: "About two months, via the JEES portal",
    validity: "No expiry",
    delivery: "Official test centre, held in July and December",
    sections: [
      {
        name: "Language knowledge: vocabulary",
        time: "20-30 min",
        detail:
          "Kanji reading, orthography, word formation and usage in context. At N5 the reading is hiragana, katakana and around 100 basic kanji.",
      },
      {
        name: "Language knowledge: grammar & reading",
        time: "40-70 min",
        detail:
          "Sentence grammar, sentence composition, text grammar and comprehension passages that get noticeably longer at N3.",
      },
      {
        name: "Listening",
        time: "30-40 min",
        detail:
          "Task comprehension, point comprehension, verbal expression and quick response, played once, at natural conversational speed.",
      },
    ],
    targets: [
      { label: "Language school in Japan", score: "N5, the standard entry expectation" },
      { label: "Vocational college", score: "N3 or above" },
      { label: "Part-time work with confidence", score: "N4 to N3" },
      { label: "Sectional rule", score: "Every section must clear its own minimum to pass" },
    ],
    classNotes: [
      "Kanji drilled by stroke and radical, not by rote lists",
      "Conversation practice with the keigo you need at a part-time job",
      "Culture and etiquette orientation before departure, taught alongside the grammar",
    ],
    courseLength: "3-6 months",
    batches: "Morning · Day",
    accent: "from-accent/12",
  },
];

/** Quick "which test should I take?" answers used in the chooser block. */
export const chooser = [
  {
    situation: "You want the widest acceptance",
    answer: "IELTS",
    why: "No university, embassy or professional body will turn it away.",
  },
  {
    situation: "You need a score fast",
    answer: "PTE or Duolingo",
    why: "Both return results in about 48 hours; IELTS on paper can take two weeks.",
  },
  {
    situation: "Speaking to a person makes you freeze",
    answer: "PTE",
    why: "You speak to a computer, so nerves about an examiner's reaction disappear.",
  },
  {
    situation: "Budget is tight",
    answer: "Duolingo",
    why: "A fraction of the IELTS or PTE fee, and cheap enough to retake if needed.",
  },
  {
    situation: "You are going to Japan",
    answer: "JLPT",
    why: "English tests are irrelevant for a language school. N5 is what they ask for.",
  },
  {
    situation: "Your grammar is weak but you read well",
    answer: "IELTS",
    why: "Half-band scoring is more forgiving than PTE's integrated marking.",
  },
];

/** How the classes are run, for the method section. */
export const method = [
  {
    title: "Diagnostic before enrolment",
    detail:
      "You sit a full timed mock in your first week. We show you the band you would get today and the realistic band for your target date, before you pay for a course you may not need.",
  },
  {
    title: "Batches capped at 12",
    detail:
      "Small enough that every student speaks in every class. Speaking is the skill Nepali students lose marks on most, and it cannot be taught to a room of forty.",
  },
  {
    title: "Weekly full-length mock",
    detail:
      "Every Saturday, full timing, real conditions. Your score is tracked on a chart so you can see the trend rather than guess at it.",
  },
  {
    title: "Writing returned with a band",
    detail:
      "Every essay is marked against the official descriptors and handed back with the band and the two things to fix. Not a tick and a smiley face.",
  },
  {
    title: "Repeat free until you hit target",
    detail:
      "If you complete the course, attend the mocks and still miss your target band, you repeat the next batch at no cost. We would rather teach you twice than send a weak file.",
  },
  {
    title: "Teachers and counsellors share your file",
    detail:
      "Classes run in the same office that files your application, so your counsellor knows your mock scores before shortlisting universities for you.",
  },
];

export const testFaqs = [
  {
    q: "Which test should I take: IELTS, PTE or Duolingo?",
    a: "IELTS if you want a score that nobody questions, especially for the U.K. PTE if you want computer marking and results in two days, which suits Australia and New Zealand well. Duolingo if you are applying to the U.S.A or Canada on a deadline and want a cheaper, one-hour test at home. Sit our free diagnostic and we will tell you which one your current level suits best. The right test can be worth half a band on its own.",
  },
  {
    q: "How long do I need to prepare?",
    a: "From a genuine 5.5 to a 6.5 takes most students six weeks of daily classes plus homework. From 6.0 to 7.0 takes longer, because the last half band is grammar range and vocabulary precision, not test tricks. If you are starting below 5.0 we will tell you that you need a foundation month first rather than selling you the exam course.",
  },
  {
    q: "What are the class timings?",
    a: "Morning batches from 6:00 AM, day batches through the working day, and evening batches after 5:00 PM, Sunday to Friday. Most students take a 90-minute class five days a week. Japanese classes run morning and day only, because they need longer sessions.",
  },
  {
    q: "Do I have to apply through you if I take classes here?",
    a: "No. Plenty of students take classes with us and apply somewhere else, or apply directly themselves. There is no bundling and no pressure. If you do choose to apply with us your counsellor gets your mock scores, which makes the shortlist sharper, but that is a benefit rather than a condition.",
  },
  {
    q: "What happens if I do not get my target score?",
    a: "If you completed the course and attended the mocks, you repeat the next batch free. We also sit down and read your actual score report with you: a 5.5 caused by writing needs a completely different plan from a 5.5 caused by listening, and most students never get that analysis.",
  },
  {
    q: "How big are the classes and are mock tests included?",
    a: "Batches are capped at 12 students. Every mock test is included in the course fee: weekly full-length papers plus sectional practice during class. For PTE, mocks run on scored practice software so the score comes from the machine rather than from a teacher's estimate.",
  },
  {
    q: "Can I get a university offer without an English test at all?",
    a: "Sometimes. Many universities accept a Medium of Instruction letter from your college, or run their own internal English test. We will tell you which of your shortlisted universities allow it. But be clear about the trade-off: it narrows your choices, it rarely helps at visa stage, and a good IELTS or PTE score strengthens the whole file.",
  },
  {
    q: "How much do the tests themselves cost?",
    a: "Test fees are paid to the test owner, not to us, and they change. IELTS and PTE sit in a similar range, Duolingo costs a fraction of either, and the JLPT is the cheapest of the four. We show you the current fee in writing before you register, and we never add a markup on it.",
  },
];
