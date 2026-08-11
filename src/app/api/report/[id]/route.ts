import { NextRequest } from "next/server";
import { PAID_BYPASS } from "@/lib/devMode";
import { getReport } from "@/lib/reportStore";

/**
 * Returns the free sections always, and the paid ones only once they exist —
 * which happens after the Paddle webhook confirms the transaction.
 *
 * `needsUnlock` tells the client to POST to /unlock: the payment has landed but
 * the deep analysis hasn't been generated yet. Until then the paid sections are
 * absent from the payload rather than hidden in it, because server-side they
 * do not exist — there is nothing for a determined reader to dig out.
 */

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // A store that can't be reached is a 500 with a reason, not an error escaping
  // the handler as a bodyless 500 that the client can only read as "missing".
  let report;
  try {
    report = await getReport(id);
  } catch (error) {
    console.error("[report] could not read %s:", id, error);
    return Response.json({ error: "Could not load that report." }, { status: 500 });
  }

  if (!report) {
    return Response.json({ error: "Report not found." }, { status: 404 });
  }

  const paid = report.paid || PAID_BYPASS;

  return Response.json({
    id: report.id,
    paid,
    paidStatus: report.paidStatus,
    // Names come from the server so the report reads correctly when it's
    // opened from a receipt link on a device that never took the test — and
    // the genders for the same reason: they pick which pair of colours stands
    // for the two partners, and the browser that opens the link may never have
    // seen the quiz.
    partner1Name: report.partner1Name,
    partner2Name: report.partner2Name,
    partner1Gender: report.answers.partner1.gender,
    partner2Gender: report.answers.partner2.gender,
    createdAt: report.createdAt,
    free: report.free,
    paidSections: report.paidStatus === "ready" ? report.paidSections : null,
    needsUnlock: paid && report.paidStatus !== "ready",
  });
}
