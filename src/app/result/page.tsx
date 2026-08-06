"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTestStore } from "@/store/useTestStore";
import { useStoreHydrated } from "@/store/useHydrated";
import {
  AfraidToLose,
  ConflictDNA,
  GapMap,
  GapSize,
  SeeEachOther,
  Teaser,
  TitledItem,
  UncomfortableTruth,
} from "@/lib/types";

const PRICE = "$9.99";

/**
 * What /api/report/[id] returns. Every paid field arrives as `null` until the
 * order is confirmed paid, so a locked section has nothing real to reveal —
 * the blur below sits over fixed placeholder copy, not over withheld text.
 */
interface ReportResponse {
  paid: boolean;
  partner1Name: string;
  partner2Name: string;
  teaser: Teaser;
  seeEachOther: SeeEachOther | null;
  conflictDNA: ConflictDNA | null;
  gapMap: GapMap | null;
  afraidToLose: AfraidToLose | null;
  uncomfortableTruth: UncomfortableTruth | null;
  gettingRight: TitledItem[] | null;
  actionPlan: TitledItem[] | null;
  conversationStarters: string[] | null;
}

function scoreTone(score: number) {
  if (score >= 85) return { text: "text-emerald-600", bar: "bg-emerald-400" };
  if (score >= 70) return { text: "text-blush-600", bar: "bg-blush-400" };
  if (score >= 55) return { text: "text-amber-600", bar: "bg-amber-400" };
  return { text: "text-rose-600", bar: "bg-rose-400" };
}

const GAP_TONE: Record<GapSize, { label: string; className: string }> = {
  aligned: { label: "Aligned", className: "bg-emerald-100 text-emerald-700" },
  minor: { label: "Minor gap", className: "bg-lilac-100 text-lilac-500" },
  significant: { label: "Significant gap", className: "bg-amber-100 text-amber-700" },
  major: { label: "Major gap", className: "bg-rose-100 text-rose-600" },
};

/** Eases 0 → target over `duration`, honouring prefers-reduced-motion. */
function useCountUp(target: number, duration = 1300) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ms = reduced ? 0 : duration;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = ms === 0 ? 1 : Math.min(1, (now - start) / ms);
      setValue(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    // rAF is suspended entirely while the tab is backgrounded, which would
    // leave the score frozen at 0 for anyone who opens the report in a tab
    // they haven't focused yet. Land on the final value either way.
    const settle = setTimeout(() => setValue(target), ms + 250);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(settle);
    };
  }, [target, duration]);

  return value;
}

function ScoreRing({ score }: { score: number }) {
  const animated = useCountUp(score);
  const circumference = 2 * Math.PI * 52;

  return (
    <div className="relative mx-auto h-40 w-40">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r="52" fill="none" stroke="white" strokeWidth="12" />
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="url(#score-ring)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - animated / 100)}
        />
        <defs>
          <linearGradient id="score-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-blush-400)" />
            <stop offset="100%" stopColor="var(--color-lilac-400)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-extrabold tabular-nums text-ink-900">
          {Math.round(animated)}
        </span>
        <span className="text-xs font-semibold text-ink-500">out of 100</span>
      </div>
    </div>
  );
}

function CategoryBar({ score }: { score: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-lilac-100">
      <div
        className={`animate-bar h-full rounded-full ${scoreTone(score).bar}`}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

function SectionCard({
  title,
  emoji,
  children,
}: {
  title: string;
  emoji: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card space-y-3 p-6">
      <h2 className="flex items-center gap-2 text-lg font-extrabold text-ink-900">
        <span>{emoji}</span> {title}
      </h2>
      {children}
    </section>
  );
}

function Paragraphs({ text }: { text: string }) {
  return (
    <div className="space-y-3">
      {text
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph, index) => (
          <p key={index} className="text-sm leading-relaxed text-ink-700">
            {paragraph}
          </p>
        ))}
    </div>
  );
}

