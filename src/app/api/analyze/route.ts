import { createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { generateFreeReport } from "@/lib/analysis";
import { MOCK_MODE } from "@/lib/devMode";
import { buildMockFreeReport } from "@/lib/mockAnalysis";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";
import { getReport, saveReport } from "@/lib/reportStore";
import { AnswerValue, PartnerInfo } from "@/lib/types";

/** Five parallel Haiku requests; they finish together, not in sequence. */
export const maxDuration = 60;

interface AnalyzeBody {
  partner1?: PartnerInfo;
  partner2?: PartnerInfo;
  relationshipStart?: string;
  email?: string;
  answers?: Record<string, AnswerValue>;
}

/**
 * A report id derived from the submission itself, so the same test submitted
 * twice lands on the same report.
 *
 * The client retries — a double-tap, a flaky connection, React re-running an
 * effect — and each retry used to mint a fresh UUID and bill another five
 * requests. Hashing the answers makes the second attempt a lookup instead.
 *
 * The email is part of the hash: without it two different couples who happened
 * to pick identical options and identical names would collide onto one report,
 * and the second couple would inherit the first one's paid sections.
 */
function reportIdFor(body: AnalyzeBody): string {
  const answers = body.answers ?? {};
  const canonical = JSON.stringify({
    email: (body.email ?? "").trim().toLowerCase(),
    p1: body.partner1?.name ?? "",
    p2: body.partner2?.name ?? "",
    start: body.relationshipStart ?? "",
    // Key order in the store's answer map isn't stable; sorting makes it so.
    answers: Object.keys(answers)
      .sort()
      .map((k) => [k, answers[k]]),
  });

  const hex = createHash("sha256").update(canonical).digest("hex").slice(0, 32);
  const chars = hex.split("");
  chars[12] = "5"; // version 5: name-based, which is what this is
  chars[16] = ((parseInt(chars[16], 16) & 0x3) | 0x8).toString(16); // RFC variant
  const uuid = chars.join("");

  return [
    uuid.slice(0, 8),
    uuid.slice(8, 12),
    uuid.slice(12, 16),
    uuid.slice(16, 20),
    uuid.slice(20),
  ].join("-");
}

export async function POST(request: NextRequest) {
  // First thing in the handler, before the body is even read: this is the
  // expensive endpoint, and the point of the limit is to stop the work from
  // starting.
  const ip = clientIp(request);
  try {
    const limit = await checkRateLimit(ip);
    if (!limit.allowed) {
      console.warn("[analyze] rate limit hit by %s (%d requests).", ip, limit.count);
      return Response.json(
        { error: "Too many requests. Try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
      );
    }
  } catch (error) {
    // A limiter that can't reach Redis must not take the whole endpoint down
    // with it — failing open costs money in the worst case, failing closed
    // costs every customer.
    console.error("[analyze] rate limit check failed; allowing the request:", error);
  }

  let body: AnalyzeBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { partner1, partner2, relationshipStart = "", email = "", answers } = body;

  if (!partner1?.name || !partner2?.name) {
    return Response.json({ error: "Both partner names are required." }, { status: 400 });
  }
  if (!answers || Object.keys(answers).length === 0) {
    return Response.json({ error: "No answers were submitted." }, { status: 400 });
  }

  // Checked after the body so a malformed request still reports what's wrong
  // with it rather than being masked by a config error.
  if (!MOCK_MODE && !process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY is not configured." },
      { status: 500 },
    );
  }

  const id = reportIdFor(body);
  const transcript = { partner1, partner2, relationshipStart, answers };

  // Everything that can throw lives inside the try, the store lookup included.
  // An error escaping a route handler is answered with a bodyless 500, and a
  // client calling `.json()` on that gets "Unexpected end of JSON input" — a
  // parse error standing in for whatever actually went wrong.
  try {
    const existing = await getReport(id);
    if (existing) {
      console.log("[analyze] %s already exists — returning it unchanged.", id);
      return Response.json({ reportId: id, teaser: existing.free });
    }

    const free = MOCK_MODE
      ? buildMockFreeReport(partner1.name, partner2.name)
      : await generateFreeReport(transcript, id);

    await saveReport({
      id,
      paid: false,
      paidStatus: "pending",
      partner1Name: partner1.name,
      partner2Name: partner2.name,
      createdAt: new Date().toISOString(),
      email,
      // Stored so the paid pass can replay the test without the client.
      answers: transcript,
      free,
      paidSections: null,
    });

    // Only the free sections cross the wire. The paid ones don't exist yet.
    return Response.json({ reportId: id, teaser: free });
  } catch (error) {
    // The specific reason (bad JSON, refusal, truncation, transport, a store
    // that isn't reachable) goes to the server log; the client gets a message
    // it can show a user.
    console.error("[analyze] failed:", error);

    // Worth separating: an unreachable store is an operational problem the
    // reader can wait out, not a bad set of answers they should re-submit.
    const storageDown =
      error instanceof Error && error.message.includes("UPSTASH_REDIS_REST");

    return Response.json(
      {
        error: storageDown
          ? "We couldn't save your report just now. Please try again shortly."
          : "Analysis failed. Please try again.",
      },
      { status: 500 },
    );
  }
}
