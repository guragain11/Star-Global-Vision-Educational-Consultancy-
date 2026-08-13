/**
 * Editable content: blog posts and success stories.
 *
 * These records live in Supabase and are managed from /admin. The arrays below
 * are the seed/fallback content: they render whenever Supabase is not
 * configured yet, or while a live request is still in flight, so the site is
 * never blank.
 */

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** Body text. Blank lines separate paragraphs; see `renderRichText`. */
  content: string;
  category: string;
  author: string;
  cover_image: string | null;
  /** ISO date string, e.g. "2026-05-14". */
  published_at: string;
  published: boolean;
};

export type SuccessStory = {
  id: string;
  slug: string;
  student_name: string;
  country: string;
  university: string;
  course: string;
  intake: string;
  quote: string;
  /** Longer narrative shown on the story detail page. */
  story: string;
  photo: string | null;
  published_at: string;
  published: boolean;
  featured: boolean;
};

export type TeamMember = {
  id: string;
  name: string;
  designation: string;
  department: string;
  photo: string | null;
  email: string;
  phone: string;
  bio: string;
  sort_order: number;
  published: boolean;
};

export const blogCategories = [
  "Visa Guidance",
  "Test Preparation",
  "Scholarships",
  "Destination Guide",
  "Student Life",
  "Documentation",
] as const;

