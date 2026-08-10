import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, after } from "next/server";
import { runPaidGeneration } from "@/lib/paidAnalysis";
import { getReport, markPaid } from "@/lib/reportStore";

/**
 * The only thing that unlocks a paid report.
 *
 * `transaction.completed` means Paddle has the money; the browser's
 * `checkout.completed` event does not, which is why the result page only polls
 * on it rather than being trusted to flip the status itself.
 */

const TRANSACTION_COMPLETED = "transaction.completed";

/**
 * How old a signed request may be.
 *
 * Paddle's Node SDK enforces 5 seconds, which is too tight to survive a cold
 * start on a serverless instance: a perfectly valid delivery that spends six
 * seconds waiting for a container was rejected as an invalid signature, and
 * Paddle retried into the same wall. Five minutes is the usual window for this
 * kind of check (Stripe's default) and still leaves a captured request useless
 * within minutes.
 */
const MAX_AGE_SECONDS = 300;

/**
 * The Sonnet pass runs inside `after()`, which is billed against this route's
 * budget — and it measures ~70s, so 60 would kill it just before it stored the
 * report. Assumes Fluid compute is on for the project.
 */
export const maxDuration = 300;

/** Only the two fields this route acts on — see the note in POST. */
interface PaddleNotification {
  event_type?: string;
  data?: { custom_data?: Record<string, unknown> | null };
}

function readReportId(payload: PaddleNotification): string | null {
  const value = payload.data?.custom_data?.reportId;
  return typeof value === "string" && value ? value : null;
}

/**
 * `Paddle-Signature: ts=1234567890;h1=<hex>`
 *
 * More than one `h1` can appear while a signing secret is being rotated — both
 * the old and the new digest ride along — so every one is collected and any
 * match counts.
 */
function parseSignature(header: string) {
  let ts: number | null = null;
  const digests: string[] = [];

  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator === -1) continue;
    const name = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();

    if (name === "ts" && /^\d+$/.test(value)) ts = Number(value);
    else if (name === "h1" && value) digests.push(value);
  }

  return { ts, digests };
}

/** Constant-time compare of two hex digests of the same length. */
function digestsMatch(expected: string, received: string) {
  if (received.length !== expected.length) return false;
  try {
    return timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(received, "hex"),
    );
  } catch {
    return false;
  }
}

type Verdict = "ok" | "malformed" | "expired" | "mismatch";

/**
 * Paddle signs `<ts>:<raw body>` with HMAC-SHA256 and sends the digest as hex,
 * so the body has to be the untouched bytes off the wire — re-serialising a
 * parsed object changes key order and whitespace and the digest no longer
 * matches.
 */
function verify(rawBody: string, header: string, secret: string): Verdict {
  const { ts, digests } = parseSignature(header);
  if (ts === null || digests.length === 0) return "malformed";

  // Guards a clock that has drifted in either direction, not just a replay.
  if (Math.abs(Math.floor(Date.now() / 1000) - ts) > MAX_AGE_SECONDS) {
    return "expired";
  }

  const expected = createHmac("sha256", secret)
    .update(`${ts}:${rawBody}`)
    .digest("hex");

  return digests.some((digest) => digestsMatch(expected, digest))
    ? "ok"
    : "mismatch";
}

export async function POST(request: NextRequest) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhook] PADDLE_WEBHOOK_SECRET is not set.");
    return new Response("Webhook not configured", { status: 500 });
  }

  // Header names are case-insensitive, so this matches `Paddle-Signature`.
  const signature = request.headers.get("paddle-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 401 });
  }

  // Raw text, never `request.json()` — see verify().
  const rawBody = await request.text();

  const verdict = verify(rawBody, signature, secret);
  if (verdict !== "ok") {
    // Which check failed is the difference between "the clock is off" and "the
    // wrong value is in PADDLE_WEBHOOK_SECRET" — worth a line in the log, since
    // all three look identical from Paddle's side.
    console.error("[webhook] Rejected a delivery: signature %s.", verdict);
    return new Response(
      verdict === "expired" ? "Signature expired" : "Invalid signature",
      { status: 401 },
    );
  }

  // Signature checked, so the body is Paddle's. Two fields are all this route
  // needs, so it is parsed here rather than through the SDK's `unmarshal`,
  // whose entity mapping throws on any payload shape it doesn't fully
  // recognise — and a parse failure returned as a 401 would look like a signing
  // problem while Paddle quietly retried.
  let payload: PaddleNotification;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (payload.event_type !== TRANSACTION_COMPLETED) {
    return new Response("Ignored", { status: 200 });
  }

  const reportId = readReportId(payload);
  if (!reportId) {
    console.error("[webhook] %s carried no reportId in custom_data.", payload.event_type);
    return new Response("Missing reportId", { status: 200 });
  }

  if (!(await getReport(reportId))) {
    // 200 on purpose: retrying won't conjure a report that isn't in the store.
    console.error("[webhook] Completed transaction for unknown report %s.", reportId);
    return new Response("Unknown report", { status: 200 });
  }

  // This is the only place `paid` is set, and it is what authorises the paid
  // generation — in this request and in any later call to /unlock.
  await markPaid(reportId);

  // The deep analysis takes over a minute — far too long to hold the webhook
  // open, and Paddle would retry on the timeout. `after()` runs it once the 200
  // is already on the wire, so a buyer who closes the tab still gets a report
  // rather than depending on their browser to ask for one. The claim inside
  // runPaidGeneration is atomic, so racing the buyer's own unlock call costs
  // nothing.
  after(() => runPaidGeneration(reportId));

  console.log("[webhook] Marked report %s paid; deep analysis queued.", reportId);
  return new Response("OK", { status: 200 });
}
