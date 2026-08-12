/**
 * The three phone illustrations on the landing page.
 *
 * Pictures of the product, not the product: simplified recreations of the quiz,
 * the analyzing screen and the report, drawn at 280×560 so the whole flow fits
 * beside its paragraph. They are deliberately not the real components — those
 * need a store, a report id and a couple's answers, and a marketing page should
 * not be able to break because the quiz changed shape.
 *
 * Every one is `aria-hidden`: the text beside each step already says what the
 * screen shows, and a screen reader announcing a fake progress bar and four
 * fake answer chips would be noise.
 *
 * Type sizes inside the frame are given in exact pixels rather than in the
 * type scale. They are illustration proportions — a 6.5px label reads as
 * body copy on a phone shrunk to 280px — not text anyone is meant to read.
 */

const QUIZ_ITEMS = [
  "Being close friends with an ex",
  "Knowing each other's phone passwords",
  "Going on vacation without your partner",
];

const ANALYZE_STEPS = [
  "Reading your answers",
  "Comparing your perspectives",
  "Analyzing communication patterns",
  "Measuring emotional alignment",
];

const SUB_SCORES = [
  { value: 92, label: "Connection" },
  { value: 89, label: "Stability" },
  { value: 81, label: "Chemistry" },
];

/** Bezel, notch and screen — shared by all three. */
function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div
      aria-hidden
      className="h-[560px] w-[280px] shrink-0 rounded-[38px] bg-[#0f1115] p-2.5 shadow-[0_30px_60px_-20px_rgba(15,17,21,0.35)]"
    >
      <div className="relative h-full w-full overflow-hidden rounded-[30px] bg-surface">
        <div className="absolute left-1/2 top-2 h-[18px] w-[70px] -translate-x-1/2 rounded-[10px] bg-[#0f1115]" />
        {children}
      </div>
    </div>
  );
}

export function QuizPhone() {
  return (
    <Phone>
      <div className="px-4 pb-4 pt-10">
        <div className="mb-2.5 flex items-center justify-between text-[11px] text-slate-500">
          <span>← Back</span>
          <span>Q6 of 15</span>
        </div>

        <div className="mb-4 h-[5px] overflow-hidden rounded bg-slate-200">
          <div className="h-full w-2/5 bg-accent-500" />
        </div>

        <h4 className="mb-1 text-[14px] font-extrabold text-slate-900">
          Totally Fine or Dealbreaker?
        </h4>
        <p className="mb-3.5 text-[10px] text-slate-400">
          Don&rsquo;t overthink — go with your gut
        </p>

        {QUIZ_ITEMS.map((item) => (
          <div key={item} className="mb-2.5 rounded-[14px] bg-white p-3">
            <p className="mb-2 text-center text-[11px] font-bold text-slate-900">
              {item}
            </p>
            <div className="mb-[5px] flex justify-between text-[8px] font-bold">
              <span className="text-[#5c7cf0]">Olivia</span>
              <span className="text-accent-500">Liam</span>
            </div>
            <div className="flex gap-[3px]">
              {["👍 Fine", "👎 Deal.", "👍 Fine", "👎 Deal."].map((chip, index) => (
                <span
                  key={index}
                  className="flex-1 rounded-[5px] bg-slate-100 px-0.5 py-1 text-center text-[6.5px]"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Phone>
  );
}

export function AnalyzingPhone() {
  return (
    <Phone>
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="mb-[18px] flex h-[120px] w-[120px] items-center justify-center rounded-full border-[10px] border-accent-500 text-[26px] font-extrabold text-slate-900">
          99%
        </div>

        <h4 className="mb-1.5 text-[15px] font-extrabold text-slate-900">
          Analyzing Olivia &amp; Liam
        </h4>
        <p className="mb-4 text-[10px] text-slate-400">
          Reading all 15 answers. Don&rsquo;t close the page.
        </p>

        <div className="w-full rounded-[14px] bg-white p-3.5 text-left">
          {ANALYZE_STEPS.map((step) => (
            <p
              key={step}
              className="mb-2 flex gap-1.5 text-[10px] text-slate-600"
            >
              <span className="text-green-500">✓</span>
              {step}
            </p>
          ))}
          <p className="flex gap-1.5 text-[10px] font-bold text-slate-900">
            <span className="mt-[3px] h-[7px] w-[7px] shrink-0 rounded-full bg-accent-500" />
            Finalizing your report
          </p>
        </div>
      </div>
    </Phone>
  );
}

export function ResultPhone() {
  return (
    <Phone>
      {/*
        `justify-between` across four groups rather than a last card stretched
        with `flex-1`.

        Stretching it did reach the bottom bezel, but only by growing a band of
        empty white under the paragraph — the screen read as content pinned to
        the top of the phone with a hole beneath it. Spreading the spare height
        between the groups instead lets every block breathe and still lands the
        last card on the bottom edge.
      */}
      <div className="flex h-full flex-col items-center justify-between px-3 pb-3 pt-[30px] text-center">
        <div className="flex flex-col items-center">
          <p className="mb-1.5 text-[10px] text-slate-500">Olivia &amp; Liam</p>

          <div className="mb-1.5 flex h-[88px] w-[88px] flex-col items-center justify-center rounded-full border-[7px] border-green-500">
            <span className="text-[22px] font-extrabold text-slate-900">88</span>
            <span className="text-[6.5px] text-slate-400">out of 100</span>
          </div>

          {/* `self-center` so the pill hugs its text — a flex column would
              otherwise stretch it the full width of the screen. */}
          <span className="self-center rounded-full bg-green-50 px-3 py-[3px] text-[9px] font-bold text-green-500">
            Strong
          </span>
        </div>

        <div className="flex w-full justify-around">
          {SUB_SCORES.map((score) => (
            <div key={score.label}>
              <div className="mx-auto mb-[3px] flex h-[34px] w-[34px] items-center justify-center rounded-full border-4 border-green-500 text-[10px] font-extrabold text-green-500">
                {score.value}
              </div>
              <span className="text-[7px] text-slate-500">{score.label}</span>
            </div>
          ))}
        </div>

        <div className="w-full rounded-[10px] bg-white p-[9px] text-left">
          <p className="text-[7.5px] leading-[1.4] text-slate-600">
            You two seem deeply connected, but your answers reveal an interesting
            difference in how you handle the moments when things get difficult.
            You tend to find comfort in each other—but you may not always need
            the same thing when emotions run high.
          </p>
        </div>

        <div className="w-full rounded-[10px] bg-white px-[9px] pb-[11px] pt-[9px] text-left">
          <p className="mb-1 text-[6.5px] font-bold tracking-[0.05em] text-slate-400">
            YOUR COUPLE DYNAMIC
          </p>
          <p className="mb-[5px] text-[12px] font-extrabold text-slate-900">
            The Mirror
          </p>
          <p className="text-[7.5px] leading-[1.4] text-slate-600">
            You see yourselves reflected in each other almost perfectly. Your
            values align on major life questions, you handle conflict the same
            way, and you&rsquo;re both equally committed. This creates an almost
            uncanny symmetry.
          </p>
        </div>
      </div>
    </Phone>
  );
}
