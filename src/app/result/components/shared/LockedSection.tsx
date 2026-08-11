"use client";

import { ReactNode } from "react";
import { UnlockButton } from "./UnlockButton";

/**
 * A paid section the reader hasn't bought yet.
 *
 * The heading and the teaser stay sharp — they are the offer. What blurs is a
 * structural stand-in: cards, rows and lines in the shape the real section
 * takes, so the reader can see how much is behind the lock without any of it
 * being the actual analysis. The real text does not exist in the browser, or on
 * the server, until the report is unlocked.
 */
export function LockedSection({
  id,
  title,
  emoji,
  teaser,
  blur = true,
  children,
}: {
  id?: string;
  title: string;
  emoji?: string;
  teaser: string;
  /**
   * Some sections keep their labels sharp and blur only the prose — the
   * conflict cycle's five stages, the day headings in the reset — because the
   * structure is part of the offer. Those pass `false` and blur their own
   * content.
   */
  blur?: boolean;
  /** The blurred stand-in. */
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="report-card scroll-mt-6 bg-slate-50/80 ring-slate-900/[0.04]"
    >
      <div className="mb-2 flex items-start gap-2">
        <h2 className="flex-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {emoji && <span className="mr-2">{emoji}</span>}
          {title}
        </h2>
        <span
          className="mt-1 text-base text-slate-400"
          role="img"
          aria-label="Locked"
        >
          🔒
        </span>
      </div>

      <p className="text-[15px] leading-relaxed text-slate-500">{teaser}</p>

      <div className={`mt-4 ${blur ? "locked-preview" : ""}`} aria-hidden>
        {children}
      </div>

      <div className="mt-4">
        <UnlockButton />
      </div>
    </section>
  );
}

/** Filler for the blurred stand-in. Length varies so it doesn't read as a grid. */
export function PreviewLines({ count = 3 }: { count?: number }) {
  const widths = ["100%", "94%", "88%", "97%", "82%"];
  return (
    <div className="space-y-2">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="h-3 rounded-full bg-slate-200"
          style={{ width: widths[i % widths.length] }}
        />
      ))}
    </div>
  );
}

/**
 * Shown between payment and the analysis landing.
 *
 * Deliberately the same shape as the locked version — same heading, same
 * spacing — so the page doesn't reflow underneath someone who has just paid.
 */
export function GeneratingSection({
  id,
  title,
  emoji,
}: {
  id?: string;
  title: string;
  emoji?: string;
}) {
  return (
    <section id={id} className="report-card scroll-mt-6 bg-slate-50/80 ring-slate-900/[0.04]">
      <div className="mb-2 flex items-start gap-2">
        <h2 className="flex-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {emoji && <span className="mr-2">{emoji}</span>}
          {title}
        </h2>
        <Spinner />
      </div>
      <p className="text-[15px] text-slate-500">Writing this section…</p>
      <div className="mt-4 animate-pulse space-y-2" aria-hidden>
        <div className="h-3 w-full rounded-full bg-slate-200" />
        <div className="h-3 w-11/12 rounded-full bg-slate-200" />
        <div className="h-3 w-9/12 rounded-full bg-slate-200" />
      </div>
    </section>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-slate-300 border-t-accent-500 ${className}`}
      role="status"
      aria-label="Working"
    />
  );
}

/**
 * The one branch every paid section shares: real content, the spinner while it
 * is being written, or the locked teaser.
 */
export function PaidSection<T>({
  id,
  title,
  emoji,
  teaser,
  data,
  generating,
  preview,
  blurPreview = true,
  children,
}: {
  id?: string;
  title: string;
  emoji?: string;
  teaser: string;
  data: T | null | undefined;
  generating: boolean;
  preview: ReactNode;
  blurPreview?: boolean;
  children: (data: T) => ReactNode;
}) {
  if (data) {
    return (
      <section id={id} className="report-card scroll-mt-6">
        <h2 className="mb-4 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {emoji && <span className="mr-2">{emoji}</span>}
          {title}
        </h2>
        {children(data)}
      </section>
    );
  }

  if (generating) {
    return <GeneratingSection id={id} title={title} emoji={emoji} />;
  }

  return (
    <LockedSection
      id={id}
      title={title}
      emoji={emoji}
      teaser={teaser}
      blur={blurPreview}
    >
      {preview}
    </LockedSection>
  );
}
