"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { GoogleAnalytics } from "@next/third-parties/google";

/**
 * The cookie banner, and the gate in front of Google Analytics.
 *
 * The tag is not merely hidden until someone accepts — it is not rendered, so
 * the script is never fetched and no `_ga` cookie is ever written. That is the
 * part that matters: a banner shown over an analytics tag that has already set
 * its cookies is decoration, and it is the arrangement that gets sites fined.
 *
 * The choice lives in localStorage rather than in a cookie of its own. Nothing
 * server-side needs to read it, and asking somebody to accept a cookie by
 * setting a cookie is a poor trade when a key in their own browser does the
 * same job. It has to outlive the tab, which is why it isn't sessionStorage
 * like the rest of the app's state.
 */

const STORAGE_KEY = "couplescan:cookie-consent";

type Choice = "accepted" | "declined";

function readChoice(): Choice | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "accepted" || stored === "declined" ? stored : null;
  } catch {
    // Private mode, or storage disabled. Treated as "not asked yet": the banner
    // shows again next time, which is the cautious way round.
    return null;
  }
}

/**
 * The stored answer, read as an external store rather than into state.
 *
 * localStorage cannot be read while rendering on the server, so the server
 * snapshot is `undefined` — "not known yet" — and neither the banner nor the
 * tag is rendered into the HTML. `useSyncExternalStore` then re-reads on the
 * client without the hydration mismatch that a plain effect-and-state would
 * produce, and without flashing the banner at someone who already answered.
 */
let cached: Choice | null | undefined;
const listeners = new Set<() => void>();

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
};

function getSnapshot(): Choice | null {
  if (cached === undefined) cached = readChoice();
  return cached;
}

function decide(next: Choice) {
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // The decision still holds for this page; it just won't be remembered.
  }
  cached = next;
  listeners.forEach((notify) => notify());
}

export function CookieConsent({ gaId }: { gaId?: string }) {
  const choice = useSyncExternalStore(subscribe, getSnapshot, () => undefined);

  return (
    <>
      {gaId && choice === "accepted" && <GoogleAnalytics gaId={gaId} />}

      {choice === null && (
        <div
          role="dialog"
          aria-label="Cookies"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-4 shadow-[0_-8px_24px_-12px_rgba(16,24,40,0.15)] backdrop-blur supports-[backdrop-filter]:bg-white/85"
        >
          <div className="mx-auto flex w-full max-w-[680px] flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <p className="flex-1 text-sm leading-relaxed text-slate-600">
              We use analytics cookies to see how many people visit and which
              pages they use. They never see your answers or your report. Read
              the{" "}
              <Link
                href="/privacy"
                className="font-semibold text-slate-700 underline hover:text-slate-900"
              >
                privacy policy
              </Link>
              .
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => decide("declined")}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 sm:flex-none"
              >
                Decline
              </button>
              <button
                onClick={() => decide("accepted")}
                className="btn-unlock flex-1 sm:flex-none"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
