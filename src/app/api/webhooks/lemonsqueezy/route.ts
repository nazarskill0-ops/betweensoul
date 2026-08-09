import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, after } from "next/server";
import { runPaidGeneration } from "@/lib/paidAnalysis";
import { getReport } from "@/lib/reportStore";

/** Events that mean "this report is now paid for". */
const UNLOCK_EVENTS = new Set(["order_created"]);

/**
 * The Sonnet pass runs inside `after()`, which is billed against this route's
 * budget — and it measures ~70s, so 60 would kill it just before it stored the
 * report. Assumes Fluid compute is on for the project.
 */
export const maxDuration = 300;

function signatureIsValid(rawBody: string, header: string | null, secret: string) {
  if (!header) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest();
  let received: Buffer;
  try {
    received = Buffer.from(header, "hex");
  } catch {
    return false;
  }
  if (received.length !== expected.length) return false;
  return timingSafeEqual(received, expected);
}

export async function POST(request: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhook] LEMONSQUEEZY_WEBHOOK_SECRET is not set.");
    return new Response("Webhook not configured", { status: 500 });
  }

  // Signature is over the raw bytes — read as text before parsing.
  const rawBody = await request.text();

  if (!signatureIsValid(rawBody, request.headers.get("x-signature"), secret)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let payload: {
    meta?: { event_name?: string; custom_data?: { report_id?: string } };
    data?: { attributes?: { status?: string } };
  };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const eventName = payload.meta?.event_name ?? "";
  const reportId = payload.meta?.custom_data?.report_id;
  const status = payload.data?.attributes?.status;

  if (!UNLOCK_EVENTS.has(eventName)) {
    return new Response("Ignored", { status: 200 });
  }
  if (status && status !== "paid") {
    return new Response("Order not paid yet", { status: 200 });
  }
  if (!reportId) {
    console.error("[webhook] %s carried no report_id in custom_data.", eventName);
    return new Response("Missing report_id", { status: 200 });
  }

  if (!(await getReport(reportId))) {
    // 200 on purpose: retrying won't conjure a report that isn't in the store.
    console.error("[webhook] Paid order for unknown report %s.", reportId);
    return new Response("Unknown report", { status: 200 });
  }

  // The deep analysis takes 10-20s — far too long to hold the webhook open,
  // and Lemon Squeezy would retry on the timeout. `after()` runs it once the
  // 200 is already on the wire; the result page polls until it lands.
  after(() => runPaidGeneration(reportId));

  console.log("[webhook] Unlocked report %s; deep analysis queued.", reportId);
  return new Response("OK", { status: 200 });
}
