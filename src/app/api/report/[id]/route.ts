import { NextRequest, after } from "next/server";
import { runPaidGeneration } from "@/lib/paidAnalysis";
import { getReport } from "@/lib/reportStore";

/**
 * Returns the free sections always, and the paid ones only once they exist —
 * which happens after the Lemon Squeezy webhook confirms the order.
 *
 * `paidStatus` drives the client: `unpaid` shows the paywall, `processing`
 * keeps it polling behind a spinner, `ready` renders the deep dive. The paid
 * fields are simply absent until then, so there is nothing withheld in the
 * payload for a determined reader to dig out.
 */

/**
 * Local-only escape hatch: triggers the paid generation without a payment so
 * the full report can be reviewed. Set DEV_PAID_BYPASS=1 in .env.local — never
 * in the Vercel environment. The NODE_ENV guard means a stray production
 * variable can't hand out paid reports for free.
 */
const PAID_BYPASS =
  process.env.NODE_ENV !== "production" && process.env.DEV_PAID_BYPASS === "1";

/** The dev bypass runs the ~70s Sonnet pass in `after()` on this route. */
export const maxDuration = 300;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const report = await getReport(id);

  if (!report) {
    return Response.json({ error: "Report not found." }, { status: 404 });
  }

  let { paidStatus } = report;

  // With the bypass on, an unpaid report starts generating on first poll and
  // the client sees `processing` — the same path a real buyer takes.
  if (PAID_BYPASS && paidStatus === "unpaid") {
    console.warn("[report] DEV_PAID_BYPASS is on — generating %s unpaid.", id);
    paidStatus = "processing";
    after(() => runPaidGeneration(id));
  }

  return Response.json({
    paidStatus,
    // Names come from the server so the report reads correctly when it's
    // opened from the receipt link on a device that never took the test.
    partner1Name: report.partner1Name,
    partner2Name: report.partner2Name,
    free: report.free,
    ...(report.paidStatus === "ready" && report.paid ? report.paid : {}),
  });
}
