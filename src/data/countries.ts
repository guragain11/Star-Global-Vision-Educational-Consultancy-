/**
 * Study destinations.
 *
 * These records live in Supabase (`public.countries`) and are managed from
 * /admin. The array below is the seed/fallback content: it renders whenever
 * Supabase is unconfigured, while a live request is in flight, or while the
 * table is still empty, so the site is never without a destination list.
 *
 * One list drives /countries, every /countries/<slug> page, the header's
 * Destinations menu and the enquiry dropdowns, so they cannot drift apart.
 */

export type Country = {
  id: string;
  slug: string;
  name: string;
  /** Two-letter code for the flag chip in the nav. */
  flag: string;
  /** "primary" marks the destinations we place the most students in. */
  tier: "primary" | "secondary";
  /** One or two sentences, used on cards and in the comparison table. */
  blurb: string;
  /** Long-form description for the detail page. Markdown-ish; see RichText. */
  overview: string;
  highlights: string[];
  intakes: string;
  work: string;
  tests: string;
  tuition: string;
  cost_living: string;
  /** Entry and visa requirements for the detail page. Markdown-ish. */
  requirements: string;
  universities: string[];
  /**
   * Destination photo. Seed rows point at files in public/ supplied with the
   * brand assets, so they are spelled exactly as they sit on disk and the space
   * in "New Zealand.jpg" is percent-encoded. Uploads from /admin are absolute
   * Supabase storage URLs instead.
   *
   * Null on purpose for the destinations that came without a photo: those fall
   * back to the branded `CoverFallback` panel, the same one the blog and story
   * cards use, rather than repeating one stock European scene eight times.
   */
  image: string | null;
  sort_order: number;
  published: boolean;
};

export const countryTiers = ["primary", "secondary"] as const;

