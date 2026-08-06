import { NextRequest } from "next/server";
import { getReport } from "@/lib/reportStore";

/**
 * Returns the teaser always, and the paid sections only once the order behind
 * this report has been confirmed paid by the Lemon Squeezy webhook.
 *
 * The paid fields are sent as explicit `null`s rather than being omitted, so
 * the result page can render a locked placeholder per section without ever
 * receiving a word of the real analysis. Nothing on the client blurs real text.
 *
 * The result page polls this after returning from checkout, so it answers 200
 * with `paid: false` rather than an error while payment is still settling.
 */

/**
 * Local-only escape hatch for reviewing the paid report without paying.
 * Set DEV_PAID_BYPASS=1 in .env.local — never in the Vercel environment.
 * The NODE_ENV guard means a stray production variable can't hand out paid
 * reports for free.
 */
const PAID_BYPASS =
  process.env.NODE_ENV !== "production" && process.env.DEV_PAID_BYPASS === "1";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const report = await getReport(id);

  if (!report) {
    return Response.json({ error: "Report not found." }, { status: 404 });
  }

  const { teaser, full } = report.analysis;
  const unlocked = report.paid || PAID_BYPASS;

  if (PAID_BYPASS && !report.paid) {
    console.warn("[report] DEV_PAID_BYPASS is on — serving %s unpaid.", id);
  }

  return Response.json({
    paid: unlocked,
    // Names come from the server so the report reads correctly when it's
    // opened from the receipt link on a device that never took the test.
    partner1Name: report.partner1Name,
    partner2Name: report.partner2Name,
    teaser,
    seeEachOther: unlocked ? full.seeEachOther : null,
    conflictDNA: unlocked ? full.conflictDNA : null,
    gapMap: unlocked ? full.gapMap : null,
    afraidToLose: unlocked ? full.afraidToLose : null,
    uncomfortableTruth: unlocked ? full.uncomfortableTruth : null,
    gettingRight: unlocked ? full.gettingRight : null,
    actionPlan: unlocked ? full.actionPlan : null,
    conversationStarters: unlocked ? full.conversationStarters : null,
  });
}