/** Side-by-side partner panels, used by several of the paid sections. */
function PartnerColumns({
  p1Name,
  p2Name,
  p1Text,
  p2Text,
}: {
  p1Name: string;
  p2Name: string;
  p1Text: string;
  p2Text: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl bg-[var(--color-p1-soft)] p-4">
        <p className="text-xs font-extrabold text-[var(--color-p1)]">{p1Name}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-700">{p1Text}</p>
      </div>
      <div className="rounded-2xl bg-[var(--color-p2-soft)] p-4">
        <p className="text-xs font-extrabold text-[var(--color-p2)]">{p2Name}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-700">{p2Text}</p>
      </div>
    </div>
  );
}

/* --------------------------------- paywall -------------------------------- */

/**
 * Filler for locked sections. Identical for every section and deliberately
 * says nothing: the real analysis is never sent to the browser before payment,
 * so there is nothing here to un-blur.
 */
const PLACEHOLDER_LINES = [
  "Analysis reveals a consistent pattern in how each of you described the other, and the places where those two accounts stop agreeing.",
  "The answers you gave separately line up on most of this, with two exceptions that shape more of the day-to-day than either of you has said out loud.",
  "What follows sets out where that shows up, what it is costing, and the specific change that moves it.",
  "Read this part together rather than separately — it is written for both of you at once.",
];

function LockedSection({
  title,
  emoji,
  onUnlock,
}: {
  title: string;
  emoji: string;
  onUnlock: () => void;
}) {
  return (
    <section className="card overflow-hidden p-6">
      {/* The heading stays sharp — it is the teaser. Only the filler blurs. */}
      <h2 className="flex items-center gap-2 text-lg font-extrabold text-ink-900">
        <span>{emoji}</span>
        <span className="flex-1">{title}</span>
        <span className="text-base">🔒</span>
      </h2>

      <div className="locked-preview mt-3 space-y-2.5" aria-hidden>
        {PLACEHOLDER_LINES.map((line) => (
          <p key={line} className="text-sm leading-relaxed text-ink-700">
            {line}
          </p>
        ))}
      </div>

      <button
        onClick={onUnlock}
        className="mt-4 w-full rounded-2xl bg-blush-50 px-4 py-2.5 text-sm font-bold text-blush-600 transition-colors hover:bg-blush-100"
      >
        🔓 Unlock Report — {PRICE}
      </button>
    </section>
  );
}

/**
 * One paid section. `data` is null whenever the report is locked, so `render`
 * — the only thing that can produce real content — is never called.
 */
function PaidSlot<T>({
  title,
  emoji,
  data,
  onUnlock,
  render,
}: {
  title: string;
  emoji: string;
  data: T | null;
  onUnlock: () => void;
  render: (data: T) => React.ReactNode;
}) {
  if (data === null) {
    return <LockedSection title={title} emoji={emoji} onUnlock={onUnlock} />;
  }
  return (
    <SectionCard title={title} emoji={emoji}>
      {render(data)}
    </SectionCard>
  );
}

