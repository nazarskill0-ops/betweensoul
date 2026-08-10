"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { openCheckout } from "@/lib/paddle";
import { useTestStore } from "@/store/useTestStore";
import { useStoreHydrated } from "@/store/useHydrated";
import { FreeSections, PaidSections, PaidStatus } from "@/lib/types";

const PRICE = "$9.99";
const POLL_INTERVAL_MS = 2000;
/** ~4 minutes. Five parallel Sonnet requests; this leaves room for a retry. */
const MAX_POLLS = 120;

/**
 * What /api/report/[id] returns. `paidSections` is null — not withheld — until
 * the deep analysis has been generated, so there is nothing in an unpaid
 * payload for a determined reader to dig out.
 */
interface ReportResponse {
  id: string;
  paid: boolean;
  paidStatus: PaidStatus;
  partner1Name: string;
  partner2Name: string;
  free: FreeSections;
  paidSections: PaidSections | null;
  /** Paid for, but the deep analysis hasn't been generated yet. */
  needsUnlock: boolean;
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

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-lilac-100">
      <div
        className={`animate-bar h-full rounded-full ${scoreTone(score).bar}`}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

/** One labelled score with its bar — used by the radar and the scenario lab. */
function ScoredRow({
  name,
  score,
  children,
}: {
  name: string;
  score: number;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-bold text-ink-900">{name}</span>
        <span className={`text-lg font-extrabold ${scoreTone(score).text}`}>{score}</span>
      </div>
      <ScoreBar score={score} />
      {children}
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

/** A labelled block of prose — the shape most sections take. */
function Panel({
  label,
  tone = "lilac",
  children,
}: {
  label: string;
  tone?: "lilac" | "blush" | "emerald" | "amber";
  children: React.ReactNode;
}) {
  const [bg, text] = {
    lilac: "bg-lilac-50 text-lilac-500",
    blush: "bg-blush-50 text-blush-600",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  }[tone].split(" ");

  return (
    <div className={`rounded-2xl ${bg} p-4`}>
      <p className={`mb-1.5 text-xs font-extrabold uppercase tracking-wide ${text}`}>
        {label}
      </p>
      {children}
    </div>
  );
}

/** Side-by-side partner panels. */
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
 * says nothing: the real analysis has not been generated yet, so there is
 * nothing here to un-blur.
 */
const PLACEHOLDER_LINES = [
  "Analysis reveals a consistent pattern in how each of you described the other, and the places where those two accounts stop agreeing.",
  "The answers you gave separately line up on most of this, with two exceptions that shape more of the day-to-day than either of you has said out loud.",
  "What follows sets out where that shows up, what it is costing, and the specific change that moves it.",
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

/** Shown while the deep analysis is being written. */
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
  generating,
  onUnlock,
  render,
}: {
  title: string;
  emoji: string;
  data: T | undefined | null;
  generating: boolean;
  onUnlock: () => void;
  render: (data: T) => React.ReactNode;
}) {
  if (data === undefined || data === null) {
    return generating ? (
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
          Ten more sections are ready to write
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
          One-time payment. No subscription. Secure checkout by Paddle.
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

  const {
    partner1,
    partner2,
    email,
    reportId: storedReportId,
    teaser: storedTeaser,
  } = useTestStore();

  // `id` is what /analyzing pushes; `report` is what a Paddle receipt link
  // carries. Fall back to the store for an in-session visit.
  const reportId =
    searchParams.get("id") ?? searchParams.get("report") ?? storedReportId;

  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "notfound">(
    "loading",
  );
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  // True once Paddle confirms payment in the browser — or on arrival from a
  // receipt link. Either way it only means "the webhook is on its way", so the
  // page keeps polling instead of rendering anything as unlocked.
  const [justPaid, setJustPaid] = useState(
    () => searchParams.get("paid") === "1",
  );
  const pollsRef = useRef(0);
  /** One unlock request per page load — the webhook may also be running one. */
  const unlockRequested = useRef(false);

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

      // Paid for but not generated: ask for it. The webhook usually gets there
      // first, in which case this returns 202 and the poll below picks up the
      // result — but it means a report is never left ungenerated just because
      // the webhook was slow or lost.
      if (data.needsUnlock && !unlockRequested.current) {
        unlockRequested.current = true;
        void fetch(`/api/report/${reportId}/unlock`, { method: "POST" }).catch(
          (error) => console.error("[result] unlock request failed:", error),
        );
      }

      // Keep polling while the deep dive is being written, and — coming back
      // from checkout — while the webhook that authorises it hasn't landed.
      const waiting = data.needsUnlock || (justPaid && !data.paid);

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
      await openCheckout({
        reportId,
        email: email || undefined,
        // Payment confirmed in the overlay. The webhook does the unlocking, so
        // all this does is restart the poll and reset its budget.
        onCompleted: () => {
          pollsRef.current = 0;
          unlockRequested.current = false;
          setJustPaid(true);
        },
      });
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : "Could not start checkout.",
      );
    } finally {
      // The overlay is Paddle's from here; the button goes back to normal
      // behind it so closing the overlay doesn't leave it stuck on "Opening…".
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
  const paid = report?.paid ?? false;
  const paidSections = report?.paidSections ?? null;
  const generating = Boolean(report?.needsUnlock) || (justPaid && !paid);

  return (
    <main className="flex-1 px-5 py-10">
      <div className="mx-auto w-full max-w-2xl space-y-4">
        {/* 1 — FREE: your couple score */}
        <section className="card space-y-4 p-6 text-center sm:p-8">
          <p className="text-sm font-semibold text-ink-500">
            {p1Name} &amp; {p2Name}
          </p>
          <ScoreRing score={free.coupleScore.overall} />
          <div className="grid gap-3 sm:grid-cols-3">
            {(
              [
                ["Connection", free.coupleScore.connection],
                ["Stability", free.coupleScore.stability],
                ["Chemistry", free.coupleScore.chemistry],
              ] as const
            ).map(([label, score]) => (
              <div key={label} className="rounded-2xl bg-lilac-50 p-3">
                <p className={`text-2xl font-extrabold ${scoreTone(score).text}`}>
                  {score}
                </p>
                <p className="text-xs font-semibold text-ink-500">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm leading-relaxed text-ink-700">
            {free.coupleScore.insight}
          </p>
        </section>

        {/* 2 — FREE: your couple dynamic */}
        <section className="card space-y-3 p-6 sm:p-8">
          <p className="text-center text-xs font-extrabold uppercase tracking-wide text-ink-500">
            Your Couple Dynamic
          </p>
          <p className="text-center text-2xl font-extrabold leading-snug text-ink-900 sm:text-3xl">
            {free.coupleDynamic.name}
          </p>
          <Paragraphs text={free.coupleDynamic.description} />
          <Panel label="What works" tone="emerald">
            <Paragraphs text={free.coupleDynamic.whatWorks} />
          </Panel>
          <Panel label="Where it gets difficult" tone="amber">
            <Paragraphs text={free.coupleDynamic.whereItGetsDifficult} />
          </Panel>
        </section>

        {/* 3 — FREE: the radar */}
        <SectionCard title="Relationship Radar" emoji="📡">
          <div className="space-y-4">
            {free.radar.dimensions.map((dimension) => (
              <ScoredRow
                key={dimension.id}
                name={dimension.name}
                score={dimension.score}
              >
                <p className="text-sm leading-relaxed text-ink-700">
                  {dimension.insight}
                </p>
              </ScoredRow>
            ))}
          </div>
          <Panel label="How these connect">
            <Paragraphs text={free.radar.interconnection} />
          </Panel>
        </SectionCard>

        {/* 4 — FREE: biggest strength */}
        <SectionCard title="Your Biggest Strength" emoji="💪">
          <ScoredRow
            name={free.biggestStrength.dimensionName}
            score={free.biggestStrength.score}
          />
          <Paragraphs text={free.biggestStrength.explanation} />
          <Panel label="Why it matters" tone="emerald">
            <Paragraphs text={free.biggestStrength.whyItMatters} />
          </Panel>
        </SectionCard>

        {/* 5 — FREE: biggest tension */}
        <SectionCard title="Your Biggest Tension" emoji="⚡">
          <ScoredRow
            name={free.biggestTension.dimensionName}
            score={free.biggestTension.score}
          />
          <Paragraphs text={free.biggestTension.explanation} />
        </SectionCard>

        {/* 6 — FREE: you vs your partner */}
        <SectionCard title="You vs Your Partner" emoji="⚖️">
          <div className="flex justify-between text-xs font-extrabold">
            <span className="text-[var(--color-p1)]">{p1Name}</span>
            <span className="text-[var(--color-p2)]">{p2Name}</span>
          </div>
          <div className="space-y-4">
            {free.sliders.map((slider) => (
              <div key={slider.question} className="space-y-2">
                <p className="text-sm font-semibold text-ink-900">{slider.question}</p>
                <div className="relative h-2 rounded-full bg-gradient-to-r from-[var(--color-p1-soft)] to-[var(--color-p2-soft)]">
                  <span
                    className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-lilac-400 shadow-sm"
                    style={{ left: `${slider.partner1Position}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 7 — FREE: the perception gap */}
        <SectionCard title="The Perception Gap" emoji="🔀">
          {free.perceptionGap.shown.map((gap) => (
            <div key={gap.topic} className="space-y-2">
              <p className="font-bold text-ink-900">{gap.topic}</p>
              <PartnerColumns
                p1Name={p1Name}
                p2Name={p2Name}
                p1Text={gap.partner1Said}
                p2Text={gap.partner2Said}
              />
              <Paragraphs text={gap.aiComment} />
            </div>
          ))}
          {!paidSections &&
            free.perceptionGap.totalGapsFound > free.perceptionGap.shown.length && (
              <p className="text-sm font-semibold text-ink-500">
                🔒 {free.perceptionGap.totalGapsFound - free.perceptionGap.shown.length}{" "}
                more {free.perceptionGap.totalGapsFound - free.perceptionGap.shown.length === 1 ? "gap" : "gaps"}{" "}
                in the full report.
              </p>
            )}
        </SectionCard>

        {/* 8 — FREE (with a paid third item each) */}
        <SectionCard title="3 Things They May Not Say Directly" emoji="🤐">
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                {
                  name: p1Name,
                  side: free.unsaidThings.partner1,
                  unlocked: paidSections?.unsaidThingsUnlocked.partner1,
                  // Written out rather than interpolated: Tailwind only emits
                  // classes it can find as literal strings in the source.
                  panel: "bg-[var(--color-p1-soft)]",
                  label: "text-[var(--color-p1)]",
                },
                {
                  name: p2Name,
                  side: free.unsaidThings.partner2,
                  unlocked: paidSections?.unsaidThingsUnlocked.partner2,
                  panel: "bg-[var(--color-p2-soft)]",
                  label: "text-[var(--color-p2)]",
                },
              ] as const
            ).map(({ name, side, unlocked, panel, label }) => (
              <div key={name} className={`rounded-2xl ${panel} p-4`}>
                <p className={`text-xs font-extrabold ${label}`}>{name}</p>
                <ul className="mt-2 space-y-2">
                  {side.shown.map((item) => (
                    <li key={item} className="text-sm leading-relaxed text-ink-700">
                      {item}
                    </li>
                  ))}
                  {unlocked ? (
                    <li className="text-sm leading-relaxed text-ink-700">{unlocked}</li>
                  ) : (
                    <li className="locked-preview text-sm leading-relaxed text-ink-700" aria-hidden>
                      The third one is the one neither of them has put into words yet.
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 9 — FREE: flags */}
        <SectionCard title="Green Flags & Watch-outs" emoji="🚩">
          <Panel label="Green flags" tone="emerald">
            <ul className="space-y-1">
              {free.flags.greenFlags.map((flag) => (
                <li key={flag} className="text-sm text-ink-700">
                  ✅ {flag}
                </li>
              ))}
            </ul>
          </Panel>
          <Panel label="Watch-outs" tone="amber">
            <ul className="space-y-1">
              {free.flags.watchOuts.map((item) => (
                <li key={item} className="text-sm text-ink-700">
                  👀 {item}
                </li>
              ))}
            </ul>
          </Panel>
        </SectionCard>

        {/* 10 — FREE: scenario previews */}
        <SectionCard title="What Happens If…" emoji="🔮">
          <div className="space-y-2">
            {free.scenarios.map((scenario) => (
              <div key={scenario.id} className="rounded-2xl bg-lilac-50 p-4">
                <p className="text-sm font-extrabold text-ink-900">{scenario.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-700">
                  {scenario.teaser}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 11 — FREE: the question */}
        <section className="card space-y-3 p-6 text-center sm:p-8">
          <p className="text-xs font-extrabold uppercase tracking-wide text-ink-500">
            The Question
          </p>
          <p className="text-xl font-extrabold leading-snug text-ink-900">
            &ldquo;{free.theQuestion.question}&rdquo;
          </p>
          <p className="text-sm text-ink-700">{free.theQuestion.hook}</p>
        </section>

        {/* The main CTA, or the post-payment status. */}
        {!paid && (
          <UnlockCallout
            onUnlock={unlock}
            loading={checkoutLoading}
            error={checkoutError}
          />
        )}
        {generating && (
          <section className="card space-y-2 p-6 text-center">
            <div className="animate-heartbeat text-3xl">💗</div>
            <h2 className="text-lg font-extrabold text-ink-900">
              Writing your full report…
            </h2>
            <p className="text-sm text-ink-700">
              Ten more sections, read from all 15 answers at once. Usually about
              a minute — you can leave this page and come back to the same link.
            </p>
          </section>
        )}

        {/* 12 — PAID: the full x-ray */}
        <PaidSlot
          title="Full Relationship X-Ray"
          emoji="🩻"
          data={paidSections?.fullXRay}
          generating={generating}
          onUnlock={unlock}
          render={(xray) => (
            <div className="space-y-5">
              {xray.map((dimension) => (
                <div key={dimension.dimensionId} className="space-y-2">
                  <ScoredRow name={dimension.dimensionName} score={dimension.score} />
                  <Panel label="What we see">
                    <Paragraphs text={dimension.whatWeSee} />
                  </Panel>
                  <Panel label="What your answers suggest" tone="blush">
                    <Paragraphs text={dimension.whatAnswersSuggest} />
                  </Panel>
                  <Panel label="Where you differ" tone="amber">
                    <Paragraphs text={dimension.whereYouDiffer} />
                  </Panel>
                  <Panel label="What could help" tone="emerald">
                    <Paragraphs text={dimension.whatCouldHelp} />
                  </Panel>
                </div>
              ))}
            </div>
          )}
        />

        {/* 13 — PAID: every perception gap */}
        <PaidSlot
          title="All Perception Gaps"
          emoji="🪞"
          data={paidSections?.allPerceptionGaps}
          generating={generating}
          onUnlock={unlock}
          render={(gaps) => (
            <div className="space-y-5">
              {gaps.map((gap) => (
                <div key={gap.topic} className="space-y-2">
                  <p className="font-bold text-ink-900">{gap.topic}</p>
                  <PartnerColumns
                    p1Name={p1Name}
                    p2Name={p2Name}
                    p1Text={gap.partner1Said}
                    p2Text={gap.partner2Said}
                  />
                  <Paragraphs text={gap.whatThisMayMean} />
                  <Panel label="Why it matters" tone="amber">
                    <Paragraphs text={gap.whyItMatters} />
                  </Panel>
                  <Panel label="The conversation to have" tone="emerald">
                    <p className="text-sm leading-relaxed text-ink-700">
                      &ldquo;{gap.conversationToHave}&rdquo;
                    </p>
                  </Panel>
                </div>
              ))}
            </div>
          )}
        />

        {/* 14 — PAID: your conflict fingerprint */}
        <PaidSlot
          title="Your Conflict Fingerprint"
          emoji="🧬"
          data={paidSections?.conflictFingerprint}
          generating={generating}
          onUnlock={unlock}
          render={(cycle) => (
            <>
              <Panel label="The trigger" tone="blush">
                <Paragraphs text={cycle.trigger} />
              </Panel>
              <Panel label="The reaction" tone="blush">
                <Paragraphs text={cycle.reaction} />
              </Panel>
              <Panel label="The escalation" tone="amber">
                <Paragraphs text={cycle.escalation} />
              </Panel>
              <Panel label="The withdrawal" tone="amber">
                <Paragraphs text={cycle.withdrawal} />
              </Panel>
              <Panel label="The aftermath">
                <Paragraphs text={cycle.aftermath} />
              </Panel>
              <Panel label="The pattern">
                <Paragraphs text={cycle.pattern} />
              </Panel>
              <Panel label="What's underneath it" tone="emerald">
                <Paragraphs text={cycle.insight} />
              </Panel>
            </>
          )}
        />

        {/* 15 — PAID: how you show love vs how you feel loved */}
        <PaidSlot
          title="How You Show Love vs How You Feel Loved"
          emoji="💞"
          data={paidSections?.loveStyles}
          generating={generating}
          onUnlock={unlock}
          render={(love) => (
            <>
              <PartnerColumns
                p1Name={`${p1Name} shows love by`}
                p2Name={`${p2Name} shows love by`}
                p1Text={love.partner1Shows}
                p2Text={love.partner2Shows}
              />
              <PartnerColumns
                p1Name={`${p1Name} feels loved when`}
                p2Name={`${p2Name} feels loved when`}
                p1Text={love.partner1FeelsLovedBy}
                p2Text={love.partner2FeelsLovedBy}
              />
              <Panel label="Where you miss each other" tone="amber">
                <Paragraphs text={love.mismatch} />
              </Panel>
            </>
          )}
        />

        {/* 16 — PAID: how you see each other */}
        <PaidSlot
          title="How You See Each Other"
          emoji="👀"
          data={paidSections?.howYouSeeEachOther}
          generating={generating}
          onUnlock={unlock}
          render={(view) => (
            <>
              <PartnerColumns
                p1Name={`${p1Name} sees ${p2Name}`}
                p2Name={`${p2Name} sees ${p1Name}`}
                p1Text={view.herViewOfHim}
                p2Text={view.hisViewOfHer}
              />
              <Panel label="What you both miss" tone="lilac">
                <Paragraphs text={view.whatBothMiss} />
              </Panel>
            </>
          )}
        />

        {/* 17 — PAID: if nothing changes */}
        <PaidSlot
          title="If Nothing Changes"
          emoji="⏳"
          data={paidSections?.ifNothingChanges}
          generating={generating}
          onUnlock={unlock}
          render={(forecast) => (
            <>
              <Panel label="What stays strong" tone="emerald">
                <Paragraphs text={forecast.likelyStrengths} />
              </Panel>
              <Panel label="Pressure points" tone="amber">
                <Paragraphs text={forecast.pressurePoints} />
              </Panel>
              <Panel label="What becomes more important">
                <Paragraphs text={forecast.whatBecomesMoreImportant} />
              </Panel>
            </>
          )}
        />

        {/* 18 — PAID: what keeps you together */}
        <PaidSlot
          title="What Keeps You Together"
          emoji="💚"
          data={paidSections?.whatKeepsYouTogether}
          generating={generating}
          onUnlock={unlock}
          render={(keep) => (
            <>
              <div className="flex flex-wrap gap-2">
                {keep.anchors.map((anchor) => (
                  <span key={anchor} className="pill bg-emerald-50 text-emerald-700">
                    {anchor}
                  </span>
                ))}
              </div>
              <Panel label="The evidence" tone="emerald">
                <Paragraphs text={keep.evidence} />
              </Panel>
              <Panel label="Is it enough?">
                <Paragraphs text={keep.isItEnough} />
              </Panel>
            </>
          )}
        />

        {/* 19 — PAID: the scenario lab */}
        <PaidSlot
          title="Life Scenario Lab"
          emoji="🧪"
          data={paidSections?.scenarioLab}
          generating={generating}
          onUnlock={unlock}
          render={(lab) => (
            <div className="space-y-5">
              {lab.map((scenario) => (
                <div key={scenario.id} className="space-y-2">
                  <ScoredRow name={scenario.name} score={scenario.compatibility} />
                  <Panel label="What would work" tone="emerald">
                    <Paragraphs text={scenario.strength} />
                  </Panel>
                  <Panel label="The risk" tone="amber">
                    <Paragraphs text={scenario.risk} />
                  </Panel>
                  <Panel label="What you'd struggle with" tone="blush">
                    <Paragraphs text={scenario.whatYoudStruggleWith} />
                  </Panel>
                  <Panel label="What would help">
                    <Paragraphs text={scenario.whatWouldHelp} />
                  </Panel>
                </div>
              ))}
            </div>
          )}
        />

        {/* 20 — PAID: the 7-day reset */}
        <PaidSlot
          title="7-Day Relationship Reset"
          emoji="🗓️"
          data={paidSections?.sevenDayReset}
          generating={generating}
          onUnlock={unlock}
          render={(reset) => (
            <>
              <Panel label="Day 1 — ask this" tone="blush">
                <Paragraphs text={reset.day1Question} />
              </Panel>
              <Panel label="Day 2 — try this" tone="lilac">
                <Paragraphs text={reset.day2Action} />
              </Panel>
              <Panel label="Day 3 — do this" tone="emerald">
                <Paragraphs text={reset.day3Date} />
              </Panel>
              <Paragraphs text={reset.whyThisWorks} />
            </>
          )}
        />

        {/* 21 — PAID: the answer */}
        <PaidSlot
          title="The Answer"
          emoji="🕯️"
          data={paidSections?.theAnswer}
          generating={generating}
          onUnlock={unlock}
          render={(answer) => (
            <>
              <Paragraphs text={answer.synthesis} />
              <Panel label="Talk about this tonight" tone="blush">
                <p className="text-base font-extrabold leading-snug text-ink-900">
                  &ldquo;{answer.questionToDiscussTonight}&rdquo;
                </p>
              </Panel>
              <ul className="space-y-2">
                {answer.conversationStarters.map((starter) => (
                  <li
                    key={starter}
                    className="rounded-2xl bg-blush-50 px-4 py-3 text-sm text-ink-700"
                  >
                    &ldquo;{starter}&rdquo;
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
