"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { openCheckout } from "@/lib/paddle";
import { useTestStore } from "@/store/useTestStore";
import { useStoreHydrated } from "@/store/useHydrated";
import { FreeSections, Gender, PaidSections, PaidStatus } from "@/lib/types";
import { partnerPaletteStyle } from "@/lib/partnerColors";

import { CoupleScore } from "./components/free/CoupleScore";
import { CoupleDynamic } from "./components/free/CoupleDynamic";
import { RelationshipRadar } from "./components/free/RelationshipRadar";
import { BiggestStrength } from "./components/free/BiggestStrength";
import { BiggestTension } from "./components/free/BiggestTension";
import { YouVsPartner } from "./components/free/YouVsPartner";
import { PerceptionGapFree } from "./components/free/PerceptionGapFree";
import { UnsaidThings } from "./components/free/UnsaidThings";
import { GreenFlagsWatchouts } from "./components/free/GreenFlagsWatchouts";
import { ScenarioPreview } from "./components/free/ScenarioPreview";
import { TheQuestion } from "./components/free/TheQuestion";

import { FullXRay } from "./components/paid/FullXRay";
import { AllPerceptionGaps } from "./components/paid/AllPerceptionGaps";
import { ConflictFingerprint } from "./components/paid/ConflictFingerprint";
import { LoveStyles } from "./components/paid/LoveStyles";
import { HowYouSeeEachOther } from "./components/paid/HowYouSeeEachOther";
import { ScenarioLab } from "./components/paid/ScenarioLab";
import { IfNothingChanges } from "./components/paid/IfNothingChanges";
import { WhatKeepsYouTogether } from "./components/paid/WhatKeepsYouTogether";
import { SevenDayReset } from "./components/paid/SevenDayReset";
import { TheAnswer } from "./components/paid/TheAnswer";

import { PaywallCTA } from "./components/PaywallCTA";
import { Spinner } from "./components/shared/LockedSection";
import { UnlockProvider } from "./components/shared/UnlockButton";

const POLL_INTERVAL_MS = 2000;
/** ~4 minutes. Five parallel Sonnet requests; this leaves room for a retry. */
const MAX_POLLS = 120;
/**
 * How long a buyer waits before being offered a retry rather than a spinner.
 *
 * Generation lands in 15-25s; a minute means something is wrong — a lost
 * webhook, a failed run — not that it is taking its time. The page keeps
 * polling underneath, so a run that finishes late still unlocks itself.
 */