export const seedBlogPosts: BlogPost[] = [
  {
    id: "seed-1",
    slug: "student-visa-checklist-nepal-2026",
    title: "The complete student visa document checklist for Nepali applicants",
    excerpt:
      "Every paper an embassy will ask for, academic, financial and personal, with the mistakes that cause most refusals from Nepal.",
    category: "Documentation",
    author: "Star Global Vision Counselling Team",
    cover_image: null,
    published_at: "2026-06-18",
    published: true,
    content: `A student visa file is judged on completeness and consistency long before anyone reads your statement of purpose. Most refusals we see from Nepal are not caused by weak grades. They are caused by a missing paper, a mismatched name or a bank balance that appeared last week.

## Academic documents

Start collecting these the moment you decide to apply, because verification from Nepali boards takes time.

- SEE, +2 or Bachelor's transcripts and character certificates
- Provisional and original degree certificates
- Migration certificate where your board requires one
- English test scorecard: IELTS, PTE, Duolingo or a Medium of Instruction letter
- Two academic or professional reference letters on letterhead

## Financial documents

This is where files are won and lost. Embassies do not only check the amount, they check where it came from.

- Bank balance certificate covering at least one year of tuition and living costs
- Bank statement for the last six to twelve months
- Income source evidence: salary, business registration and tax clearance, rent, pension or agriculture income
- Property valuation and ownership papers
- Sponsor's relationship documents and a signed sponsorship declaration
- Education loan sanction letter, if you are financing through a bank

**The single most common mistake:** a large sum deposited days before the balance certificate is issued, with no explanation of its origin. Season your funds and be able to trace every major deposit.

## Personal documents

- Passport valid well beyond your intended course length
- Passport-size photographs to the destination's exact specification
- Birth certificate and citizenship certificate
- Relationship certificate for any sponsor who is not a parent
- Police clearance, and a medical examination where required
- Marriage certificate and dependant papers, if your spouse is applying with you

## Consistency is the whole game

Your name must be spelled identically on your passport, transcripts and bank documents. Your stated course must match your academic background, or your statement of purpose must explain the change convincingly. Your sponsor's income must plausibly support the amount they are sponsoring.

Bring what you have to our Bagbazar office and we will build the checklist for your specific country and university, then check every line of it before it is lodged.`,
  },
  {
    id: "seed-2",
    slug: "ielts-band-7-in-six-weeks",
    title: "From band 6.0 to 7.5 in six weeks: what actually moves your IELTS score",
    excerpt:
      "The four habits our highest-scoring students share, and the practice routines that waste your time.",
    category: "Test Preparation",
    author: "Star Global Vision Language Faculty",
    cover_image: null,
    published_at: "2026-05-30",
    published: true,
    content: `Six weeks is enough to move a full band, but only if you spend those weeks on the right things. Here is what we see work, again and again, in our Bagbazar classrooms.

## Writing: structure beats vocabulary

Students lose marks in Task 2 for essays that never answer the question, not for simple words. Before writing, spend three minutes deciding your position and your two main reasons. Then write four paragraphs and nothing more.

Memorised "high-level" phrases scattered through an unfocused essay score worse than plain English with a clear argument. Examiners reward relevance and coherence first.

## Speaking: record yourself daily

Fifteen minutes a day, recorded and listened back to, will do more than three hours of silent reading. You will hear your own fillers, your flat intonation and the moment you run out of ideas at forty seconds.

In Part 2, extend every answer with a reason and an example. "I enjoy cricket" becomes "I have followed cricket since my school days in Chitwan, mainly because it was the one sport we could play on any open ground."

## Reading: learn to skip

The test rewards locating information, not understanding every sentence. Read the questions first, scan for the keyword, then read only the surrounding lines closely. Practise with a timer from day one, because untimed reading practice builds the wrong habit.

## Listening: predict before you hear

Use the preparation seconds to guess what type of answer each blank needs: a number, a name, a plural noun. Students who predict catch answers that students who merely listen miss entirely.

## A realistic six-week plan

- **Weeks 1-2:** Diagnostic test, then daily skill drills. One full writing task every second day.
- **Weeks 3-4:** Two full-length timed mock tests per week, with feedback on every writing script.
- **Weeks 5-6:** Speaking labs, error correction on your own recurring mistakes, and a final full mock under exam conditions.

Our batches run mornings, days and evenings, with weekly scored mocks and free revision classes until you hit your target band.`,
  },
  {
    id: "seed-3",
    slug: "australia-vs-canada-for-nepali-students",
    title: "Australia or Canada? An honest comparison for Nepali students",
    excerpt:
      "Cost, work rights, visa difficulty and residency pathways compared side by side, without the sales pitch.",
    category: "Destination Guide",
    author: "Star Global Vision Counselling Team",
    cover_image: null,
    published_at: "2026-05-08",
    published: true,
    content: `These two destinations account for most of the enquiries that walk through our door. They suit very different students, so here is the comparison we give in counselling.

## Cost of study

Australian tuition typically runs higher per year, but many courses are shorter. Canadian college diplomas are cheaper up front and often include co-op work terms. Once you add living costs, Sydney and Melbourne sit well above most Canadian cities outside Toronto and Vancouver.

## Work rights while studying

Australia allows 48 hours per fortnight during term, with unlimited hours in scheduled breaks. Canada permits around 24 hours per week off-campus. In practice, hourly wages are higher in Australia, but so is rent.

## After graduation

Australia's post-study work visa runs two to four years depending on your qualification and where you studied, and regional study earns you more time. Canada's Post-Graduation Work Permit runs up to three years and is closely tied to the length of your program.

## Visa difficulty

Canada's SDS route is faster when you meet its conditions, but financial documentation is strict and refusals for weak proof of funds are common. Australia assesses your genuine intention closely, so a coherent study plan and a well-written statement matter more there.

## Residency pathway

Both offer real routes to permanent residency, and both change their rules regularly. Canada's points system rewards work experience and language scores. Australia's skilled migration favours occupations on its demand lists, with extra points for regional study.

## So which one?

**Choose Australia** if you want a shorter master's, higher part-time earnings and are comfortable with a higher total budget.

**Choose Canada** if you want a lower up-front cost, a co-op program that builds local work experience, or a diploma-to-degree pathway.

Neither is universally better. Bring your transcripts and your budget to a counselling session and we will show you the actual numbers for your profile.`,
  },
  {
    id: "seed-4",
    slug: "scholarships-nepali-students-often-miss",
    title: "Seven scholarships Nepali students routinely forget to apply for",
    excerpt:
      "Merit awards, regional bursaries and university-specific grants that go unclaimed because nobody applies.",
    category: "Scholarships",
    author: "Star Global Vision Counselling Team",
    cover_image: null,
    published_at: "2026-04-22",
    published: true,
    content: `Scholarship money is not only for exceptional students. A great deal of it goes unclaimed each year simply because applicants never submit a form.

## 1. University international merit awards

Almost every university abroad sets aside automatic tuition reductions for international students above a certain grade threshold. Many are applied at admission, but only if you tick the box on the application.

## 2. Early-application bursaries

Several institutions discount tuition for students who accept an offer before a deadline. Applying three months early can be worth more than any essay competition.

## 3. Regional study incentives

Australia and Canada both reward students who study outside their largest cities, with lower tuition, lower living costs and extra migration points.

## 4. Department and faculty grants

Engineering, nursing and education faculties often hold their own funds separate from the central scholarship office. These are rarely advertised on the main website, so you have to ask the department directly.

## 5. Country-specific government schemes

Chevening for the U.K, Fulbright for the U.S.A and MEXT for Japan are competitive but open to Nepali applicants. Their deadlines fall much earlier than university deadlines, so calendar them a year ahead.

## 6. Assistantships at postgraduate level

In the U.S.A especially, teaching and research assistantships can cover a large share of tuition plus a stipend. They are awarded by faculty, so a well-targeted email to a professor whose research matches yours is worth more than a generic application.

## 7. Alumni and community funds

Nepali student associations and diaspora community groups in most destination cities administer small hardship and merit funds. They are modest in size and refreshingly uncompetitive.

Ask us to review your profile against the scholarship lists for your shortlisted universities before you submit. We do this as part of standard counselling, at no cost.`,
  },
  {
    id: "seed-5",
    slug: "first-month-abroad-survival-guide",
    title: "Your first month abroad: a practical survival guide",
    excerpt:
      "Bank account, SIM card, transport pass, part-time work and homesickness, in the order you will need them.",
    category: "Student Life",
    author: "Star Global Vision Pre-Departure Team",
    cover_image: null,
    published_at: "2026-03-15",
    published: true,
    content: `The visa is granted, the flight is booked, and suddenly the questions change from paperwork to daily life. Here is the order we tell departing students to tackle things.

## Week one: the essentials

- **SIM card** at the airport or on your first day, because you need a local number for everything else.
- **Bank account.** Many banks let you open one online before you fly; bring your offer letter, passport and address proof.
- **Transport card** for your city. Student concessions exist almost everywhere but usually need your enrolment ID.
- **Register with your university** in person and collect your student card.

## Week two: settling in

Find your nearest South Asian grocery. It will save you money and rescue your cooking. Register with a local doctor or the campus health service before you need one. Walk your route to campus once before your first class so you know how long it takes.

## Week three: money

Start looking for part-time work, but know your visa's hour limit and never exceed it. This is the single fastest way to lose your visa. Campus jobs, libraries and university cafés are the easiest first roles and understand student schedules.

Track your spending for the first month. Almost every student underestimates groceries and overestimates how often they will eat out.

## Week four: the hard part

The homesickness usually arrives once the novelty fades. It is normal and it passes. Two things help more than anything else: a routine, and one person you speak to regularly who is not from home.

Join one club, however small. Say yes to the first invitation you get. Every Nepali student community abroad has a Facebook or WhatsApp group, so ask us and we will connect you to the one in your city before you fly.

## Keep in touch

Our support does not end at the airport. Message us when you land, and again if something goes wrong. A surprising number of problems in the first month have simple answers.`,
  },
  {
    id: "seed-6",
    slug: "visa-interview-questions-and-answers",
    title: "The 12 visa interview questions you will almost certainly be asked",
    excerpt:
      "What the officer is really testing with each question, and how to answer without sounding rehearsed.",
    category: "Visa Guidance",
    author: "Star Global Vision Counselling Team",
    cover_image: null,
    published_at: "2026-02-27",
    published: true,
    content: `A visa interview is short. The officer is testing three things: whether you are a genuine student, whether you can afford the course, and whether you intend to comply with your visa conditions. Every question maps to one of those.

## Questions about your study plan

1. **Why this university?** Name two specific things: a module, a lab, a co-op program. "It is ranked well" is the weakest possible answer.
2. **Why this course?** Connect it to what you have already studied or done at work.
3. **Why not study this in Nepal?** Be specific about what the destination offers that Nepal does not, without disparaging Nepali institutions.
4. **What are your plans after graduation?** Have a real answer that shows you understand your field's job market.

## Questions about money

5. **Who is sponsoring you?** Know their exact occupation and annual income.
6. **What is your sponsor's income?** The number you say must match the number in your file.
7. **How will you pay for living expenses?** Show you know the actual annual cost.
8. **Do you have a loan?** If yes, know the sanctioned amount and the bank.

## Questions about compliance

9. **Do you have relatives in the country?** Answer truthfully, always. Undisclosed relatives found later are far more damaging than disclosed ones.
10. **Do you intend to work?** Acknowledge the legal limit and make clear that work supports living costs, not tuition.
11. **Will you return to Nepal?** Speak about your ties: family, property, career plans.
12. **Have you been refused a visa before?** Disclose it, briefly explain what changed, and move on.

## How to prepare

Answer in your own words. Officers interview hundreds of applicants and can hear a memorised script instantly. A rehearsed answer damages your credibility more than a hesitant honest one.

Know your own file. If you cannot explain a document in your own application, that is the document you will be asked about.

We run mock interviews for every student we process, with the same questions and the same pace as the real thing.`,
  },
];

