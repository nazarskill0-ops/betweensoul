import {
  CheckoutEventNames,
  initializePaddle,
  type Paddle,
} from "@paddle/paddle-js";

/**
 * Browser-side checkout. Paddle is the Merchant of Record, so the whole
 * payment happens inside their overlay — this app never sees card details and
 * needs no checkout endpoint of its own.
 *
 * The report id rides along as `customData` so the `transaction.completed`
 * webhook can match the payment back to the report it unlocks. That is the
 * only link between the two; nothing the browser sends afterwards is trusted.
 */

const TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
const PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID;

/** Anything other than an explicit `production` stays on the sandbox. */
const ENVIRONMENT =
  process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production"
    ? "production"
    : "sandbox";

/**
 * Names a misconfiguration Paddle will reject, before it does.
 *
 * Paddle answers a bad token or a bad id with one modal reading "Something went
 * wrong", which is indistinguishable from a network problem or an outage. The
 * two mistakes below are easy to make — every id in their dashboard looks like
 * every other one — so they get named here instead.
 *
 * This warns rather than blocks: these prefixes are Paddle's documented format,
 * not a contract, and a checkout that might work should never be stopped by our
 * guess about an identifier we don't own.
 */
function warnAboutConfig(token: string, priceId: string) {
  if (ENVIRONMENT === "sandbox" && token.startsWith("live_")) {
    console.error(
      "[paddle] NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is a live token (live_…) but " +
        "NEXT_PUBLIC_PADDLE_ENVIRONMENT is sandbox. Paddle will reject this as " +
        "invalid_client_token. Sandbox tokens start with test_.",
    );
  }
  if (ENVIRONMENT === "production" && token.startsWith("test_")) {
    console.error(
      "[paddle] NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is a sandbox token (test_…) but " +
        "NEXT_PUBLIC_PADDLE_ENVIRONMENT is production.",
    );
  }
  if (!priceId.startsWith("pri_")) {
    console.error(
      "[paddle] NEXT_PUBLIC_PADDLE_PRICE_ID is %s. Checkout needs the PRICE id " +
        "(pri_…), not the product id (pro_…) — open the product in the catalog " +
        "and copy the id from the price underneath it.",
      priceId,
    );
  }
}

/** Paddle.js is loaded once per page and reused for every checkout. */
let paddlePromise: Promise<Paddle | undefined> | null = null;

/**
 * `eventCallback` is fixed at initialize time, so the current checkout's
 * completion handler is kept here and swapped on each open.
 */
let onCompleted: (() => void) | null = null;

function loadPaddle(token: string) {
  if (!paddlePromise) {
    paddlePromise = initializePaddle({
      token,
      environment: ENVIRONMENT,
      eventCallback: (event) => {
        if (event.name !== CheckoutEventNames.CHECKOUT_COMPLETED) return;

        // The page first, the overlay second. Whatever the handler starts —
        // the unlock request, the loading state — is under way before the
        // overlay goes, so closing it can't be what delays the report.
        onCompleted?.();

        // Paddle's own "payment successful" screen is a dead end: it ends with
        // a close button and no hint that the thing they bought is being
        // written behind it. Closing it puts them back on their report, where
        // the sections they just paid for are visibly filling in.
        void paddlePromise?.then((paddle) => paddle?.Checkout.close());
      },
    });
  }
  return paddlePromise;
}

export interface CheckoutParams {
  reportId: string;
  /** Pre-fills the overlay when the buyer gave us an email during the test. */
  email?: string;
  /**
   * Fires the moment Paddle confirms payment in the browser. The webhook is
   * what actually unlocks the report, so this only tells the page to start
   * polling — it is never proof of payment on its own.
   */
  onCompleted: () => void;
}

export async function openCheckout({
  reportId,
  email,
  onCompleted: handler,
}: CheckoutParams): Promise<void> {
  if (!TOKEN || !PRICE_ID) {
    throw new Error("Checkout isn't set up yet. Please try again later.");
  }

  warnAboutConfig(TOKEN, PRICE_ID);

  const paddle = await loadPaddle(TOKEN);
  if (!paddle) {
    throw new Error("Could not load checkout. Please try again.");
  }

  onCompleted = handler;
  paddle.Checkout.open({
    items: [{ priceId: PRICE_ID, quantity: 1 }],
    customData: { reportId },
    ...(email ? { customer: { email } } : {}),
    settings: {
      displayMode: "overlay",
      theme: "light",
      // With the email pre-filled there is no account to log out of, and the
      // link only confuses the one-off buyer this checkout is built for.
      allowLogout: !email,
    },
  });
}
