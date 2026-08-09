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
        if (event.name === CheckoutEventNames.CHECKOUT_COMPLETED) {
          onCompleted?.();
        }
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
