"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTestStore } from "@/store/useTestStore";
import { useStoreHydrated } from "@/store/useHydrated";

/** How long the theatrical part runs before we hand over to /result. */
const TOTAL_MS = 9000;

interface Model {
  name: string;
  mark: string;
  color: string;
  background: string;
  /** `{p1}` / `{p2}` are swapped for the partners' names. */
  comment: string;
}

const MODELS: Model[] = [
  {
    name: "ChatGPT",
    mark: "✳",
    color: "#0f9d76",
    background: "#e6f6f1",
    comment:
      "Cross-referencing all 28 answers. One of you is being suspiciously diplomatic.",
  },
  {
    name: "Claude",
    mark: "✻",
    color: "#d97757",
    background: "#fdeee8",
    comment:
      "Found the question where {p1} and {p2} quietly disagreed. Bookmarking that one.",
  },
  {
    name: "Gemini",
    mark: "✦",
    color: "#4285f4",
    background: "#e8f0fe",
    comment:
      "Ran the numbers twice. The second time was mostly for emotional support.",
  },
  {
    name: "DeepSeek",
    mark: "🐋",
    color: "#4d6bfe",
    background: "#eaeeff",
    comment:
      "Detected one “we're fine” doing an enormous amount of heavy lifting.",
  },
  {
    name: "Grok",
    mark: "⚡",
    color: "#2c1f38",
    background: "#efecf2",
    comment:
      "The gut-check round got spicy. Noted, filed, and gently judged.",
  },
];

const RING_CIRCUMFERENCE = 2 * Math.PI * 54;

function ModelRow({
  model,
  state,
  comment,
}: {
  model: Model;
  state: "pending" | "active" | "done";
  comment: string;
}) {
  return (
    <div
      className={`rounded-2xl px-3 py-2.5 transition-all ${
        state === "active" ? "bg-blush-50" : "bg-transparent"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-base"
          style={{
            color: model.color,
            backgroundColor: model.background,
            opacity: state === "pending" ? 0.4 : 1,
          }}
        >
          {model.mark}
        </span>
        <span
          className={`flex-1 text-sm font-bold ${
            state === "pending" ? "text-ink-300" : "text-ink-900"
          }`}
        >
          {model.name}
        </span>
        <span className="text-sm">
          {state === "done" ? (
            "✅"
          ) : state === "active" ? (
            <span className="inline-block h-2 w-2 animate-heartbeat rounded-full bg-blush-400" />
          ) : (
            <span className="text-ink-300">○</span>
          )}
        </span>
      </div>
      {state !== "pending" && (
        <p className="animate-in-up mt-1.5 pl-11 text-sm leading-snug text-ink-700">
          {comment}
        </p>
      )}
    </div>
  );
}

export default function AnalyzingPage() {
  const router = useRouter();
  const hydrated = useStoreHydrated();
  const { partner1, partner2, relationshipStart, email, answers, setReport } =
    useTestStore();

  const [elapsed, setElapsed] = useState(0);
  const [timelineDone, setTimelineDone] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const reportReady = reportId !== null;
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  const p1Name = partner1.name || "Partner 1";
  const p2Name = partner2.name || "Partner 2";

  const timeline = timelineDone ? 1 : Math.min(1, elapsed / TOTAL_MS);
  // Park just short of 100 if the report somehow isn't back yet, so the ring
  // never claims to be finished while we're still waiting.
  const progress = reportReady
    ? timeline * 100
    : Math.min(timeline * 100, 99);
  const activeIndex = Math.min(
    MODELS.length - 1,
    Math.floor(timeline * MODELS.length),
  );

  const runAnalysis = useCallback(async () => {
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partner1,
          partner2,
          relationshipStart,
          email,
          answers,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Analysis failed.");

      setReport(data.reportId, data.teaser);
      setReportId(data.reportId);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Something went wrong on our side.",
      );
    }
  }, [answers, email, partner1, partner2, relationshipStart, setReport]);

  const retry = () => {
    setError(null);
    setElapsed(0);
    setTimelineDone(false);
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
    // Every state write inside runAnalysis happens after the fetch resolves,
    // so there's no synchronous cascade — the rule can't see past the async fn.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void runAnalysis();
  }, [answers, hydrated, partner1.name, router, runAnalysis]);

  // The interval only samples the clock for the ring and the model hand-off.
  // A background tab throttles it to ~1s, so the redirect hangs off its own
  // one-shot timer rather than waiting for a sample to cross the finish line.
  useEffect(() => {
    if (error) return;
    const start = performance.now();
    const ticker = setInterval(() => setElapsed(performance.now() - start), 50);
    const finish = setTimeout(() => setTimelineDone(true), TOTAL_MS);
    return () => {
      clearInterval(ticker);
      clearTimeout(finish);
    };
  }, [error]);

  // Leave once the show has run its course and the report actually exists.
  useEffect(() => {
    // The id also rides in the URL so the report survives a refresh or a
    // cleared store, not just this tab's session.
    if (timelineDone && reportId) router.replace(`/result?id=${reportId}`);
  }, [reportId, router, timelineDone]);

  if (error) {
    return (
      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="card w-full max-w-md space-y-5 p-8 text-center">
          <div className="text-4xl">😕</div>
          <h1 className="text-2xl font-extrabold text-ink-900">
            We couldn&rsquo;t finish your analysis
          </h1>
          <p className="text-sm text-ink-700">{error}</p>
          <p className="text-sm text-ink-500">
            Your answers are still saved — nothing was lost.
          </p>
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
            <circle cx="60" cy="60" r="54" fill="none" stroke="white" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="url(#ring)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress / 100)}
              style={{ transition: "stroke-dashoffset 0.2s linear" }}
            />
            <defs>
              <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--color-blush-400)" />
                <stop offset="100%" stopColor="var(--color-lilac-400)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="animate-heartbeat text-3xl">💗</span>
            <span className="mt-1 text-2xl font-extrabold text-ink-900">
              {Math.floor(progress)}%
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-ink-900">
            Analyzing {p1Name} &amp; {p2Name}
          </h1>
          <p className="text-sm text-ink-500">
            {timelineDone && !reportReady
              ? "Almost there — putting the report together…"
              : "Five models are reading your answers. Don't close the page."}
          </p>
        </div>

        <div className="card space-y-1 p-4 text-left">
          {MODELS.map((model, index) => (
            <ModelRow
              key={model.name}
              model={model}
              state={
                index < activeIndex
                  ? "done"
                  : index === activeIndex
                    ? "active"
                    : "pending"
              }
              comment={model.comment
                .replace("{p1}", p1Name)
                .replace("{p2}", p2Name)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
