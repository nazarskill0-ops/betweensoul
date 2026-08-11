"use client";

import { ReactNode, useEffect, useState } from "react";
import { scoreBand } from "./scale";

/** A labelled score with its bar — the radar, the scenario lab, the verdicts. */
export function ScoreBar({
  name,
  emoji,
  score,
  children,
}: {
  name: string;
  emoji?: string;
  score: number;
  children?: ReactNode;
}) {
  const band = scoreBand(score);

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[15px] font-semibold text-slate-900">
          {emoji && <span className="mr-1.5">{emoji}</span>}
          {name}
        </span>
        <span className={`text-lg font-bold tabular-nums ${band.text}`}>{score}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`animate-bar h-full rounded-full ${band.bar}`}
          style={{ width: `${score}%` }}
        />
      </div>
      {children}
    </div>
  );
}

/** Eases 0 → target, honouring prefers-reduced-motion. */
function useCountUp(target: number, duration = 1200) {
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
    // rAF is suspended while the tab is backgrounded, which would leave the
    // score frozen at 0 for anyone who opens the report in an unfocused tab.
    const settle = setTimeout(() => setValue(target), ms + 250);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(settle);
    };
  }, [target, duration]);

  return value;
}

/** The headline number. Big enough to be the first thing read, and screenshot. */
export function ScoreRing({ score }: { score: number }) {
  const animated = useCountUp(score);
  const band = scoreBand(score);
  const circumference = 2 * Math.PI * 52;

  return (
    <div className="relative mx-auto h-44 w-44 sm:h-48 sm:w-48">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r="52" fill="none" stroke="#eef0f4" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke={band.hex}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - animated / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[44px] font-bold leading-none tabular-nums text-slate-900 sm:text-[56px]">
          {Math.round(animated)}
        </span>
        <span className="mt-1 text-xs font-medium text-slate-400">out of 100</span>
      </div>
    </div>
  );
}

/** The three secondary metrics under the headline score. */
export function MetricDial({ label, score }: { label: string; score: number }) {
  const animated = useCountUp(score);
  const band = scoreBand(score);
  const circumference = 2 * Math.PI * 26;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-16 w-16">
        <svg viewBox="0 0 60 60" className="h-full w-full -rotate-90">
          <circle cx="30" cy="30" r="26" fill="none" stroke="#eef0f4" strokeWidth="6" />
          <circle
            cx="30"
            cy="30"
            r="26"
            fill="none"
            stroke={band.hex}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - animated / 100)}
          />
        </svg>
        <span
          className={`absolute inset-0 flex items-center justify-center text-base font-bold tabular-nums ${band.text}`}
        >
          {Math.round(animated)}
        </span>
      </div>
      <span className="text-xs font-medium text-slate-500">{label}</span>
    </div>
  );
}
