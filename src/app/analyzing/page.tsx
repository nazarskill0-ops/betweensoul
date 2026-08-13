"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTestStore } from "@/store/useTestStore";
import { useStoreHydrated } from "@/store/useHydrated";
import { FreeSections } from "@/lib/types";

/**
 * The wait is part of the product.
 *
 * The five parallel Haiku requests take 15-20s, so a nine-second animation left
 * the reader staring at a finished progress ring wondering if it had hung. The
 * timeline now runs the length of the real work and narrates it: eight steps,
 * each naming something the analysis is actually doing.
 *
 * If the report arrives early the animation still finishes — cutting to the
 * result the instant the API returns makes the analysis feel cheap. If it
 * arrives late, the last step holds at 95% rather than sitting at 100% while
 * nothing happens.
 */
const STEPS = [
  "Reading your answers",
  "Comparing your perspectives",
  "Analyzing communication patterns",
  "Measuring emotional alignment",
  "Cross-referencing your responses",
  "Identifying perception gaps",
  "Building your relationship profile",
  "Finalizing your CoupleScan report",
];

const STEP_MS = 3000;
/** The last step runs long — it's the one that absorbs a slow response. */
const TOTAL_MS = STEPS.length * STEP_MS + 1000;

/** Past this, something is wrong rather than slow. */
const TIMEOUT_MS = 60000;

/** Where the ring parks while the report is still being written. */
const HOLD_AT = 95;

const RING_CIRCUMFERENCE = 2 * Math.PI * 54;

/**
 * Reads a response that is *supposed* to be JSON.
 *
 * `response.json()` on an empty body throws "Unexpected end of JSON input",
 * which is what the reader then sees in place of an explanation — the failure
 * of the error path rather than the failure itself. A route that dies without
 * writing a body, a proxy timeout and a gateway error page all land here, so
 * the parse is allowed to fail and the caller decides what to say.
 */
async function readJson(
  response: Response,
): Promise<Record<string, unknown> | null> {
  const text = await response.text();
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/* --------------------------- the refresh guard ---------------------------- */

/**
 * A hard refresh of this page remounts it, and the effect below fires a second
 * POST for a submission that has already been analyzed.
 *
 * The server is idempotent — the report id is a hash of the answers, so the
 * repeat is a Redis lookup rather than another five model requests — but it is
 * still a request against a limit of five per hour, and a reader who refreshes
 * a few times would lock themselves out of their own report. So the id is
 * remembered for the tab and the second POST is never sent.
 *
 * Keyed by a fingerprint of the submission, so starting a different test in the
 * same tab doesn't redirect to the previous couple's report.
 */
const GUARD_KEY = "couplescan:analyzed";

/** djb2. Not security, just "are these the same answers as a moment ago". */
function fingerprint(payload: unknown): string {
  const text = JSON.stringify(payload);
  let hash = 5381;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) + hash + text.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(36);
}

function readGuard(): { fp: string; reportId: string } | null {
  try {
    const raw = sessionStorage.getItem(GUARD_KEY);
    return raw ? (JSON.parse(raw) as { fp: string; reportId: string }) : null;
  } catch {
    // Private mode, or storage disabled. The idempotent server is the backstop.
    return null;
  }
}

function writeGuard(fp: string, reportId: string) {
  try {
    sessionStorage.setItem(GUARD_KEY, JSON.stringify({ fp, reportId }));
  } catch {
    // Not worth failing the analysis over.
  }
}

/**
 * What to tell the reader when the analysis doesn't finish.
 *
 * A rate limit is the one failure where tapping the button again immediately
 * gets the same answer — the window has to pass first — so it says how long to
 * wait rather than repeating that something is broken. Everything else is worth
 * retrying now, and the wording says so.
 */
interface Failure {
  heading: string;
  detail: string;
}

const GENERIC_FAILURE: Failure = {
  heading: "Something went wrong",
  detail: "Your answers are saved — tap to try again.",
};

const RATE_LIMITED: Failure = {
  heading: "Too many requests",
  detail: "Please wait a few minutes and try again.",
};