export const seedCountries: Country[] = [
  {
    id: "seed-c1",
    slug: "australia",
    name: "Australia",
    flag: "AU",
    tier: "primary",
    sort_order: 1,
    published: true,
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
    tuition: "AUD 25,000 - 45,000 a year",
    cost_living: "AUD 24,000 - 29,000 a year",
    universities: [
      "University of Melbourne",
      "Deakin University",
      "RMIT University",
      "Griffith University",
      "University of Technology Sydney",
      "La Trobe University",
    ],
    image: "/Australia.jpg",
    overview: `Australia takes more Nepali students than any other destination we handle, and for good reason. The degrees are recognised everywhere, the post-study work visa is long enough to build a real career, and there is an established Nepali community in every major city that makes the first year considerably easier.

## Who it suits

Australia works best if you want a shorter master's, expect to work part-time while you study, and can support a higher total budget than Europe or Asia would need. Wages are high enough that twenty-four hours a fortnight covers a meaningful share of living costs, though it will never fund your tuition.

## Universities and pathways

The Group of Eight are the research-intensive universities, and they are the right target if your academics are strong. Beyond them, the technology and metropolitan universities often have better industry placement rates in practical fields like IT, nursing and construction management.

TAFE and vocational providers are a legitimate route rather than a fallback. A diploma that articulates into the second year of a bachelor's degree can cut both cost and entry requirements, and trade qualifications sit well on Australia's skilled occupation lists.

## Regional study is worth considering

Studying outside Sydney, Melbourne and Brisbane earns you an extra year of post-study work and additional points toward skilled migration, on top of lower rent. Adelaide, Perth, Hobart and the regional campuses of large universities all qualify.

## The honest part

Rent in Sydney and Melbourne is the single biggest shock for students arriving from Kathmandu. Budget realistically before you commit, and consider a share house for your first six months. Genuine Student requirements also mean your study plan has to be coherent: an unrelated course after an unrelated degree invites questions you need a good answer for.`,
    requirements: `## Academic entry

- **Bachelor's:** +2 or A-Levels completed, with grades that vary by university
- **Master's:** a recognised bachelor's degree, usually 50-60% or higher
- Some courses ask for relevant work experience, particularly MBA programmes

## English

IELTS 6.0-6.5 overall with no band under 6.0 is the common requirement, and PTE or Duolingo are widely accepted. Higher scores are needed for nursing, teaching and some health courses.

## Financial evidence

You must show tuition for the first year plus living costs of roughly AUD 29,710 a year, along with travel money. Funds need a clear, documented source: a large deposit that appeared last month invites a refusal.

## Visa

The Student visa (subclass 500) requires a Confirmation of Enrolment, Overseas Student Health Cover for your whole stay, and a Genuine Student statement explaining your study plan and your reasons for choosing the course and Australia.

We prepare the financial file, the Genuine Student statement and the health cover together, and check every document before lodgement.`,
  },
  {
    id: "seed-c2",
    slug: "new-zealand",
    name: "New Zealand",
    flag: "NZ",
    tier: "secondary",
    sort_order: 2,
    published: true,
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
    tuition: "NZD 22,000 - 37,000 a year",
    cost_living: "NZD 20,000 - 25,000 a year",
    universities: [
      "University of Auckland",
      "University of Otago",
      "Victoria University of Wellington",
      "University of Canterbury",
      "Massey University",
      "Auckland University of Technology",
    ],
    image: "/New%20Zealand.jpg",
    overview: `New Zealand is smaller than Australia in every sense, and that is mostly the point. All eight universities are government-funded and quality-assured, class sizes are smaller, and students who want to be known by their lecturers rather than lost in a cohort of four hundred tend to prefer it.

## Who it suits

It fits students who want a genuine Western degree at a lower total cost than Australia, and who value quality of life over big-city intensity. Engineering, agriculture, IT and healthcare are particular strengths.

## Work and staying on

Twenty hours a week during term, full-time in scheduled breaks, and up to three years of post-study work depending on your qualification level and where you studied. Master's and doctoral students get partner work rights, which is a decisive advantage for married applicants.

## The honest part

The job market is small. A three-year post-study work visa is only useful if your field is on the Green List or in genuine demand, so check that before you commit to a course. Auckland rent has risen sharply, and Wellington and Christchurch are noticeably cheaper.`,
    requirements: `## Academic entry

- **Bachelor's:** +2 completed with solid grades
- **Master's:** a recognised bachelor's in a related field
- Postgraduate diplomas offer a route in for profiles that fall short of direct master's entry

## English

IELTS 6.0 overall with no band below 5.5 for undergraduate study, 6.5 with no band below 6.0 for postgraduate. PTE is accepted.

## Financial evidence

NZD 20,000 a year for living costs on top of tuition, or NZD 1,667 a month for courses under nine months. Immigration New Zealand looks closely at how genuine your study intention is, so your course choice needs to follow logically from what you have already done.

## Visa

A Fees Free student visa application needs your offer of place, evidence of funds, and a medical and police clearance for longer stays.`,
  },
  {
    id: "seed-c3",
    slug: "canada",
    name: "Canada",
    flag: "CA",
    tier: "primary",
    sort_order: 3,
    published: true,
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
    tuition: "CAD 15,000 - 35,000 a year",
    cost_living: "CAD 15,000 - 20,000 a year",
    universities: [
      "University of Toronto",
      "Conestoga College",
      "Seneca Polytechnic",
      "Trent University",
      "University of Windsor",
      "Humber College",
    ],
    image: "/Canada.jpg",
    overview: `Canada has been the residency-friendly option for a decade, and it remains the destination of choice for students whose plan extends past graduation. Tuition is lower than Australia's, the co-op system builds Canadian work experience into the degree itself, and the Post-Graduation Work Permit leads into an immigration system that rewards exactly that experience.

## Who it suits

Students on a tighter budget, and students who want work experience as part of their qualification rather than after it. Business, IT, engineering technology, healthcare support and skilled trades all place well.

## Colleges are not a lesser option

Ontario's colleges and polytechnics — Conestoga, Seneca, Humber — often have stronger employment outcomes than mid-tier universities, because their programmes are built around co-op terms and employer demand. A two-year diploma with two co-op placements can be a better investment than a three-year degree without any.

## Recent policy changes matter

Canada has tightened study permits considerably: provincial attestation letters are now required, the proof-of-funds threshold rose, and PGWP eligibility is tied to field of study for college programmes. This is exactly the sort of thing that changes between when you start researching and when you apply, so check the current rules with us rather than relying on a blog post.

## The honest part

Refusals for weak proof of funds are the most common failure we see, and the SDS route is no longer the shortcut it once was. Winter is genuinely hard for the first year. And a PGWP is only worth having if your programme still qualifies for one under the current rules.`,
    requirements: `## Academic entry

- **Diploma / advanced diploma:** +2 completed, typically 50% and above
- **Bachelor's:** +2 with strong grades
- **Post-graduate diploma / master's:** a recognised bachelor's degree

## English

IELTS 6.0 overall with no band below 6.0 for the direct route at most colleges. Universities often want 6.5. PTE and Duolingo are accepted by many institutions.

## Financial evidence

A Guaranteed Investment Certificate of CAD 20,635 for living costs, plus first-year tuition paid or evidenced. Proof of funds requirements rose in 2024 and continue to move, so treat any figure you read elsewhere as provisional.

## Visa

You need a Letter of Acceptance, a Provincial Attestation Letter from the province of your institution, a GIC, and a medical examination. Biometrics are required.

We handle the GIC process end to end, and organise proof of funds months before lodgement rather than in the week before.`,
  },
  {
    id: "seed-c4",
    slug: "usa",
    name: "USA",
    flag: "US",
    tier: "primary",
    sort_order: 4,
    published: true,
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
    tuition: "USD 20,000 - 55,000 a year",
    cost_living: "USD 12,000 - 20,000 a year",
    universities: [
      "Arizona State University",
      "University of Texas at Arlington",
      "Northeastern University",
      "Illinois Institute of Technology",
      "University of North Texas",
      "Community college transfer pathways",
    ],
    image: "/Usa.avif",
    overview: `The United States has more universities than the rest of this page combined, which is both its strength and the reason students find it overwhelming. Somewhere in four thousand institutions is one that fits your profile and your budget — the work is finding it.

## Who it suits

Students with strong academics who want scholarship money, and students in STEM fields who want the three years of work authorisation that OPT plus the STEM extension provides. It is also the best destination for research-minded postgraduates, because assistantships can cover most of the cost.

## Money is more negotiable than people think

American universities discount heavily. Merit scholarships, need-based aid at private institutions, and graduate assistantships that waive tuition and pay a stipend are all real. A private university with a USD 55,000 sticker price can end up cheaper than a state university at USD 30,000. Apply to a range and compare the actual offers.

## Community college transfer

Two years at a community college, then transfer into the third year of a state university, and the degree certificate is identical. For students whose budget will not stretch to four years at a university, this is the route that works.

## The honest part

The F-1 interview is a genuine hurdle and it is short — often under four minutes. You will be asked why this university, who is funding you, and what you plan to do afterwards, and memorised answers are transparent to an officer who does hundreds of these a day. We run mock interviews for every student, because that is the part that decides the outcome.`,
    requirements: `## Academic entry

- **Bachelor's:** +2 completed; SAT is optional at many universities now but still helps scholarships
- **Master's:** a four-year bachelor's degree is preferred; three-year degrees are accepted case by case
- GRE or GMAT for some graduate programmes, waived at many others

## English

IELTS 6.0-6.5 or above, TOEFL 79-90, PTE 53-58, or Duolingo 105-120. Requirements vary widely between institutions.

## Financial evidence

An I-20 is issued once you evidence one year of tuition plus living costs. Funds must be liquid and traceable, and your sponsor's income has to plausibly support the amount they are sponsoring.

## Visa

Pay the SEVIS fee, complete the DS-160, then attend an F-1 interview at the embassy in Kathmandu. You are being assessed on three things: that you are a genuine student, that you can afford the course, and that you intend to comply with your visa conditions.

Disclose any previous refusal and any relatives in the United States. Undisclosed facts discovered later are far more damaging than disclosed ones.`,
  },
  {
    id: "seed-c5",
    slug: "uk",
    name: "UK",
    flag: "GB",
    tier: "primary",
    sort_order: 5,
    published: true,
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
    tuition: "GBP 14,000 - 30,000 a year",
    cost_living: "GBP 12,000 - 15,000 a year",
    universities: [
      "University of Leeds",
      "Coventry University",
      "University of Birmingham",
      "University of Glasgow",
      "Northumbria University",
      "University of Hertfordshire",
    ],
    image: "/uk.avif",
    overview: `The one-year master's is the reason most Nepali students choose Britain. One year of tuition and one year of living costs instead of two makes the total cost competitive with destinations that look cheaper per year, and you are back in the job market twelve months sooner.

## Who it suits

Postgraduates above all. If you have a bachelor's degree and want a recognised master's without committing two years and two years of living costs, the UK is hard to beat. The Graduate Route then gives you two years to work in any job, with no sponsorship needed.

## Russell Group and beyond

The Russell Group are the research-intensive universities and carry the most weight. But the modern universities — Coventry, Northumbria, Hertfordshire — often have better teaching support for international students, more January intakes, and lower fees, and their degrees are still recognised globally.

## The financial rules are precise

The UK is stricter than anywhere else on how your money is documented. Funds must sit in a qualifying account for 28 consecutive days, and the closing balance must be dated within 31 days of your application. Miss either and the application is refused regardless of how much money you have. This is where we see students fail, and it is entirely avoidable with planning.

## The honest part

The Immigration Health Surcharge and visa fees add a significant amount on top of tuition. Dependants are no longer permitted for most taught master's courses. And the Graduate Route is two years of any work, not two years of graduate-level work, so what you do with it is on you.`,
    requirements: `## Academic entry

- **Bachelor's:** +2 with good grades, or a foundation year for profiles just short
- **Master's:** a bachelor's degree, usually 55-60% or above depending on the university

## English

IELTS for UKVI is the safest option: 6.0-6.5 overall with no band below 5.5-6.0. PTE UKVI is accepted by most universities. Some accept a Medium of Instruction letter, though it narrows your choices.

## Financial evidence

Tuition plus GBP 1,483 a month for living costs in London, GBP 1,136 elsewhere, for up to nine months. **The 28-day rule is absolute:** the funds must be held for 28 consecutive days and the statement dated within 31 days of applying.

## Visa

Your university issues a Confirmation of Acceptance for Studies once you accept the offer and pay a deposit. Then comes the Student visa application, the Immigration Health Surcharge, biometrics and a tuberculosis test at an approved clinic in Kathmandu.

We map the 28-day maturity window against your application date before anything is lodged.`,
  },
  {
    id: "seed-c6",
    slug: "finland",
    name: "Finland",
    flag: "FI",
    tier: "secondary",
    sort_order: 6,
    published: true,
    blurb:
      "English-taught bachelor's and master's degrees with scholarships that often cover half the tuition, and a residence permit granted for your whole course rather than one year at a time.",
    intakes: "August / September, January",
    work: "30 hrs / week average during term, 2 yrs job-seeking permit after",
    highlights: [
      "Universities of applied sciences with work placements built in",
      "50-100% tuition scholarships for strong applicants",
      "Residence permit issued for the full length of the degree",
    ],
    tests: "IELTS / PTE / TOEFL",
    tuition: "EUR 8,000 - 18,000 a year, often halved by scholarship",
    cost_living: "EUR 8,000 - 11,000 a year",
    universities: [
      "University of Helsinki",
      "Aalto University",
      "LAB University of Applied Sciences",
      "Metropolia University of Applied Sciences",
      "University of Turku",
      "Tampere University",
    ],
    image: null,
    overview: `Finland is the most underrated destination on this page. Tuition scholarships of fifty to a hundred percent are routine rather than exceptional, the residence permit is granted for the entire length of your degree instead of renewed annually, and the universities of applied sciences build paid work placements into the curriculum.

## Who it suits

Students with strong academics and a modest budget. If your grades are good enough to win a scholarship, Finland becomes one of the cheapest ways to get a European degree, and the two-year job-seeking permit afterwards is longer than most of Europe offers.

## Two kinds of institution

Research universities are academic and lead naturally to master's and doctoral study. Universities of applied sciences are practical, with compulsory work placements and closer employer ties. For most Nepali students the applied sciences route is the better fit, because the placement is both work experience and income.

## The application is centralised and early

Applications go through Studyinfo, one portal for every institution, and the January deadline for the autumn intake is genuinely final. Missing it means waiting a year. Entrance examinations are common and are usually taken online.

## The honest part

Finnish is not needed for your degree but it is needed for most part-time work outside student jobs, which is the main constraint on earning while you study. Winter darkness is a real adjustment. And the scholarship is usually conditional on passing a minimum number of credits each year, so it can be lost.`,
    requirements: `## Academic entry

- **Bachelor's:** +2 completed, plus an entrance examination for most programmes
- **Master's:** a relevant bachelor's degree; applied sciences master's often require two years of work experience

## English

IELTS 6.0-6.5, TOEFL 79-92, or PTE 54-62. Some institutions accept a Medium of Instruction letter from your previous degree.

## Financial evidence

EUR 6,720 a year in an account in your own name, or evidence of a scholarship covering the equivalent. Finland accepts a scholarship letter in place of the balance, which is why the scholarship matters twice.

## Visa

A residence permit for studies, applied for online through Enter Finland and then finalised in person. It is issued for the full duration of your degree rather than a year at a time, which removes the annual renewal risk other destinations carry.`,
  },
  {
    id: "seed-c7",
    slug: "denmark",
    name: "Denmark",
    flag: "DK",
    tier: "secondary",
    sort_order: 7,
    published: true,
    blurb:
      "Project-based teaching rather than lecture-and-exam, strong engineering and business schools, and full-time work allowed right through the summer.",
    intakes: "September (limited February)",
    work: "20 hrs / week in term, full-time June to August",
    highlights: [
      "English-taught bachelor's and master's programmes",
      "Internships built into many degrees",
      "Establishment card to stay and job-hunt after graduating",
    ],
    tests: "IELTS / TOEFL",
    tuition: "EUR 6,000 - 16,000 a year",
    cost_living: "DKK 6,000 - 8,000 a month",
    universities: [
      "Technical University of Denmark",
      "Aarhus University",
      "Copenhagen Business School",
      "Aalborg University",
      "VIA University College",
      "University of Southern Denmark",
    ],
    image: null,
    overview: `Denmark teaches differently. Group projects and problem-based learning replace the lecture-and-final-exam model, and Aalborg University in particular is known internationally for it. If you learn by doing rather than by memorising, this is the system built for you.

## Who it suits

Engineering, business, design and sustainability students, especially those who want an internship as part of the degree. Danish employers take student interns seriously, and many graduates are hired by the company they interned with.

## Work rights are unusually good

Twenty hours a week during term, and full-time from June through August. A Danish summer at full-time wages covers a meaningful share of the year's living costs, which is not true in most of Europe.

## After graduation

The establishment card gives you up to three years to find work in Denmark after you graduate, which is one of the more generous post-study arrangements in the EU.

## The honest part

Copenhagen is expensive — comparable to Sydney. The February intake is small and limited to a handful of programmes, so in practice you are applying for September. And while your degree is in English, integrating socially is easier with some Danish.`,
    requirements: `## Academic entry

- **Bachelor's:** +2 with mathematics at the level your programme requires
- **Master's:** a relevant bachelor's degree; Denmark is strict about subject match

## English

IELTS 6.5 with no band below 5.5 is typical, TOEFL 83 and above. Requirements are set per programme.

## Financial evidence

DKK 6,397 a month for the duration of your studies, or evidence that tuition is paid and funds are available.

## Visa

A residence permit for studies through SIRI, the Danish Agency for International Recruitment and Integration. Apply as soon as you have your admission letter, because processing takes up to two months and the intake will not wait.`,
  },
  {
    id: "seed-c8",
    slug: "sweden",
    name: "Sweden",
    flag: "SE",
    tier: "secondary",
    sort_order: 8,
    published: true,
    blurb:
      "Over a thousand English-taught master's programmes, no fixed cap on student working hours, and a year's permit to look for work once you graduate.",
    intakes: "August / September (limited January)",
    work: "No fixed hourly cap while you keep up full-time study, 12 months to job-hunt after",
    highlights: [
      "One national application covers every university",
      "Mid-January deadline for the autumn intake, so apply early",
      "1,000+ English-taught master's programmes",
    ],
    tests: "IELTS / TOEFL / PTE",
    tuition: "SEK 80,000 - 200,000 a year",
    cost_living: "SEK 9,000 - 12,000 a month",
    universities: [
      "Lund University",
      "KTH Royal Institute of Technology",
      "Uppsala University",
      "Chalmers University of Technology",
      "Linköping University",
      "Stockholm University",
    ],
    image: null,
    overview: `Sweden has more English-taught master's programmes than any other Nordic country — over a thousand — and one national application portal covers every university, so a single application with a single set of documents can reach eight institutions.

## Who it suits

Master's students, particularly in engineering, technology, sustainability and design. Sweden's research output is disproportionate to its size, and KTH, Chalmers and Lund carry real international weight.

## No fixed cap on working hours

Sweden does not set a numerical limit on student work. The requirement is that you maintain satisfactory full-time study progress. In practice that is a more generous arrangement than a twenty-hour cap, though it demands self-discipline.

## The deadline is the thing to know

Applications for the August intake close in mid-January, and supporting documents and the application fee must arrive shortly after. This is six to seven months before the course starts, and it catches out students who begin researching in the spring. If you are reading this in February for an August start, you have most likely missed it — plan for the following year and use the time on your English score.

## The honest part

Tuition is high compared with Finland or Germany, and scholarships are competitive rather than routine. Housing in Stockholm and Gothenburg is genuinely difficult to find; apply for student accommodation the day you are admitted. Twelve months to find work after graduating is shorter than Finland or Denmark allow.`,
    requirements: `## Academic entry

- **Bachelor's:** +2 completed with subject prerequisites met
- **Master's:** a bachelor's degree equivalent to a Swedish one, in a related field

## English

Documented English equivalent to Swedish upper secondary English 6: IELTS 6.5 overall with no section below 5.5, or TOEFL 90 with 20 in writing.

## Financial evidence

SEK 10,314 a month for at least ten months of each year of study, held in your own account.

## Visa

A residence permit for studies through the Swedish Migration Agency, applied for once you have been admitted and have paid the first tuition instalment. Permits are issued for one year at a time for longer programmes and renewed from within Sweden.`,
  },
  {
    id: "seed-c9",
    slug: "austria",
    name: "Austria",
    flag: "AT",
    tier: "secondary",
    sort_order: 9,
    published: true,
    blurb:
      "Public universities charge non-EU students roughly EUR 730 a semester, which makes a degree in Vienna or Graz one of the cheapest routes on this page.",
    intakes: "October (winter), March (summer)",
    work: "20 hrs / week with an employment permit, 12 months job-seeker residence",
    highlights: [
      "Among the lowest public university fees in Europe",
      "Red-White-Red Card route for graduates who find skilled work",
      "English-taught and German-taught programmes",
    ],
    tests: "IELTS / TOEFL, German for German-taught courses",
    tuition: "EUR 1,460 a year at public universities",
    cost_living: "EUR 950 - 1,200 a month",
    universities: [
      "University of Vienna",
      "TU Wien",
      "University of Graz",
      "Johannes Kepler University Linz",
      "TU Graz",
      "University of Innsbruck",
    ],
    image: null,
    overview: `Austria is the cheapest tuition on this page by a wide margin. Public universities charge non-EU students roughly EUR 726 per semester — about EUR 1,460 a year — for degrees at institutions that have been running for six centuries. Vienna is consistently ranked among the most liveable cities in the world.

## Who it suits

Students on a genuinely tight budget who can manage the German language question, and students who want a European degree without European tuition. Because fees are so low, your total cost is driven almost entirely by living expenses.

## The German question

English-taught master's programmes exist in reasonable numbers, particularly in business, technology and the sciences. Bachelor's degrees are overwhelmingly in German and usually require a B2 or C1 certificate. If you are willing to spend a year on German first, the range of options widens enormously and so do your part-time work prospects.

## Staying on

Twelve months of job-seeker residence after graduation, and the Red-White-Red Card for graduates who find skilled work — a points-based route that treats an Austrian degree favourably.

## The honest part

Admission is bureaucratic. Documents need apostille certification and sometimes formal recognition of your prior qualification, and the process is slow, so start early. Working twenty hours a week requires an employment permit that the employer applies for, which makes casual work harder to arrange than in Australia or Canada.`,
    requirements: `## Academic entry

- **Bachelor's:** +2 that qualifies you for university entry in Nepal, for the same subject
- **Master's:** a relevant bachelor's degree
- Austria requires your prior qualification to grant equivalent access at home, which is checked carefully

## Language

German B2 or C1 for German-taught programmes. IELTS 6.5 or TOEFL 88 and above for English-taught ones.

## Financial evidence

EUR 1,415 a month for students under 24, EUR 1,562 for those over, for twelve months. Held in an account, a savings book, or confirmed by a scholarship.

## Visa

A student residence permit applied for at the Austrian embassy before you travel. Processing takes up to three months, and documents need to be apostilled and translated. Start this the moment your admission letter arrives.`,
  },
  {
    id: "seed-c10",
    slug: "malta",
    name: "Malta",
    flag: "MT",
    tier: "secondary",
    sort_order: 10,
    published: true,
    blurb:
      "An English-speaking EU island. Lectures in English, no language barrier off campus, and Schengen travel from a campus twenty minutes from the sea.",
    intakes: "October, February",
    work: "20 hrs / week after your first 90 days, with an employment licence",
    highlights: [
      "English is an official language, on campus and off",
      "Lower tuition and living costs than mainland Europe",
      "Schengen travel access",
    ],
    tests: "IELTS / PTE, MOI accepted by some colleges",
    tuition: "EUR 7,000 - 12,000 a year",
    cost_living: "EUR 700 - 1,000 a month",
    universities: [
      "University of Malta",
      "Malta College of Arts, Science and Technology",
      "American University of Malta",
      "Global College Malta",
      "St Martin's Institute of Higher Education",
      "IDEA College",
    ],
    image: null,
    overview: `Malta solves the problem every other European destination has: the language. English is an official language, so lectures are in English and so is everything off campus — the bank, the doctor, your landlord, your part-time job. For students who want the EU without a year of language preparation, that is decisive.

## Who it suits

Students who want a European qualification and Schengen access at a lower total cost than the mainland, and who value being able to function immediately in English. Business, hospitality, IT and healthcare are the main fields.

## Cost and scale

Tuition and living costs are both well below northern Europe. The island is small — you can cross it in an hour — which means short commutes and a tight-knit student community, but also a limited job market and fewer programme choices than a large country offers.

## The honest part

The 90-day wait before you can work is a real constraint on your budget; arrive with enough money for three months without income. The employment licence adds paperwork. And because the sector is small, you should check any private college's accreditation carefully before paying a deposit — we do this as part of shortlisting.`,
    requirements: `## Academic entry

- **Diploma / bachelor's:** +2 completed
- **Master's:** a recognised bachelor's degree
- Foundation and pathway programmes are available for profiles that fall short

## English

IELTS 6.0 or PTE equivalent for most programmes. Several colleges accept a Medium of Instruction letter, which suits students whose previous study was in English.

## Financial evidence

Roughly EUR 8,000 to 10,000 a year in accessible funds, plus tuition. Requirements vary between institutions.

## Visa

A national long-stay visa followed by a residence permit on arrival. Malta requires health insurance covering your full stay and confirmed accommodation before the visa is issued.`,
  },
  {
    id: "seed-c11",
    slug: "switzerland",
    name: "Switzerland",
    flag: "CH",
    tier: "secondary",
    sort_order: 11,
    published: true,
    blurb:
      "Low fees at world-ranked public universities such as ETH Zurich and EPFL, alongside the hotel and hospitality management schools Switzerland is known for.",
    intakes: "September (limited February)",
    work: "15 hrs / week after six months of residence, full-time in holidays",
    highlights: [
      "Public university tuition of roughly CHF 500-2,000 a semester",
      "Hospitality and hotel management specialists",
      "Needs a higher bank balance than any other destination here",
    ],
    tests: "IELTS / TOEFL",
    tuition: "CHF 1,000 - 4,000 a year at public universities",
    cost_living: "CHF 21,000 - 28,000 a year",
    universities: [
      "ETH Zurich",
      "EPFL",
      "University of Zurich",
      "University of Geneva",
      "Les Roches",
      "César Ritz Colleges",
    ],
    image: null,
    overview: `Switzerland is a study in contrasts. Public university tuition is remarkably low — often CHF 500 to 2,000 a semester at institutions like ETH Zurich and EPFL, which rank among the best in the world. Living costs are among the highest anywhere.

## Two very different routes

**Public universities** are cheap, world-ranked and academically demanding. ETH Zurich and EPFL are genuine global leaders in engineering and science, and admission is correspondingly competitive.

**Private hospitality schools** — Les Roches, César Ritz, Glion — are expensive but are the recognised global standard in hotel and hospitality management, with paid internships built into the programme and strong placement into international hotel groups.

## Who it suits

For the public route: strong students in engineering, science and mathematics who can evidence substantial funds. For the hospitality route: students committed to a hospitality career who can support the fees, and who value the internship income and the industry network.

## The honest part

The financial requirement is the highest on this page. You must show roughly CHF 21,000 a year, and Switzerland verifies it strictly. Fifteen hours of work a week is only permitted after your first six months, so the first half-year has no income at all. And admission to ETH or EPFL for a bachelor's usually means passing a demanding entrance examination.`,
    requirements: `## Academic entry

- **Bachelor's at public universities:** +2 plus an entrance examination for most non-EU applicants
- **Master's:** a relevant bachelor's degree, assessed strictly for equivalence
- **Hospitality schools:** +2 completed, with more flexible academic entry

## Language

IELTS 6.5-7.0 or TOEFL 90-100 for English-taught programmes. Many public university bachelor's degrees are taught in German or French and require a C1 certificate.

## Financial evidence

Roughly CHF 21,000 a year in a blocked or verifiable account. This is the strictest financial check of any destination we handle.

## Visa

A type D national visa applied for at the Swiss embassy, then a residence permit registered with the local canton on arrival. Cantonal requirements differ, so the process depends on where you will study.`,
  },
  {
    id: "seed-c12",
    slug: "japan",
    name: "Japan",
    flag: "JP",
    tier: "secondary",
    sort_order: 12,
    published: true,
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
    tuition: "JPY 600,000 - 1,000,000 a year",
    cost_living: "JPY 80,000 - 120,000 a month",
    universities: [
      "Tokyo Japanese Language School",
      "Waseda University",
      "Kyoto University",
      "Osaka University",
      "Vocational IT and business colleges",
      "Human Academy Japanese Language School",
    ],
    image: "/Japan.jpg",
    overview: `Japan works on a pathway model, and understanding that is the key to it. Almost no Nepali student enters a Japanese university directly. You go to a language school for one to two years, reach JLPT N3 or N2, and then progress to a university or a vocational college. That first step is the one we prepare you for.

## Who it suits

Students willing to learn a language properly, and students who want to work in Japan afterwards. Japan's ageing population means genuine demand for skilled workers in IT, care work, engineering and hospitality, and a Japanese qualification plus Japanese language makes you employable in a way an English-language degree there does not.

## We teach the language here

Our own JLPT N5 to N3 classes run in the same building that prepares your application, which means you arrive with the language already started rather than beginning from hiragana in Tokyo. Students who land with N5 already cleared have a substantially easier first six months.

## Work and cost

Twenty-eight hours a week with permission from immigration is more generous than most destinations, and convenience store, restaurant and delivery work is readily available in cities. Language school tuition is modest compared with Western universities.

## The honest part

The Certificate of Eligibility process is document-heavy and completely unforgiving about deadlines — language school intakes fill and close. Your financial documents need a sponsor with clearly evidenced income. And without reaching N2, your options after language school narrow considerably. This destination rewards students who commit to the language and frustrates those who do not.`,
    requirements: `## Academic entry

- **Language school:** +2 completed, or twelve years of formal education
- **University / vocational college:** language school completion plus JLPT N2 for most programmes, N3 for some vocational courses
- Some English-taught degrees exist at major universities and skip the language route

## Language

JLPT N5 as a minimum for a language school visa, and the NAT-TEST is accepted as an alternative. N3 opens vocational colleges; N2 opens universities.

## Financial evidence

JPY 1,500,000 to 2,000,000 in a sponsor's account, with three years of income documentation and relationship papers proving the connection to your sponsor.

## Visa

Your school applies for a Certificate of Eligibility on your behalf, which takes two to three months. The student visa follows at the embassy once the CoE is issued. **Deadlines are absolute** — a file submitted late waits for the next intake three months on.`,
  },
  {
    id: "seed-c13",
    slug: "south-korea",
    name: "South Korea",
    flag: "KR",
    tier: "secondary",
    sort_order: 13,
    published: true,
    blurb:
      "Government scholarships, low tuition and English-taught degrees at Seoul's leading universities, with a job-seeking visa to stay on after you finish.",
    intakes: "March, September",
    work: "25-30 hrs / week with immigration permission, D-10 job-seeking visa after",
    highlights: [
      "Global Korea Scholarship can cover tuition and living costs",
      "English-taught degrees at top Seoul universities",
      "TOPIK opens up more courses and more working hours",
    ],
    tests: "IELTS / TOEFL / TOPIK",
    tuition: "KRW 4,000,000 - 9,000,000 a semester",
    cost_living: "KRW 700,000 - 1,200,000 a month",
    universities: [
      "Seoul National University",
      "Yonsei University",
      "Korea University",
      "KAIST",
      "Sungkyunkwan University",
      "Hanyang University",
    ],
    image: null,
    overview: `South Korea combines low tuition, heavy university scholarship discounting and a government scholarship that covers everything, at universities that have climbed international rankings quickly over the past two decades.

## The scholarship changes the arithmetic

The Global Korea Scholarship covers tuition, a monthly living allowance, airfare and a year of Korean language training. It is competitive and applications go through the Korean embassy or directly to a university, but it is the single best-funded scholarship available to Nepali students anywhere. Beyond it, most Korean universities offer their own 30% to 100% tuition reductions based on grades and TOPIK level.

## English-taught degrees exist

Seoul National, Yonsei, Korea University, KAIST and others run substantial numbers of English-taught programmes, particularly at master's level in engineering, business and international studies. You can complete a degree without Korean.

## But Korean pays for itself

TOPIK level 3 or above unlocks more courses, more scholarship money, more working hours and dramatically better part-time work. The D-10 job-seeking visa after graduation is only genuinely useful with functional Korean.

## The honest part

Academic culture is intense and hierarchical, and the working hours expected of graduate students in research labs surprise people. Seoul housing is expensive and small. Immigration permission is required before you take any part-time work, and working without it is the fastest way to lose your visa.`,
    requirements: `## Academic entry

- **Bachelor's:** +2 completed with good grades
- **Master's:** a recognised bachelor's degree
- Universities weigh your academic record heavily for their own scholarships

## Language

TOPIK level 3 for Korean-taught programmes. IELTS 5.5-6.5 or TOEFL 71-80 for English-taught ones. Some universities admit without either and require a language year first.

## Financial evidence

USD 10,000 to 20,000 depending on the university and course length, held in your own or a sponsor's account with documented income.

## Visa

A D-2 student visa applied for at the Korean embassy with a certificate of admission and your financial documents. On arrival you register for an alien registration card, and you must obtain immigration permission before starting any part-time work.`,
  },
  {
    id: "seed-c14",
    slug: "uae",
    name: "UAE",
    flag: "AE",
    tier: "secondary",
    sort_order: 14,
    published: true,
    blurb:
      "Branch campuses of British, Australian and Indian universities in Dubai and Abu Dhabi: a foreign degree under five hours from Kathmandu, with no income tax on what you earn.",
    intakes: "September, January (limited May)",
    work: "Part-time work with a permit, residency routes for strong graduates",
    highlights: [
      "UK and Australian branch campuses in Dubai",
      "No income tax on part-time earnings",
      "Large Nepali community and short, cheap flights home",
    ],
    tests: "IELTS / PTE, MOI accepted by many campuses",
    tuition: "AED 40,000 - 90,000 a year",
    cost_living: "AED 3,500 - 6,000 a month",
    universities: [
      "University of Birmingham Dubai",
      "Heriot-Watt University Dubai",
      "University of Wollongong in Dubai",
      "Middlesex University Dubai",
      "Amity University Dubai",
      "BITS Pilani Dubai",
    ],
    image: null,
    overview: `The UAE offers something no other destination on this page can: a British or Australian degree, awarded by the home campus, four and a half hours from Kathmandu. For students whose families want them closer, or whose visa history makes a Western student visa difficult, the branch campus model is a genuine answer.

## How branch campuses work

Heriot-Watt, Birmingham, Wollongong, Middlesex and others run full campuses in Dubai. The degree certificate is issued by the home university and is identical to the one awarded in Edinburgh or Sydney. Fees are typically lower than studying at the home campus, and there is often the option to transfer for your final year.

## Practical advantages

No income tax on part-time earnings. A large, established Nepali community. Flights home that cost a fraction of a ticket from Melbourne and take under five hours, which matters more than students expect when something goes wrong at home. And many campuses accept a Medium of Instruction letter instead of IELTS.

## Who it suits

Students who want a recognised Western qualification without leaving the region, students with family obligations in Nepal, and students targeting the Gulf job market in business, engineering, aviation, logistics or hospitality — where a UAE degree plus UAE work experience is worth more than a European one.

## The honest part

There is no automatic post-study work visa of the kind Australia or Canada provides; you need a job offer and an employer to sponsor your residence, though the Green Visa and Golden Visa routes reward strong graduates. Your student residence is tied to your institution. Dubai rent is high. And part-time work needs a permit arranged through your university.`,
    requirements: `## Academic entry

- **Bachelor's:** +2 completed; branch campuses apply the same entry standards as their home institutions
- **Master's:** a recognised bachelor's degree

## English

IELTS 6.0-6.5 for most branch campuses. **A Medium of Instruction letter is accepted by many**, which is one of the practical advantages of this destination for students without a test score.

## Financial evidence

Tuition plus accommodation and living costs, typically AED 60,000 to 100,000 a year in total. Requirements are set by the institution rather than centrally.

## Visa

Your university sponsors your student residence visa, which is tied to your enrolment. It includes a medical fitness test and an Emirates ID on arrival. Processing is fast compared with Western destinations — often two to four weeks.`,
  },
];

/** Every destination name, in display order. Used by the enquiry dropdowns. */
export const seedDestinationNames: string[] = seedCountries.map((c) => c.name);
