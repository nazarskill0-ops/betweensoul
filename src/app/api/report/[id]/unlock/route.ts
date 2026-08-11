import { NextRequest } from "next/server";
import { PAID_BYPASS } from "@/lib/devMode";
import { runPaidGeneration } from "@/lib/paidAnalysis";
import { getReport, isGenerating, markPaid } from "@/lib/reportStore";

/**
 * Generates the paid sections for a report that has been paid for.
 *
 * Called by the result page once the transaction is confirmed, and by the
 * Paddle webhook in the background so a buyer who closes the tab still gets a
 * report. Both routes go through the same atomic claim, so whichever arrives
 * second waits rather than billing a second set of Sonnet requests.
 *
 * `paid` is set by the webhook and by nothing else — this route will not
 * generate anything on a report that hasn't been paid for.
 */

/** Five parallel Sonnet requests, with a Haiku retry behind them. */
export const maxDuration = 300;

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Same reason as the GET beside it: an unreachable store must answer with
  // JSON, not with an error escaping the handler.
  let report;
  try {
    report = await getReport(id);
  } catch (error) {
    console.error("[unlock] could not read %s:", id, error);
    return Response.json({ error: "Could not load that report." }, { status: 500 });
  }

  if (!report) {
    return Response.json({ error: "Report not found." }, { status: 404 });
  }

  // Idempotent: a second call after a refresh returns what's stored rather
  // than regenerating it.
  if (report.paidSections) {
    return Response.json({ paidStatus: "ready", paidSections: report.paidSections });
  }

  if (!report.paid) {
    if (!PAID_BYPASS) {
      return Response.json({ error: "This report has not been paid for." }, { status: 403 });
    }
    // Dev only: stand in for the webhook so the paid half can be reviewed.
    console.warn("[unlock] DEV_PAID_BYPASS is on — unlocking %s without payment.", id);
    await markPaid(id);
    report = await getReport(id);
    if (!report) {
      return Response.json({ error: "Report not found." }, { status: 404 });
    }
  }

  const sections = await runPaidGeneration(id);
  if (sections) {
    return Response.json({ paidStatus: "ready", paidSections: sections });
  }

  // No sections and someone holds the claim: the webhook's background run got
  // there first. The client polls GET until it lands.
  if (await isGenerating(id)) {
    return Response.json({ paidStatus: "pending", generating: true }, { status: 202 });
  }

  return Response.json(
    { error: "Could not generate the full report. Please try again." },
    { status: 500 },
  );
}