function UnlockCallout({
  onUnlock,
  loading,
  error,
}: {
  onUnlock: () => void;
  loading: boolean;
  error: string | null;
}) {
  return (
    <section className="card space-y-4 p-6 text-center">
      <div className="space-y-2">
        <span className="pill bg-lilac-100 text-lilac-500">🔒 Locked</span>
        <h2 className="text-2xl font-extrabold text-ink-900">
          Your full report is ready
        </h2>
      </div>
      <div className="space-y-2">
        <button onClick={onUnlock} disabled={loading} className="btn-primary">
          {loading ? "Opening checkout…" : `Unlock Full Report — ${PRICE}`}
        </button>
        <p className="text-sm font-semibold text-ink-700">
          See what your answers really reveal.
        </p>
        {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
        <p className="text-xs text-ink-300">
          One-time payment. No subscription. Secure checkout by Lemon Squeezy.
        </p>
      </div>
    </section>
  );
}

/* --------------------------------- page ---------------------------------- */

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hydrated = useStoreHydrated();

  const { partner1, partner2, reportId: storedReportId, teaser: storedTeaser } =
    useTestStore();

  // `id` is what /analyzing pushes; `report` is what the Lemon Squeezy
  // redirect still uses. Fall back to the store for an in-session visit.
  const reportId =
    searchParams.get("id") ?? searchParams.get("report") ?? storedReportId;
  const justPaid = searchParams.get("paid") === "1";

  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "notfound">(
    "loading",
  );
  const [settling, setSettling] = useState(justPaid);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const fetchReport = useCallback(async (id: string) => {
    const response = await fetch(`/api/report/${id}`);
    if (!response.ok) return null;
    return (await response.json()) as ReportResponse;
  }, []);

  useEffect(() => {
    // Nothing to fetch until the store has rehydrated and given us an id.
    if (!hydrated || !reportId) return;

    let cancelled = false;
    let attempts = 0;

    const load = async () => {
      const data = await fetchReport(reportId);
      if (cancelled) return;

      if (!data) {
        setLoadState("notfound");
        return;
      }

      setReport(data);
      setLoadState("ready");

      // Coming back from checkout, the webhook may not have landed yet.
      if (justPaid && !data.paid && attempts < 16) {
        attempts += 1;
        setTimeout(load, 2500);
      } else {
        setSettling(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [fetchReport, hydrated, justPaid, reportId]);

  const unlock = async () => {
    if (!reportId) return;
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      });
      const data = await response.json();
      if (!response.ok || !data.url) {
        throw new Error(data?.error ?? "Could not start checkout.");
      }
      window.location.href = data.url;
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : "Could not start checkout.",
      );
      setCheckoutLoading(false);
    }
  };

  if (!hydrated || (reportId && loadState === "loading")) {
    return <CenteredNote emoji="💗" title="Loading your results…" />;
  }

  const teaser = report?.teaser ?? storedTeaser;

  if (!reportId || loadState === "notfound" || !teaser) {
    return (
      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="card w-full max-w-md space-y-4 p-8 text-center">
          <div className="text-4xl">🔍</div>
          <h1 className="text-2xl font-extrabold text-ink-900">
            We can&rsquo;t find that report
          </h1>
          <p className="text-sm text-ink-700">
            It may have expired, or the test wasn&rsquo;t finished on this
            device.
          </p>
          <button onClick={() => router.push("/test")} className="btn-primary">
            Take the test
          </button>
        </div>
      </main>
    );
  }

  const p1Name = report?.partner1Name || partner1.name || "Partner 1";
  const p2Name = report?.partner2Name || partner2.name || "Partner 2";

  return (
    <main className="flex-1 px-5 py-10">
      <div className="mx-auto w-full max-w-2xl space-y-4">
        {/* 1 — FREE: score + verdict */}
        <section className="card space-y-4 p-6 text-center sm:p-8">
          <p className="text-sm font-semibold text-ink-500">
            {p1Name} &amp; {p2Name}
          </p>
          <ScoreRing score={teaser.overallScore} />
          <span className="pill bg-blush-100 text-blush-600">{teaser.verdict}</span>
        </section>

        {/* 2 — FREE: your couple in one line */}
        <section className="card p-6 text-center sm:p-8">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-wide text-ink-500">
            Your Couple in One Line
          </p>
          <p className="text-xl font-extrabold leading-snug text-ink-900 sm:text-2xl">
            {teaser.coupleLine}
          </p>
        </section>

        {/* 3 — PAID */}
        <PaidSlot
          title="How You See Each Other"
          emoji="👀"
          data={report?.seeEachOther ?? null}
          onUnlock={unlock}
          render={(see) => (
            <>
              <PartnerColumns
                p1Name={p1Name}
                p2Name={p2Name}
                p1Text={see.partner1View}
                p2Text={see.partner2View}
              />
              <div className="rounded-2xl bg-lilac-50 p-4">
                <p className="mb-1.5 text-xs font-extrabold uppercase tracking-wide text-lilac-500">
                  Where it doesn&rsquo;t line up
                </p>
                <Paragraphs text={see.mismatch} />
              </div>
            </>
          )}
        />

        {/* 4 — FREE: the five scores */}
        <section className="card space-y-4 p-6">
          <h2 className="text-lg font-extrabold text-ink-900">Your five scores</h2>
          {teaser.categories.map((category) => (
            <div key={category.id} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-bold text-ink-900">{category.name}</span>
                <span
                  className={`text-lg font-extrabold ${scoreTone(category.score).text}`}
                >
                  {category.score}
                </span>
              </div>
              <CategoryBar score={category.score} />
              <p className="text-sm leading-relaxed text-ink-700">
                {category.headline}
              </p>
            </div>
          ))}
        </section>

        {/* 5 — PAID */}
        <PaidSlot
          title="Your Conflict DNA"
          emoji="🧬"
          data={report?.conflictDNA ?? null}
          onUnlock={unlock}
          render={(dna) => (
            <>
              <span className="pill bg-blush-100 text-blush-600">{dna.pattern}</span>
              <Paragraphs text={dna.description} />
              <div className="rounded-2xl bg-blush-50 p-4">
                <p className="mb-1.5 text-xs font-extrabold uppercase tracking-wide text-blush-600">
                  How it plays out for you
                </p>
                <Paragraphs text={dna.howItPlaysOut} />
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="mb-1.5 text-xs font-extrabold uppercase tracking-wide text-emerald-700">
                  What to do about it
                </p>
                <Paragraphs text={dna.advice} />
              </div>
            </>
          )}
        />

        {/* 6 — FREE: blind spots */}
        {teaser.blindSpots.length > 0 && (
          <SectionCard title="Your Blind Spots" emoji="🫥">
            <p className="text-sm text-ink-700">
              Places your answers pulled in different directions.
            </p>
            <div className="flex flex-wrap gap-2">
              {teaser.blindSpots.map((spot) => (
                <span key={spot} className="pill bg-amber-100 text-amber-700">
                  {spot}
                </span>
              ))}
            </div>
          </SectionCard>
        )}

        {settling && !report?.paid && (
          <div className="card p-5 text-center text-sm font-semibold text-ink-700">
            💳 Payment received — unlocking your report…
          </div>
        )}

        {/* The main CTA sits after the last free section that precedes the
            longest run of locked ones. */}
        {report && !report.paid && (
          <UnlockCallout
            onUnlock={unlock}
            loading={checkoutLoading}
            error={checkoutError}
          />
        )}

        {/* 7 — PAID */}
        <PaidSlot
          title="The Gap Map"
          emoji="🗺️"
          data={report?.gapMap ?? null}
          onUnlock={unlock}
          render={(gapMap) => (
            <>
              <div className="space-y-3">
                {gapMap.scaleGaps.map((gap) => {
                  const tone = GAP_TONE[gap.gapSize] ?? GAP_TONE.minor;
                  return (
                    <div key={gap.topic} className="rounded-2xl bg-lilac-50 p-4">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <p className="font-bold text-ink-900">{gap.topic}</p>
                        <span className={`pill ${tone.className}`}>{tone.label}</span>
                      </div>
                      <PartnerColumns
                        p1Name={p1Name}
                        p2Name={p2Name}
                        p1Text={gap.partner1Position}
                        p2Text={gap.partner2Position}
                      />
                      <p className="mt-3 text-sm leading-relaxed text-ink-700">
                        {gap.comment}
                      </p>
                    </div>
                  );
                })}
              </div>

              {gapMap.blitzSplits.length > 0 && (
                <div className="space-y-2 pt-1">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-ink-500">
                    Where you split on the quick round
                  </p>
                  {gapMap.blitzSplits.map((split) => (
                    <div key={split.statement} className="rounded-2xl bg-blush-50 p-4">
                      <p className="font-semibold text-ink-900">{split.statement}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="pill bg-[var(--color-p1-soft)] text-[var(--color-p1)]">
                          {p1Name}:{" "}
                          {split.partner1 === "fine" ? "👍 Fine" : "👎 Dealbreaker"}
                        </span>
                        <span className="pill bg-[var(--color-p2-soft)] text-[var(--color-p2)]">
                          {p2Name}:{" "}
                          {split.partner2 === "fine" ? "👍 Fine" : "👎 Dealbreaker"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-ink-700">
                        {split.insight}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-2xl bg-lilac-50 p-4">
                <Paragraphs text={gapMap.overallInsight} />
              </div>
            </>
          )}
        />

        {/* 8 — PAID */}
        <PaidSlot
          title="What You're Really Afraid to Lose"
          emoji="💗"
          data={report?.afraidToLose ?? null}
          onUnlock={unlock}
          render={(afraid) => (
            <>
              <PartnerColumns
                p1Name={p1Name}
                p2Name={p2Name}
                p1Text={afraid.partner1}
                p2Text={afraid.partner2}
              />
              <Paragraphs text={afraid.alignment} />
            </>
          )}
        />

        {/* 9 — FREE: the blitz round in one line */}
        <section className="card p-6 text-center">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-ink-500">
            Your Boundaries
          </p>
          <p className="text-base font-bold leading-snug text-ink-900">
            {teaser.flagSummary}
          </p>
        </section>

        {/* 10 — PAID */}
        <PaidSlot
          title="The Uncomfortable Truth"
          emoji="🪞"
          data={report?.uncomfortableTruth ?? null}
          onUnlock={unlock}
          render={(truth) => (
            <>
              <p className="text-lg font-extrabold leading-snug text-ink-900">
                {truth.headline}
              </p>
              <Paragraphs text={truth.explanation} />
            </>
          )}
        />

        {/* 11 — PAID */}
        <PaidSlot
          title="3 Things You're Getting Right"
          emoji="✅"
          data={report?.gettingRight ?? null}
          onUnlock={unlock}
          render={(items) => (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.title} className="rounded-2xl bg-emerald-50 p-4">
                  <p className="font-bold text-ink-900">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-700">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          )}
        />

        {/* 12 — PAID */}
        <PaidSlot
          title="Your Action Plan"
          emoji="🗓️"
          data={report?.actionPlan ?? null}
          onUnlock={unlock}
          render={(steps) => (
            <ol className="space-y-3">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blush-100 text-sm font-extrabold text-blush-600">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-bold text-ink-900">{step.title}</p>
                    <p className="text-sm leading-relaxed text-ink-700">
                      {step.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        />

        {/* 13 — PAID */}
        <PaidSlot
          title="Talk About This Tonight"
          emoji="💬"
          data={report?.conversationStarters ?? null}
          onUnlock={unlock}
          render={(questions) => (
            <ul className="space-y-2">
              {questions.map((question) => (
                <li
                  key={question}
                  className="rounded-2xl bg-blush-50 px-4 py-3 text-sm text-ink-700"
                >
                  &ldquo;{question}&rdquo;
                </li>
              ))}
            </ul>
          )}
        />

        <p className="pt-4 text-center text-xs text-ink-300">
          This is an AI-generated read on your answers, not therapy or clinical
          advice.{" "}
          <Link href="/" className="underline hover:text-ink-500">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}

function CenteredNote({ emoji, title }: { emoji: string; title: string }) {
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-12">
      <div className="space-y-3 text-center">
        <div className="animate-heartbeat text-4xl">{emoji}</div>
        <p className="font-semibold text-ink-700">{title}</p>
      </div>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<CenteredNote emoji="💗" title="Loading your results…" />}>
      <ResultContent />
    </Suspense>
  );
}
