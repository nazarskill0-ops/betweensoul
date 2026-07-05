/*
  The payment abstraction.

  The rest of the app NEVER imports LiqPay or WayForPay directly. It only ever
  talks to this `PaymentProvider` interface. To add a third gateway you write
  ONE new file that implements this interface and register it in ./registry.ts.
  Nothing else in the codebase changes. This is the Strategy pattern.

  Money is always in MINOR units (kopiykas): 250 UAH => 25000. Never use floats
  for money.
*/

export type PaymentProviderId = "liqpay" | "wayforpay";

export interface CreatePaymentInput {
  /** Our internal booking id this payment is for. */
  bookingId: string;
  /** Amount in minor units (kopiykas). */
  amountMinor: number;
  currency: "UAH";
  /** Human description shown on the payment page. */
  description: string;
  /** Where the gateway redirects the user back to after paying. */
  returnUrl: string;
}

export interface CreatePaymentResult {
  /** URL to send the user to, or form data to POST — provider decides. */
  redirectUrl: string;
  /** The gateway's own transaction id, stored on our payment row. */
  providerRef: string;
}

/** Normalised result of verifying a gateway callback/webhook. */
export interface PaymentCallbackResult {
  bookingId: string;
  providerRef: string;
  status: "paid" | "failed" | "pending";
  amountMinor: number;
}

export interface PaymentProvider {
  readonly id: PaymentProviderId;

  /** Start a payment: returns where to send the user. */
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;

  /**
   * Verify and parse an incoming webhook/callback from the gateway.
   * MUST validate the signature — never trust the raw payload.
   */
  verifyCallback(request: Request): Promise<PaymentCallbackResult>;
}
