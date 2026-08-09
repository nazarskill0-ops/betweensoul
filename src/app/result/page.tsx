"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTestStore } from "@/store/useTestStore";
import { useStoreHydrated } from "@/store/useHydrated";
import {
  BiggestMisunderstanding,
  BiggestQuestion,
  BiggestSurprise,
  ConflictDNA,
  FreeReport,
  HowYouLove,
  IfNothingChanges,
  PaidStatus,
  SeeEachOther,
  WhatKeepsYouTogether,
} from "@/lib/types";

const PRICE = "$9.99";
const POLL_INTERVAL_MS = 2000;
/** ~4 minutes. The Sonnet pass measures ~70s; this leaves room for a retry. */
const MAX_POLLS = 120;

/**
 * What /api/report/[id] returns. The paid fields are simply absent until
 * `paidStatus` is "ready" — they don't exist server-side before then, so there
 * is nothing withheld in the payload for a determined reader to dig out.
 */
interface ReportResponse {
  paidStatus: PaidStatus;
  partner1Name: string;
  partner2Name: string;
  free: FreeReport;
  biggestSurprise?: BiggestSurprise;
  seeEachOther?: SeeEachOther;
  biggestMisunderstanding?: BiggestMisunderstanding;
  conflictDNA?: ConflictDNA;
  howYouLove?: HowYouLove;
  ifNothingChanges?: IfNothingChanges;
  whatKeepsYouTogether?: WhatKeepsYouTogether;
  biggestQuestion?: BiggestQuestion;
}

function scoreTone(score: number) {
  if (score >= 85) return { text: "text-emerald-600", bar: "bg-emerald-400" };
  if (score >= 70) return { text: "text-blush-600", bar: "bg-blush-400" };
  if (score >= 55) return { text: "text-amber-600", bar: "bg-amber-400" };
  return { text: "text-rose-600", bar: "bg-rose-400" };
}

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

/** A labelled block of prose — the shape most paid sections take. */
function Panel({
  label,
  tone,
  children,
}: {
  label: string;
  tone: "lilac" | "blush" | "emerald" | "amber";
  children: React.ReactNode;
}) {
  const styles = {
    lilac: "bg-lilac-50 text-lilac-500",
    blush: "bg-blush-50 text-blush-600",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  }[tone];
  const [bg, text] = styles.split(" ");

  return (
    <div className={`rounded-2xl ${bg} p-4`}>
      <p className={`mb-1.5 text-xs font-extrabold uppercase tracking-wide ${text}`}>
        {label}
      </p>
      {children}
    </div>
  );
}

/* --------------------------------- paywall -------------------------------- */

/**
 * Filler for locked sections. Identical for every section and deliberately
 * says nothing: the real analysis has not been generated yet, so there is
 * nothing here to un-blur.
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

/** Shown while Sonnet is writing the deep dive. */
function GeneratingSection({ title, emoji }: { title: string; emoji: string }) {
  return (
    <section className="card overflow-hidden p-6">
      <h2 className="flex items-center gap-2 text-lg font-extrabold text-ink-900">
        <span>{emoji}</span>
        <span className="flex-1">{title}</span>
        <span className="animate-heartbeat text-base">✨</span>
      </h2>
      <div className="mt-4 space-y-2.5" aria-hidden>
        <div className="h-3 w-full animate-pulse rounded-full bg-blush-50" />
        <div className="h-3 w-11/12 animate-pulse rounded-full bg-blush-50" />
        <div className="h-3 w-9/12 animate-pulse rounded-full bg-blush-50" />
      </div>
    </section>
  );
}

/**
 * One paid section. `data` only exists once the deep dive is stored, so
 * `render` — the only thing that can produce real content — is never called
 * before then.
 */
