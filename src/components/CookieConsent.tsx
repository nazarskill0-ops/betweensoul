"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { GoogleAnalytics } from "@next/third-parties/google";

/**
 * The cookie dialog, and the gate in front of Google Analytics.
 *
 * The tag is not merely hidden until someone accepts — it is not rendered, so
 * the script is never fetched and no `_ga` cookie is ever written. That is the
 * part that matters: a banner shown over an analytics tag that has already set
 * its cookies is decoration, and it is the arrangement that gets sites fined.
 *
 * This started as a strip along the bottom of the page, which is the shape
 * people have learned to scroll past without reading. It is a dialog over a
 * dimmed page now, and it does not go away until it is answered: no close
 * button, no Escape, no dismissing it by clicking the backdrop. Both answers
 * are right here, the same size, on this first screen — that is the line
 * between a dialog that insists on an answer, which is allowed, and one that
 * only accepts a yes, which is not consent at all and is what regulators
 * actually fine. Decline costs one click, exactly like Accept.
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
    // Private mode, or storage disabled. Treated as "not asked yet": the dialog
    // shows again next time, which is the cautious way round.
    return null;
  }
}

/**
 * The stored answer, read as an external store rather than into state.
 *
 * localStorage cannot be read while rendering on the server, so the server
 * snapshot is `undefined` — "not known yet" — and neither the dialog nor the
 * tag is rendered into the HTML. `useSyncExternalStore` then re-reads on the
 * client without the hydration mismatch that a plain effect-and-state would
 * produce, and without flashing the dialog at someone who already answered.
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

/**
 * Google's cookies, removed when someone turns analytics back off.
 *
 * Written by the tag rather than by us, so they are cleared by name: `_ga`,
 * and the per-property `_ga_<id>` beside it. Each is expired against every
 * domain it could plausibly have been scoped to — the tag sets them on the
 * registrable domain, a host-only delete would miss that, and a delete aimed
 * at the wrong domain is simply ignored.
 */
function clearAnalyticsCookies() {
  const names = document.cookie
    .split(";")
    .map((pair) => pair.split("=")[0].trim())
    .filter((name) => name === "_ga" || name.startsWith("_ga_"));

  const host = location.hostname;
  const registrable = host.split(".").slice(-2).join(".");
  const domains = ["", host, `.${host}`, `.${registrable}`];

  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${
        domain ? `; domain=${domain}` : ""
      }`;
    }
  }
}

function decide(next: Choice) {
  const previous = readChoice();

  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // The decision still holds for this page; it just won't be remembered.
  }
  cached = next;

  /**
   * Turning analytics off again is the one answer a re-render cannot deliver.
   * `next/script` injects the tag into the document rather than into React's
   * tree, so unmounting the component leaves the script running and gtag in
   * memory — the privacy policy promises this stops immediately, and only a
   * reload actually makes that true. The cookies go first, or the reload would
   * just leave them sitting there.
   */
  if (next === "declined" && previous === "accepted") {
    clearAnalyticsCookies();
    location.reload();
    return;
  }

  listeners.forEach((notify) => notify());
}

/**
 * Reopens the dialog from the footer, so a choice can be changed.
 *
 * A dialog that has to be answered needs a way back in, or declining once is
 * permanent short of wiping the site's data — and the privacy policy would
 * have to say so. The stored answer is left alone until a new one is given:
 * closing the tab mid-thought keeps whatever was already chosen.
 */
export function openCookieSettings() {
  cached = null;
  listeners.forEach((notify) => notify());
}

export function CookieConsent({ gaId }: { gaId?: string }) {
  const choice = useSyncExternalStore(subscribe, getSnapshot, () => undefined);
  const asking = choice === null;

  // The page behind the dialog must not scroll while it is up. Everything
  // else — Escape, a click on the backdrop — is deliberately not wired: this
  // dialog closes by being answered.
  useEffect(() => {
    if (!asking) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [asking]);

  return (
    <>
      {gaId && choice === "accepted" && <GoogleAnalytics gaId={gaId} />}

      {asking && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/60 p-0 sm:items-center sm:p-4"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-dialog-title"
            className="animate-in-up flex max-h-[92vh] w-full max-w-md flex-col overflow-y-auto rounded-t-3xl bg-white p-6 sm:max-h-[88vh] sm:rounded-3xl sm:p-7"
          >
            <h2
              id="cookie-dialog-title"
              className="text-2xl font-bold tracking-tight text-slate-900"
            >
              Cookies, before you start
            </h2>
            <p className="mt-1.5 text-[15px] text-slate-500">
              One kind keeps the test working. The other is up to you.
            </p>

            <dl className="mt-5 space-y-4 text-[15px] leading-relaxed">
              <div>
                <dt className="font-semibold text-slate-900">
                  Essential · always on
                </dt>
                <dd className="mt-0.5 text-slate-600">
                  Your answers stay in this browser while you take the test, and
                  Paddle sets its own cookies if you open the checkout. Without
                  these there is no test and no way to pay.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900">
                  Analytics · your choice
                </dt>
                <dd className="mt-0.5 text-slate-600">
                  Google Analytics counts how many people arrive, which pages
                  they read and where they give up — that is how we know what to
                  fix. It never receives your answers, your report or your
                  names, and we run no ads.
                </dd>
              </div>
            </dl>

            <p className="mt-5 text-sm text-slate-500">
              Decline and nothing analytics-related loads at all. The test is
              identical either way. More detail in the{" "}
              <Link
                href="/privacy"
                className="font-semibold text-slate-600 underline hover:text-slate-800"
              >
                privacy policy
              </Link>
              .
            </p>

            {/* Both answers the same size, side by side. A Decline that is
                smaller, greyer or one screen further away than Accept is the
                thing that turns a consent dialog into a fine. */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => decide("declined")}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Decline
              </button>
              <button
                onClick={() => decide("accepted")}
                className="btn-unlock"
              >
                Accept
              </button>
            </div>

            <p className="mt-3 text-center text-xs text-slate-400">
              You can change this later — “Cookies” at the bottom of any page.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
