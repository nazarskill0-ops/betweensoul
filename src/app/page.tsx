import Link from "next/link";

const steps = [
  {
    emoji: "📱",
    title: "One phone, two people",
    body: "Sit down together and pass the phone back and forth. Every question shows both of your answers side by side.",
  },
  {
    emoji: "🧠",
    title: "The AI reads the gaps",
    body: "It isn't scoring you individually. It's looking at where your answers disagree — that's where the real story is.",
  },
  {
    emoji: "💌",
    title: "You get an honest read",
    body: "Five scored areas, your biggest strength, your biggest risk, and things to actually try this month.",
  },
];

const categories = [
  "Communication",
  "Conflict & Repair",
  "Trust",
  "Intimacy",
  "Shared Future",
];

export default function Home() {
  return (
    <main className="flex-1 px-5 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-2xl space-y-14">
        {/* Hero */}
        <section className="space-y-6 text-center">
          <span className="pill bg-slate-100 text-slate-600">
            ✨ 15 questions · about 10 minutes
          </span>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
            How strong is{" "}
            <span className="italic text-accent-500">
              your love
            </span>
            , really?
          </h1>
          <p className="mx-auto max-w-lg text-lg text-slate-600">
            Take this test together with your partner from one device. Our AI
            compares both of your answers and tells you what it sees — including
            the parts you&rsquo;ve been avoiding.
          </p>

          <div className="space-y-3 pt-2">
            <Link href="/test" className="btn-primary block text-center">
              Start the Test ♥
            </Link>
            <p className="text-sm text-slate-500">
              Free score &amp; summary · No sign-up required
            </p>
          </div>
        </section>

        {/* What you get */}
        <section className="card p-6 sm:p-8">
          <h2 className="text-center text-xl font-bold text-slate-900">
            You&rsquo;ll be scored on five things
          </h2>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <span
                key={category}
                className="pill bg-slate-50 text-accent-600 text-[13px]"
              >
                {category}
              </span>
            ))}
          </div>
          <p className="mt-5 text-center text-sm text-slate-500">
            Answer honestly — the analysis is only as good as what you put in.
            There are no &ldquo;right&rdquo; answers here.
          </p>
        </section>

        {/* How it works */}
        <section className="space-y-4">
          <h2 className="text-center text-xl font-bold text-slate-900">
            How it works
          </h2>
          {steps.map((step, index) => (
            <div key={step.title} className="card flex gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-xl">
                {step.emoji}
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900">
                  <span className="text-accent-500">{index + 1}.</span> {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">{step.body}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Closing CTA */}
        <section className="space-y-3 text-center">
          <Link href="/test" className="btn-primary block text-center">
            Take the Test Together ♥
          </Link>
          <p className="text-xs text-slate-400">
            Not therapy or clinical advice. Just an honest, careful read on your
            answers.
          </p>
        </section>
      </div>
    </main>
  );
}
