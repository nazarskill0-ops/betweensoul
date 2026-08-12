import type { Metadata } from "next";
import Link from "next/link";
import {
  AnalyzingPhone,
  QuizPhone,
  ResultPhone,
} from "@/components/PhoneMockup";

/**
 * The landing page.
 *
 * Three steps, each paired with a picture of the screen it describes — the
 * quiz, the wait, the report. Someone deciding whether to spend ten minutes on
 * this with their partner is really asking what they get at the end, and a
 * paragraph about "an honest read" answers that far less well than the report
 * itself does.
 *
 * The rows alternate on desktop and stack on a phone, where a 280px mockup
 * beside a paragraph would leave neither enough room.
 */

/**
 * The homepage inherits the site title and description from the root layout;
 * all it adds is the canonical, so the origin, `/index` and any campaign query
 * string all resolve to one URL.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const STEPS = [
  {
    emoji: "📱",
    title: "One phone, two people",
    body: "Sit down together and pass the phone back and forth. Every question shows both of your answers side by side.",
    phone: <QuizPhone />,
  },
  {
    emoji: "🧠",
    title: "The AI reads the gaps",
    body: "It isn't scoring you individually. It's looking at where your answers disagree — that's where the real story is.",
    phone: <AnalyzingPhone />,
  },
  {
    emoji: "💌",
    title: "You get an honest read",
    body: "Five scored areas, your biggest strength, your biggest risk, and things to actually try this month.",
    phone: <ResultPhone />,
  },
];

/**
 * What the reader walks away with, rather than the five areas being measured.
 * Someone deciding whether to start is weighing what lands at the end, and
 * "Conflict & Repair" names a category where "A 7-day action plan" names a
 * thing they get to keep.
 */
const DELIVERABLES = [
  "A compatibility score out of 100",
  "Your couple type (12 possible dynamics)",
  "What your partner won’t say directly",
  "Your biggest strength and risk",
  "A 7-day action plan",
];

/** The one call to action on the page, in both places it appears. */
function StartButton({ children }: { children: React.ReactNode }) {
  return (
    <Link
      href="/test"
      className="btn-primary block rounded-2xl py-[22px] text-center text-xl shadow-[0_8px_24px_-8px_var(--color-accent-500)]"
    >
      {children}
    </Link>
  );
}

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="mx-auto max-w-[900px] px-6 pb-16 pt-16 text-center sm:pt-24">
        <span className="pill mb-8 bg-slate-100 px-5 py-2.5 text-[15px] text-slate-600">
          <span aria-hidden>✨</span>
          <span>15 questions · about 10 minutes</span>
        </span>
        <h1 className="mb-7 text-4xl font-extrabold leading-[1.08] tracking-[-0.01em] text-slate-900 sm:text-5xl md:text-[64px]">
          How strong is <em className="italic text-accent-500">your love,</em>{" "}
          really?
        </h1>
        <p className="mx-auto mb-10 max-w-[620px] text-lg leading-[1.55] text-slate-600 sm:text-[21px]">
          Take this test together with your partner from one device. Our AI
          compares both of your answers and tells you what it sees — including
          the parts you&rsquo;ve been avoiding.
        </p>

        <StartButton>Start the Test ♥</StartButton>
        <p className="mt-5 text-[15px] text-slate-400">
          Free score &amp; summary · No sign-up required
        </p>
      </section>

      {/* What you get */}
      <section className="mx-auto mb-22 max-w-[820px] px-6">
        <div className="card px-6 py-10 text-center sm:px-10 sm:py-12">
          <h2 className="mb-7 text-[28px] font-extrabold text-slate-900">
            What you&rsquo;ll get
          </h2>
          <div className="mb-7 flex flex-wrap justify-center gap-3">
            {DELIVERABLES.map((item) => (
              <span
                key={item}
                className="pill bg-accent-50 px-[22px] py-3 text-[15px] font-bold text-accent-500"
              >
                {item}
              </span>
            ))}
          </div>
          <p className="mx-auto max-w-[560px] text-base leading-[1.6] text-slate-500">
            Answer honestly — the analysis is only as good as what you put in.
            There are no &ldquo;right&rdquo; answers here.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-[960px] px-6 pb-24">
        <h2 className="mb-14 text-center text-3xl font-extrabold text-slate-900 sm:text-[34px]">
          How it works
        </h2>

        {STEPS.map((step, index) => (
          <div
            key={step.title}
            className={`mb-20 flex flex-col items-center gap-10 md:mb-24 md:gap-14 ${
              index % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"
            }`}
          >
            <div className="flex-1 md:min-w-[280px]">
              <div className="mb-4 flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200/70 text-xl">
                  {step.emoji}
                </div>
                <span className="text-[15px] font-bold text-accent-500">
                  STEP {index + 1}
                </span>
              </div>
              <h3 className="mb-3.5 text-2xl font-extrabold text-slate-900 sm:text-[26px]">
                {step.title}
              </h3>
              <p className="text-[17px] leading-[1.6] text-slate-600">
                {step.body}
              </p>
            </div>
            {step.phone}
          </div>
        ))}

        <StartButton>Take the Test Together ♥</StartButton>
        <p className="mt-5 text-center text-sm text-slate-400">
          Not therapy or clinical advice. Just an honest, careful read on your
          answers.
        </p>
      </section>
    </main>
  );
}