export const seedSuccessStories: SuccessStory[] = [
  {
    id: "seed-s1",
    slug: "sujata-karki-deakin-australia",
    student_name: "Sujata Karki",
    country: "Australia",
    university: "Deakin University",
    course: "Master of Information Technology",
    intake: "July 2025",
    quote:
      "From my first counselling session to my visa grant, the team explained every step. My documentation was flawless and I got my visa on the first attempt.",
    photo: null,
    published_at: "2026-06-02",
    published: true,
    featured: true,
    story: `I finished my BSc CSIT in Kathmandu and spent almost a year unsure of what to do next. I had heard so many conflicting things about Australia from friends and from agents that I had stopped trusting any of it.

What was different at Star Global Vision was the first meeting. Nobody pushed a university at me. They looked at my transcripts, asked what I could actually afford, and told me plainly which options were realistic and which were not.

## The application

We shortlisted four universities. Deakin came out on top for me because of its industry-based learning units, which mattered more to my counsellor than the ranking tables I had been obsessing over.

My statement of purpose took three drafts. I resented it at the time and I now understand why. The final version explained exactly why an IT master's followed from my CSIT degree and what I wanted to do afterwards.

## Documentation and visa

The financial file was the hardest part. My father is a businessman and his income needed proper documentation: tax clearance, business registration, audited statements. The team gave me a checklist and checked every paper before it went in.

I had my mock interview about ten days before my appointment. The questions were nearly the same as the real ones, so on the day I was calm.

My visa was granted on the first attempt, three weeks after lodgement.

## Now

I am in Melbourne, working part-time at a software firm in Docklands and finishing my final trimester. It went the way it was supposed to, because the file was built properly from the beginning.`,
  },
  {
    id: "seed-s2",
    slug: "bibek-shrestha-leeds-uk",
    student_name: "Bibek Shrestha",
    country: "U.K",
    university: "University of Leeds",
    course: "MSc Data Science and Analytics",
    intake: "September 2025",
    quote:
      "Their SOP guidance made a huge difference. I also took IELTS classes here and moved from 6.0 to 7.5 in six weeks.",
    photo: null,
    published_at: "2026-05-20",
    published: true,
    featured: true,
    story: `My first IELTS attempt gave me a 6.0 with writing at 5.5, which closed the door on most of the universities I wanted. I nearly gave up on the U.K entirely.

## Getting the score

I joined the evening IELTS batch at Star Global Vision mostly because it was in the same building where my application was being handled. The diagnostic test showed my problem immediately: I was writing long essays that never directly answered the question.

Six weeks of structured practice, a scored mock every week and detailed feedback on every writing script took me to an overall 7.5, with 7.0 in writing. That score changed which universities were available to me.

## The application

Leeds was ambitious for my profile. My counsellor did not talk me out of it. She told me what the application would need to be to succeed, which meant a statement of purpose that explained my engineering background in terms a data science admissions tutor would recognise.

We rewrote it four times. The offer came six weeks later.

## Visa and arrival

The U.K financial requirement is precise about the 28-day maturity period, and this is where I have seen friends fail. My file was prepared with the dates mapped out in advance. CAS issued, visa granted, no complications.

I am now in Leeds, halfway through my master's, and applying for the Graduate Route to stay on and work afterwards.`,
  },
  {
    id: "seed-s3",
    slug: "anisha-gurung-conestoga-canada",
    student_name: "Anisha Gurung",
    country: "Canada",
    university: "Conestoga College",
    course: "Business Administration (Marketing)",
    intake: "January 2026",
    quote:
      "They were honest about my budget and shortlisted colleges that actually fit me. The GIC and finance support was very organised.",
    photo: null,
    published_at: "2026-04-11",
    published: true,
    featured: true,
    story: `I came in with a modest budget and a +2 in management, and I had already been told by two other consultancies that Canada was out of reach for me.

## An honest shortlist

The counselling session at Star Global Vision started with numbers. We went through tuition, living costs, the GIC amount and what my family could raise. Then we built a shortlist of colleges that fit that number, rather than a list of universities I would have to withdraw from later.

Conestoga's co-op marketing program was on that list because the work terms would help with living costs and give me Canadian experience.

## The SDS file

The GIC process was explained to me step by step: which bank, what documents, what timeline. My proof of funds was organised months before lodgement rather than assembled in a panic.

My study permit came through the SDS route without a single query.

## Now

I am in Kitchener, in my second semester, and my first co-op term starts in the spring. What I appreciated most was being told the truth about my budget at the start. It would have been easy to sell me something more expensive.`,
  },
  {
    id: "seed-s4",
    slug: "rojan-tamang-tokyo-japan",
    student_name: "Rojan Tamang",
    country: "Japan",
    university: "Tokyo Japanese Language School",
    course: "Japanese Language (JLPT pathway)",
    intake: "April 2025",
    quote:
      "I started from zero Japanese and cleared JLPT N5 with their morning class. The teachers made kanji feel easy.",
    photo: null,
    published_at: "2026-03-28",
    published: true,
    featured: false,
    story: `I knew nothing about Japan except that I wanted to go there. No language, no idea how the school system worked, no plan.

## Learning the language first

The morning Japanese class ran alongside my application. Starting from hiragana in January, I cleared JLPT N5 by the middle of the year. Kanji was the part I dreaded and it turned out to be the part I enjoyed most, because the teachers taught it by radicals and stories rather than pure memorisation.

## Application and visa

Japan's Certificate of Eligibility process is document-heavy and unforgiving about deadlines. My file went in early, which mattered, because language school intakes fill quickly.

The financial documentation needed my uncle as sponsor, with relationship papers and his income evidence. All of it was checked before submission.

## Now

I am in Tokyo, studying at the language school in the mornings and working part-time at a convenience store in the evenings, within my permitted hours. Next year I plan to move on to a vocational college in IT.

Arriving with N5 already cleared made the first months far less frightening than they would have been otherwise.`,
  },
  {
    id: "seed-s5",
    slug: "prakriti-adhikari-asu-usa",
    student_name: "Prakriti Adhikari",
    country: "U.S.A",
    university: "Arizona State University",
    course: "BS Computer Science",
    intake: "Fall 2025",
    quote:
      "The visa interview mock sessions were exactly like the real thing. I felt calm and confident on the day.",
    photo: null,
    published_at: "2026-02-14",
    published: true,
    featured: true,
    story: `The F-1 interview was the part that frightened me. Everything else, the SAT, the applications, the essays, felt like schoolwork. Standing in front of a consular officer did not.

## Building the application

We applied to six universities across a range of selectivity. ASU came through with a merit scholarship that made the cost workable, which my counsellor had flagged as likely when we built the list.

The essays were mine, but the structure came from long conversations about what I actually wanted to study and why. That turned out to be excellent preparation for the interview, because I had already articulated my reasons out loud many times.

## The interview

I did three mock interviews. The first one went badly. I gave memorised answers and was told so directly. By the third, I was answering in my own words.

The real interview lasted under four minutes. I was asked why ASU, who was funding me, and what my father did. I answered without thinking hard about it, because I actually knew my own file.

Visa approved.

## Now

I am in Tempe, in my second year, and working as an undergraduate teaching assistant for an intro programming course. The scholarship renewed for this year.`,
  },
  {
    id: "seed-s6",
    slug: "nabin-thapa-auckland-new-zealand",
    student_name: "Nabin Thapa",
    country: "New Zealand",
    university: "University of Auckland",
    course: "Master of Engineering Studies",
    intake: "February 2026",
    quote:
      "Genuine people who never over-promised. They kept following up with the university until my offer arrived.",
    photo: null,
    published_at: "2026-01-30",
    published: true,
    featured: false,
    story: `I had a civil engineering degree from Pokhara and four years of site experience, and I wanted a master's that would count professionally rather than just academically.

## Choosing New Zealand

Australia was the obvious choice and I had assumed I would go there. My counsellor raised New Zealand instead: smaller cohorts, lower total cost, and an engineering qualification recognised through the Washington Accord.

The University of Auckland application was slow. My transcripts needed additional verification and the department took weeks to respond. What I remember is that I did not have to chase it. The office followed up every week and told me what was happening even when nothing was.

## Documentation

My work experience needed proper documentation: employment letters, salary certificates, project records. That experience strengthened both my application and my visa case, but only because it was documented properly rather than just mentioned.

## Now

I am in Auckland, one semester in, and doing a research project with a geotechnical firm in the city. It was the right recommendation, and it was not the one I walked in expecting.`,
  },
];

