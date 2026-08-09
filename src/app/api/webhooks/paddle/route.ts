import { Environment, EventName, Paddle } from "@paddle/paddle-node-sdk";
import { NextRequest, after } from "next/server";
import { runPaidGeneration } from "@/lib/paidAnalysis";
import { getReport } from "@/lib/reportStore";

/**
 * The only thing that unlocks a paid report.
 *
 * `transaction.completed` means Paddle has the money; the browser's
 * `checkout.completed` event does not, which is why the result page only polls
 * on it rather than being trusted to flip the status itself.
 */

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

export async function POST(request: NextRequest) {
  const apiKey = process.env.PADDLE_API_KEY;
  const secret = process.env.PADDLE_WEBHOOK_SECRET;

  if (!apiKey || !secret) {
    console.error("[webhook] PADDLE_API_KEY / PADDLE_WEBHOOK_SECRET are not set.");
    return new Response("Webhook not configured", { status: 500 });
  }

  const signature = request.headers.get("paddle-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 401 });
  }

  // The signature covers the raw bytes — read as text before parsing.
  const rawBody = await request.text();

  const paddle = new Paddle(apiKey, {
    environment:
      process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "production"
        ? Environment.production
        : Environment.sandbox,
  });

  let valid = false;
  try {
    // Checks the HMAC over `<ts>:<body>` and rejects anything older than 5s.
    valid = await paddle.webhooks.isSignatureValid(rawBody, secret, signature);
  } catch (error) {
    // A malformed `paddle-signature` header throws rather than returning false.
    console.error("[webhook] Could not read the signature header:", error);
  }
  if (!valid) {
    return new Response("Invalid signature", { status: 401 });
  }

  // Signature checked, so the body is Paddle's. It is parsed here rather than
  // through `webhooks.unmarshal`, whose entity mapping throws on any payload
  // shape it doesn't fully recognise — and a parse failure returned as a 401
  // would look like a signing problem while Paddle quietly retried. Two fields
  // are all this route needs.
  let payload: PaddleNotification;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (payload.event_type !== EventName.TransactionCompleted) {
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

  // The deep analysis takes ~70s — far too long to hold the webhook open, and
  // Paddle would retry on the timeout. `after()` runs it once the 200 is
  // already on the wire; the result page polls until it lands. The claim inside
  // runPaidGeneration is atomic, so a retry mid-run costs nothing.
  after(() => runPaidGeneration(reportId));

  console.log("[webhook] Unlocked report %s; deep analysis queued.", reportId);
  return new Response("OK", { status: 200 });
}