function PaidSlot<T>({
  title,
  emoji,
  data,
  status,
  onUnlock,
  render,
}: {
  title: string;
  emoji: string;
  data: T | undefined;
  status: PaidStatus;
  onUnlock: () => void;
  render: (data: T) => React.ReactNode;
}) {
  if (data === undefined) {
    return status === "processing" ? (
      <GeneratingSection title={title} emoji={emoji} />
    ) : (
      <LockedSection title={title} emoji={emoji} onUnlock={onUnlock} />
    );
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
          Your full report is ready to write
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
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const pollsRef = useRef(0);

  const fetchReport = useCallback(async (id: string) => {
    const response = await fetch(`/api/report/${id}`);
    if (!response.ok) return null;
    return (await response.json()) as ReportResponse;
  }, []);

  useEffect(() => {
    // Nothing to fetch until the store has rehydrated and given us an id.
    if (!hydrated || !reportId) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const load = async () => {
      const data = await fetchReport(reportId);
      if (cancelled) return;

      if (!data) {
        setLoadState("notfound");
        return;
      }

      setReport(data);
      setLoadState("ready");

      // Keep polling while the deep dive is being written, and — coming back
      // from checkout — while the webhook that starts it hasn't landed yet.
      const waiting =
        data.paidStatus === "processing" ||
        (justPaid && data.paidStatus === "unpaid");

      if (waiting && pollsRef.current < MAX_POLLS) {
        pollsRef.current += 1;
        timer = setTimeout(load, POLL_INTERVAL_MS);
      }
    };

    void load();
    return () => {
      cancelled = true;
      clearTimeout(timer);
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

  const free = report?.free ?? storedTeaser;

  if (!reportId || loadState === "notfound" || !free) {
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
  const status: PaidStatus = report?.paidStatus ?? "unpaid";

  return (
    <main className="flex-1 px-5 py-10">
      <div className="mx-auto w-full max-w-2xl space-y-4">
        {/* 1 — FREE: score + verdict */}
        <section className="card space-y-4 p-6 text-center sm:p-8">
          <p className="text-sm font-semibold text-ink-500">
            {p1Name} &amp; {p2Name}
          </p>
          <ScoreRing score={free.overallScore} />
          <span className="pill bg-blush-100 text-blush-600">{free.verdict}</span>
        </section>

        {/* 2 — FREE: the archetype */}
        <section className="card p-6 text-center sm:p-8">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-wide text-ink-500">
            Your Hidden Dynamic
          </p>
          <p className="mb-3 text-2xl font-extrabold leading-snug text-ink-900 sm:text-3xl">
            {free.hiddenDynamic.type}
          </p>
          <p className="text-sm leading-relaxed text-ink-700">
            {free.hiddenDynamic.description}
          </p>
        </section>

        {/* 3 — PAID */}
        <PaidSlot
          title="The Thing We Didn't Expect"
          emoji="🤯"
          data={report?.biggestSurprise}
          status={status}
          onUnlock={unlock}
          render={(surprise) => <Paragraphs text={surprise.insight} />}
        />

        {/* 4 — FREE: the five scores */}
        <section className="card space-y-4 p-6">
          <h2 className="text-lg font-extrabold text-ink-900">Your five scores</h2>
          {free.categories.map((category) => (
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

        {/* The main CTA, or the post-payment status. */}
        {status === "unpaid" && (
          <UnlockCallout
            onUnlock={unlock}
            loading={checkoutLoading}
            error={checkoutError}
          />
        )}
        {status === "processing" && (
          <section className="card space-y-2 p-6 text-center">
            <div className="animate-heartbeat text-3xl">💗</div>
            <h2 className="text-lg font-extrabold text-ink-900">
              Generating your deep analysis…
            </h2>
            <p className="text-sm text-ink-700">
              This one takes a little longer — it&rsquo;s reading all 15 answers
              at once, in one pass. Usually about a minute.
            </p>
          </section>
        )}

        {/* 5 — PAID */}
        <PaidSlot
          title="How You See Each Other"
          emoji="👀"
          data={report?.seeEachOther}
          status={status}
          onUnlock={unlock}
          render={(see) => (
            <>
              <PartnerColumns
                p1Name={p1Name}
                p2Name={p2Name}
                p1Text={see.partner1View}
                p2Text={see.partner2View}
              />
              <Panel label="What that says about you" tone="lilac">
                <Paragraphs text={see.dynamic} />
              </Panel>
            </>
          )}
        />

        {/* 6 — PAID */}
        <PaidSlot
          title="The Biggest Misunderstanding"
          emoji="🔀"
          data={report?.biggestMisunderstanding}
          status={status}
          onUnlock={unlock}
          render={(gap) => (
            <div className="space-y-2">
              <div className="rounded-2xl bg-[var(--color-p1-soft)] p-4">
                <p className="text-sm leading-relaxed text-ink-900">
                  {gap.partner1Thinks}
                </p>
              </div>
              <div className="rounded-2xl bg-[var(--color-p2-soft)] p-4">
                <p className="text-sm leading-relaxed text-ink-900">
                  {gap.partner2Experiences}
                </p>
              </div>
            </div>
          )}
        />

        {/* 7 — PAID */}
        <PaidSlot
          title="Your Conflict DNA"
          emoji="🧬"
          data={report?.conflictDNA}
          status={status}
          onUnlock={unlock}
          render={(dna) => (
            <>
              <span className="pill bg-blush-100 text-blush-600">{dna.pattern}</span>
              <Panel label="What starts it" tone="blush">
                <Paragraphs text={dna.trigger} />
              </Panel>
              <Panel label="How it escalates" tone="amber">
                <Paragraphs text={dna.escalation} />
              </Panel>
              <Panel label="What happens after" tone="lilac">
                <Paragraphs text={dna.aftermath} />
              </Panel>
              <Panel label="The real issue underneath" tone="emerald">
                <Paragraphs text={dna.insight} />
              </Panel>
            </>
          )}
        />

        {/* 8 — FREE: the blitz round in one line */}
        <section className="card p-6 text-center">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-ink-500">
            Your Boundaries
          </p>
          <p className="text-base font-bold leading-snug text-ink-900">
            {free.flagSummary}
          </p>
        </section>

        {/* 9 — PAID */}
        <PaidSlot
          title="How Each of You Loves"
          emoji="💞"
          data={report?.howYouLove}
          status={status}
          onUnlock={unlock}
          render={(love) => (
            <>
              <PartnerColumns
                p1Name={p1Name}
                p2Name={p2Name}
                p1Text={love.partner1}
                p2Text={love.partner2}
              />
              <Panel label="Where that rubs" tone="amber">
                <Paragraphs text={love.friction} />
              </Panel>
            </>
          )}
        />

        {/* 10 — PAID */}
        <PaidSlot
          title="If Nothing Changes…"
          emoji="⚠️"
          data={report?.ifNothingChanges}
          status={status}
          onUnlock={unlock}
          render={(forecast) => (
            <>
              <p className="text-lg font-extrabold leading-snug text-ink-900">
                {forecast.prediction}
              </p>
              <Panel label="Why we think so" tone="lilac">
                <Paragraphs text={forecast.why} />
              </Panel>
            </>
          )}
        />

        {/* 11 — PAID */}
        <PaidSlot
          title="What's Secretly Keeping This Alive"
          emoji="💚"
          data={report?.whatKeepsYouTogether}
          status={status}
          onUnlock={unlock}
          render={(keep) => (
            <>
              <p className="text-lg font-extrabold leading-snug text-ink-900">
                {keep.core}
              </p>
              <Panel label="The evidence" tone="emerald">
                <Paragraphs text={keep.evidence} />
              </Panel>
            </>
          )}
        />

        {/* 12 — PAID */}
        <PaidSlot
          title="The One Question"
          emoji="❓"
          data={report?.biggestQuestion}
          status={status}
          onUnlock={unlock}
          render={(one) => (
            <>
              <p className="text-xl font-extrabold leading-snug text-ink-900">
                &ldquo;{one.question}&rdquo;
              </p>
              <p className="text-xs font-extrabold uppercase tracking-wide text-ink-500">
                Talk about this tonight
              </p>
              <ul className="space-y-2">
                {one.conversationStarters.map((question) => (
                  <li
                    key={question}
                    className="rounded-2xl bg-blush-50 px-4 py-3 text-sm text-ink-700"
                  >
                    &ldquo;{question}&rdquo;
                  </li>
                ))}
              </ul>
            </>
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