function StepRow({
  label,
  state,
}: {
  label: string;
  state: "pending" | "active" | "done";
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-colors ${
        state === "active" ? "bg-white" : "bg-transparent"
      }`}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center text-sm">
        {state === "done" ? (
          <span className="text-green-600">✓</span>
        ) : state === "active" ? (
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-accent-500" />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
        )}
      </span>
      <span
        className={`text-sm ${
          state === "pending"
            ? "text-slate-400"
            : state === "active"
              ? "font-semibold text-slate-900"
              : "text-slate-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

export default function AnalyzingPage() {
  const router = useRouter();
  const hydrated = useStoreHydrated();
  const {
    partner1,
    partner2,
    relationshipStart,
    submissionId,
    answers,
    setReport,
    clearSaved,
  } = useTestStore();

  const [elapsed, setElapsed] = useState(0);
  const [reportId, setReportId] = useState<string | null>(null);
  const [failure, setFailure] = useState<Failure | null>(null);
  const started = useRef(false);

  const p1Name = partner1.name || "Partner 1";
  const p2Name = partner2.name || "Partner 2";

  const reportReady = reportId !== null;
  const timelineDone = elapsed >= TOTAL_MS;

  // Linear, so the ring and the step list tell the same story: an ease-out
  // curve put the ring at 77% while step 5 of 8 was still running, which reads
  // as the progress bar and the narration disagreeing about how far along it is.
  const fraction = Math.min(1, elapsed / TOTAL_MS);
  const progress = reportReady
    ? fraction * 100
    : Math.min(fraction * 100, HOLD_AT);
  /** The animation has run out but the report hasn't arrived: say so. */
  const holding = !reportReady && fraction * 100 >= HOLD_AT;

  const activeStep = Math.min(
    STEPS.length - 1,
    Math.floor(elapsed / STEP_MS),
  );

  const runAnalysis = useCallback(async () => {
    const payload = { partner1, partner2, relationshipStart, submissionId, answers };
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Out of quota, not broken: a different thing to say, and the only
      // failure here where trying again immediately is the wrong advice.
      if (response.status === 429) {
        setFailure(RATE_LIMITED);
        return;
      }

      const data = await readJson(response);

      if (!response.ok || typeof data?.reportId !== "string") {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : `analyze responded ${response.status}`,
        );
      }

      // Remembered before the redirect, so a refresh during the animation
      // doesn't spend a second request on a report that already exists.
      writeGuard(fingerprint(payload), data.reportId);
      setReport(data.reportId, data.teaser as FreeSections);
      setReportId(data.reportId);
    } catch (err) {
      // The specific reason is for the console; the reader gets the one line
      // that tells them what to do about it.
      console.error("[analyzing] generation failed:", err);
      setFailure(GENERIC_FAILURE);
    }
  }, [answers, partner1, partner2, relationshipStart, setReport, submissionId]);

  const retry = () => {
    setFailure(null);
    setElapsed(0);
    setReportId(null);
    void runAnalysis();
  };

  // Kick off exactly once, and only after rehydration — otherwise a refresh
  // here reads an empty store and bounces the user back to /test.
  useEffect(() => {
    if (!hydrated || started.current) return;
    started.current = true;

    if (!partner1.name || Object.keys(answers).length === 0) {
      router.replace("/test");
      return;
    }

    // Already analyzed in this tab: go straight to it rather than asking for
    // the same report again.
    const guard = readGuard();
    if (
      guard &&
      guard.fp === fingerprint({ partner1, partner2, relationshipStart, submissionId, answers })
    ) {
      router.replace(`/result?id=${guard.reportId}`);
      return;
    }
    // Every state write inside runAnalysis happens after the fetch resolves,
    // so there's no synchronous cascade — the rule can't see past the async fn.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void runAnalysis();
    // The `started` ref keeps this to one run per mount, so the extra
    // dependencies below can't re-trigger it — they are listed because the
    // fingerprint reads them.
  }, [
    answers,
    hydrated,
    partner1,
    partner2,
    relationshipStart,
    submissionId,
    router,
    runAnalysis,
  ]);

  // One clock for the whole page. A background tab throttles the interval, so
  // every derived value reads from `elapsed` rather than from a step counter
  // that could miss a tick.
  useEffect(() => {
    if (failure) return;
    const start = performance.now();
    const ticker = setInterval(() => setElapsed(performance.now() - start), 50);
    return () => clearInterval(ticker);
  }, [failure]);

  // Slow is one thing; never is another.
  useEffect(() => {
    if (failure || reportReady) return;
    const bail = setTimeout(() => setFailure(GENERIC_FAILURE), TIMEOUT_MS);
    return () => clearTimeout(bail);
  }, [failure, reportReady]);

  // Leave once the animation has run its course and the report exists. The id
  // rides in the URL, so this is also the moment the saved answers stop being
  // worth keeping: the report is on the server and the reader is on their way
  // to it. Clearing any earlier would strand a refresh made while the animation
  // was still playing, which would find no answers and bounce back to /test.
  //
  // Not while an error is on screen: a response that lands a second after the
  // timeout gave up would otherwise navigate out from under someone who is
  // reading "something went wrong" — or reaching for the retry button. Their
  // retry gets the finished report straight back from the store anyway.
  useEffect(() => {
    if (failure || !timelineDone || !reportId) return;
    clearSaved();
    router.replace(`/result?id=${reportId}`);
  }, [clearSaved, failure, reportId, router, timelineDone]);

  if (failure) {
    return (
      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="card w-full max-w-md space-y-5 p-8 text-center">
          <div className="text-4xl">😕</div>
          <h1 className="text-2xl font-bold text-slate-900">
            {failure.heading}
          </h1>
          <p className="text-sm text-slate-600">{failure.detail}</p>
          <button onClick={retry} className="btn-primary">
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-5 py-12">
      <div className="w-full max-w-md space-y-7 text-center">
        <div className="relative mx-auto h-40 w-40">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#e9ecf2" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="var(--color-accent-500)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress / 100)}
              style={{ transition: "stroke-dashoffset 0.2s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold tabular-nums text-slate-900">
              {Math.floor(progress)}%
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">
            Analyzing {p1Name} &amp; {p2Name}
          </h1>
          <p className="text-sm text-slate-500">
            {holding
              ? "Almost there — putting your report together. Don’t close the page."
              : "Reading all 15 answers from both of you. Don’t close the page."}
          </p>
        </div>

        <div className="card space-y-0.5 p-4 text-left">
          {STEPS.map((step, index) => (
            <StepRow
              key={step}
              label={step}
              state={
                index < activeStep
                  ? "done"
                  : index === activeStep
                    ? "active"
                    : "pending"
              }
            />
          ))}
        </div>
      </div>
    </main>
  );
}