/** Destination options offered in the success-story filter and admin editor. */
export const destinationNames = [
  "Australia",
  "U.S.A",
  "Canada",
  "U.K",
  "New Zealand",
  "Europe",
  "Japan",
] as const;

/** Department options offered in the team member admin editor. */
export const teamDepartments = [
  "Counselling",
  "Documentation",
  "Front Desk",
  "Language Instruction",
  "Operations",
  "Management",
] as const;

export const seedTeamMembers: TeamMember[] = [
  {
    id: "seed-tm1",
    name: "Ram Sharan Thapa Kshetri",
    designation: "Senior Counsellor",
    department: "Counselling",
    photo: null,
    email: "",
    phone: "",
    bio: "Experienced counsellor specialising in Australian and Canadian admissions with over a decade of guiding Nepali students to top universities.",
    sort_order: 1,
    published: true,
  },
  {
    id: "seed-tm2",
    name: "Pramita Timalsina",
    designation: "Documentation Officer",
    department: "Documentation",
    photo: null,
    email: "",
    phone: "",
    bio: "Ensures every student file meets embassy standards with meticulous attention to documentation accuracy and completeness.",
    sort_order: 2,
    published: true,
  },
  {
    id: "seed-tm3",
    name: "Niruja Bogati",
    designation: "Front Desk Officer",
    department: "Front Desk",
    photo: null,
    email: "",
    phone: "",
    bio: "First point of contact for all enquiries, scheduling and student coordination.",
    sort_order: 3,
    published: true,
  },
  {
    id: "seed-tm4",
    name: "Sima Pokhrel",
    designation: "PTE Instructor",
    department: "Language Instruction",
    photo: null,
    email: "",
    phone: "",
    bio: "Specialised PTE trainer with a track record of helping students achieve their target scores in record time.",
    sort_order: 4,
    published: true,
  },
  {
    id: "seed-tm5",
    name: "Sabitri Khatri",
    designation: "Housekeeper",
    department: "Operations",
    photo: null,
    email: "",
    phone: "",
    bio: "Maintains a clean and welcoming environment for students and staff.",
    sort_order: 5,
    published: true,
  },
];