const UNLOCK_TIMEOUT_MS = 60000;

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
  /** Picks which pair of colours stands for the two partners. */
  partner1Gender: Gender | "";
  partner2Gender: Gender | "";
  free: FreeSections;
  paidSections: PaidSections | null;
  /** Paid for, but the deep analysis hasn't been generated yet. */
  needsUnlock: boolean;
}

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
  const [loadState, setLoadState] = useState<
    "loading" | "ready" | "notfound" | "error"
  >("loading");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  // True once Paddle confirms payment in the browser — or on arrival from a
  // receipt link. Either way it only means "the webhook is on its way", so the
  // page keeps polling instead of rendering anything as unlocked.
  const [justPaid, setJustPaid] = useState(
    () => searchParams.get("paid") === "1",
  );
  const pollsRef = useRef(0);
  /**
   * One accepted unlock request per page load — the webhook may also be
   * running one. Only set once the route has taken the job: a 403 means the
   * webhook hasn't marked the report paid yet, and the poll below has to be
   * free to ask again when it has.
   */
  const unlockRequested = useRef(false);
  /**
   * Generation didn't finish in time. The payment is fine — this is only about
   * the ten sections behind it — so the wording never questions the purchase.
   */
  const [unlockFailed, setUnlockFailed] = useState(false);
  /** Bumped by the retry button, to restart a poll chain that has stopped. */
  const [retryNonce, setRetryNonce] = useState(0);

  /**
   * A missing report and an unreachable one need different words: "this link
   * has expired" is wrong — and unfixable by the reader — when the truth is
   * that the store is down and their report is fine.
   */
  const fetchReport = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/report/${id}`);
      if (response.status === 404) return { status: "notfound" as const };
      if (!response.ok) return { status: "error" as const };
      return {
        status: "ready" as const,
        report: (await response.json()) as ReportResponse,
      };
    } catch {
      // Offline, or the request never landed.
      return { status: "error" as const };
    }
  }, []);

  /**
   * Asks the server to write the paid sections.
   *
   * Fired the instant Paddle confirms payment, which is usually before the
   * `transaction.completed` webhook has marked the report paid — so a 403 here
   * is the normal race, not a failure. It leaves `unlockRequested` clear so the
   * poll below asks again once the webhook lands; anything the route accepts
   * (200 with the sections, 202 while the webhook's own run holds the claim)
   * claims the job so a second request can't bill a second set of Sonnet calls.
   */
  const requestUnlock = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/report/${id}/unlock`, {
        method: "POST",
      });
      if (response.status === 403) return;

      unlockRequested.current = true;
      if (!response.ok) return;

      const data = (await response.json()) as {
        paidSections?: PaidSections | null;
      };
      if (data.paidSections) {
        setReport((current) =>
          current
            ? {
                ...current,
                paid: true,
                paidStatus: "ready",
                needsUnlock: false,
                paidSections: data.paidSections ?? null,
              }
            : current,
        );
      }
    } catch (error) {
      // Offline or the request never landed. The poll keeps trying, and the
      // deadline below is what eventually gives up.
      console.error("[result] unlock request failed:", error);
    }
  }, []);

  useEffect(() => {
    // Nothing to fetch until the store has rehydrated and given us an id.
    if (!hydrated || !reportId) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const load = async () => {
      const result = await fetchReport(reportId);
      if (cancelled) return;

      if (result.status !== "ready") {
        setLoadState(result.status);
        return;
      }

      const data = result.report;
      setReport(data);
      setLoadState("ready");

      // Paid for but not generated: ask for it. The webhook usually gets there
      // first, in which case this returns 202 and the poll below picks up the
      // result — but it means a report is never left ungenerated just because
      // the webhook was slow or lost.
      if (data.needsUnlock && !unlockRequested.current) {
        void requestUnlock(reportId);
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
  }, [fetchReport, hydrated, justPaid, reportId, requestUnlock, retryNonce]);

  /**
   * Slow is one thing; never is another.
   *
   * Runs from the moment payment is confirmed and is cleared the moment the
   * sections arrive, so a reader is never left watching a skeleton pulse
   * forever because the webhook was lost or generation died.
   */
  useEffect(() => {
    if (!justPaid || unlockFailed || report?.paidSections) return;

    const bail = setTimeout(() => setUnlockFailed(true), UNLOCK_TIMEOUT_MS);
    return () => clearTimeout(bail);
  }, [justPaid, report?.paidSections, unlockFailed]);

  /** Ask again, from a clean slate. */
  const retryUnlock = useCallback(() => {
    if (!reportId) return;
    setUnlockFailed(false);
    pollsRef.current = 0;
    unlockRequested.current = false;
    setRetryNonce((n) => n + 1);
    void requestUnlock(reportId);
  }, [reportId, requestUnlock]);

  const unlock = useCallback(async () => {
    if (!reportId) return;
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      await openCheckout({
        reportId,
        email: email || undefined,
        // Payment confirmed in the overlay, which is still on screen — the
        // work starts here rather than after it closes, so the sections are
        // already being written by the time the reader sees the page again.
        //
        // This is not proof of payment: the webhook is what marks the report
        // paid, and the request below is refused until it has. It only saves
        // the poll's first round trip in the common case where it already has.
        onCompleted: () => {
          pollsRef.current = 0;
          unlockRequested.current = false;
          setUnlockFailed(false);
          setJustPaid(true);
          void requestUnlock(reportId);
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
  }, [email, reportId, requestUnlock]);

  if (!hydrated || (reportId && loadState === "loading")) {
    return <CenteredNote>Loading your results…</CenteredNote>;
  }

  const free = report?.free ?? storedTeaser;

  // Reachable-but-broken, as opposed to gone: the report is probably fine and
  // reloading in a minute is the right advice.
  if (loadState === "error" && !free) {
    return (
      <>
        <main className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="report-card w-full max-w-sm text-center">
            <div className="text-4xl">😕</div>
            <h1 className="mt-4 text-xl font-bold text-slate-900">
              We couldn&rsquo;t load your report
            </h1>
            <p className="mt-2 text-[15px] text-slate-500">
              Something on our side is having a moment. Your report is still
              there — try again in a minute.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-unlock mt-6 w-full py-3"
            >
              Try again
            </button>
          </div>
        </main>
      </>
    );
  }

  if (!reportId || loadState === "notfound" || !free) {
    return (
      <>
        <main className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="report-card w-full max-w-sm text-center">
            <div className="text-4xl">🔍</div>
            <h1 className="mt-4 text-xl font-bold text-slate-900">
              We can&rsquo;t find that report
            </h1>
            <p className="mt-2 text-[15px] text-slate-500">
              Reports are kept for 24 hours. This one may have expired, or the
              test wasn&rsquo;t finished on this device.
            </p>
            <button
              onClick={() => router.push("/test")}
              className="btn-unlock mt-6 w-full py-3"
            >
              Take the test
            </button>
          </div>
        </main>
      </>
    );
  }

  const p1Name = report?.partner1Name || partner1.name || "Partner 1";
  const p2Name = report?.partner2Name || partner2.name || "Partner 2";
  // Server first: a report opened from a receipt link on another device has no
  // store to read the genders from.
  const palette = partnerPaletteStyle(
    report?.partner1Gender ?? partner1.gender,
    report?.partner2Gender ?? partner2.gender,
  );
  const paidSections = report?.paidSections ?? null;
  const unlocked = paidSections !== null;
  // Paid for, deep dive not stored yet — or paid in this session and the
  // webhook hasn't landed. Both mean "sections are on their way".
  const generating =
    !unlocked && (Boolean(report?.needsUnlock) || (justPaid && !report?.paid));

  return (
    <>
      <UnlockProvider
        value={{ onUnlock: unlock, loading: checkoutLoading, error: checkoutError }}
      >
        <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10" style={palette}>
          <div className="mx-auto w-full max-w-[680px] space-y-8 sm:space-y-10">
            {unlocked && (
              <p className="text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3.5 py-1.5 text-sm font-semibold text-green-700">
                  ✓ Full report unlocked
                </span>
              </p>
            )}

            {generating && !unlockFailed && (
              <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
                <Spinner />
                <div>
                  <p className="text-[15px] font-semibold text-slate-900">
                    ✨ Unlocking your full report…
                  </p>
                  <p className="text-sm text-slate-500">
                    About a minute. You can leave this page — the link stays good
                    for 24 hours.
                  </p>
                </div>
              </div>
            )}

            {/*
              The payment went through; only the writing of the ten sections
              didn't. Saying so plainly matters — a buyer who reads this as a
              failed charge goes looking for their money instead of tapping the
              one button that fixes it.
            */}
            {generating && unlockFailed && (
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/5">
                <p className="text-[15px] font-semibold text-slate-900">
                  Something went wrong
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Your payment was received — tap to retry.
                </p>
                <button
                  onClick={retryUnlock}
                  className="btn-unlock mt-3"
                  type="button"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Block 1 — first impression, no interruptions */}
            <CoupleScore data={free.coupleScore} p1Name={p1Name} p2Name={p2Name} />
            <CoupleDynamic data={free.coupleDynamic} />
            <RelationshipRadar data={free.radar} />

            {/* Block 2 — the good news, the problem, then the explanation */}
            <BiggestStrength data={free.biggestStrength} />
            <BiggestTension data={free.biggestTension} />
            <FullXRay
              id="full-xray"
              data={paidSections?.fullXRay}
              generating={generating}
            />

            {/* Block 3 — the shareable stuff */}
            <YouVsPartner
              sliders={free.sliders}
              p1Name={p1Name}
              p2Name={p2Name}
            />
            <PerceptionGapFree
              data={free.perceptionGap}
              p1Name={p1Name}
              p2Name={p2Name}
              locked={!unlocked}
            />
            <AllPerceptionGaps
              data={paidSections?.allPerceptionGaps}
              generating={generating}
              totalGapsFound={free.perceptionGap.totalGapsFound}
              p1Name={p1Name}
              p2Name={p2Name}
            />

            {/* Block 4 — getting personal */}
            <UnsaidThings
              data={free.unsaidThings}
              unlocked={paidSections?.unsaidThingsUnlocked}
              p1Name={p1Name}
              p2Name={p2Name}
            />
            <ConflictFingerprint
              data={paidSections?.conflictFingerprint}
              generating={generating}
            />
            <LoveStyles
              data={paidSections?.loveStyles}
              generating={generating}
              p1Name={p1Name}
              p2Name={p2Name}
            />

            {/* Block 5 — flags and perspectives */}
            <GreenFlagsWatchouts data={free.flags} />
            <HowYouSeeEachOther
              data={paidSections?.howYouSeeEachOther}
              generating={generating}
              p1Name={p1Name}
              p2Name={p2Name}
            />

            {/* Block 6 — the future */}
            <ScenarioPreview scenarios={free.scenarios} locked={!unlocked} />
            <ScenarioLab data={paidSections?.scenarioLab} generating={generating} />
            <IfNothingChanges
              data={paidSections?.ifNothingChanges}
              generating={generating}
            />
            <WhatKeepsYouTogether
              data={paidSections?.whatKeepsYouTogether}
              generating={generating}
            />

            {/* Block 7 — the finale */}
            <TheQuestion data={free.theQuestion} locked={!unlocked} />
            <SevenDayReset
              data={paidSections?.sevenDayReset}
              generating={generating}
            />
            <TheAnswer data={paidSections?.theAnswer} generating={generating} />

            {!unlocked && !generating && <PaywallCTA />}

            <p className="pt-2 text-center text-xs text-slate-400">
              An AI-generated read on your answers, not therapy or clinical
              advice.{" "}
              <Link href="/" className="underline hover:text-slate-600">
                Back to home
              </Link>
            </p>
          </div>
        </main>
      </UnlockProvider>
    </>
  );
}

function CenteredNote({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="flex items-center gap-3 text-slate-500">
          <Spinner />
          <p className="font-medium">{children}</p>
        </div>
      </main>
    </>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<CenteredNote>Loading your results…</CenteredNote>}>
      <ResultContent />
    </Suspense>
  );
}
