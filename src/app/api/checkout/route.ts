import { NextRequest } from "next/server";
import { MOCK_MODE } from "@/lib/devMode";
import { buildMockPaidReport } from "@/lib/mockAnalysis";
import { getReport, savePaidReport } from "@/lib/reportStore";

const LEMON_SQUEEZY_API = "https://api.lemonsqueezy.com/v1/checkouts";

/**
 * Creates a Lemon Squeezy hosted checkout for one report.
 *
 * The report id rides along as custom data so the webhook can match the paid
 * order back to the report. The buyer is sent back to /result?report=<id>,
 * where the page polls until the webhook lands.
 */
export async function POST(request: NextRequest) {
  let reportId: string | undefined;
  try {
    ({ reportId } = await request.json());
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!reportId) {
    return Response.json({ error: "reportId is required." }, { status: 400 });
  }

  const report = await getReport(reportId);
  if (!report) {
    return Response.json({ error: "Report not found." }, { status: 404 });
  }
  if (report.paidStatus === "ready") {
    return Response.json({ error: "This report is already unlocked." }, { status: 409 });
  }

  // Fixture mode: drop the canned deep dive straight in so the paid report can
  // be reviewed without a Lemon Squeezy store or a Sonnet call. Dev-only — see
  // src/lib/devMode.ts.
  if (MOCK_MODE) {
    await savePaidReport(
      reportId,
      buildMockPaidReport(report.partner1Name, report.partner2Name),
    );
    return Response.json({ url: `/result?report=${reportId}&paid=1` });
  }

  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  const variantId = process.env.LEMONSQUEEZY_VARIANT_ID;

  if (!apiKey || !storeId || !variantId) {
    return Response.json(
      { error: "Lemon Squeezy is not configured." },
      { status: 500 },
    );
  }

  const origin =
    process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;

  const response = await fetch(LEMON_SQUEEZY_API, {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: report.email || undefined,
            // Lemon Squeezy echoes this back on the webhook payload.
            custom: { report_id: reportId },
          },
          product_options: {
            redirect_url: `${origin}/result?report=${reportId}&paid=1`,
            receipt_button_text: "View your report",
            receipt_link_url: `${origin}/result?report=${reportId}&paid=1`,
          },
          checkout_options: { embed: false },
        },
        relationships: {
          store: { data: { type: "stores", id: String(storeId) } },
          variant: { data: { type: "variants", id: String(variantId) } },
        },
      },
    }),
  });

  if (!response.ok) {
    console.error(
      "[checkout] Lemon Squeezy responded %s: %s",
      response.status,
      await response.text(),
    );
    return Response.json(
      { error: "Could not start checkout. Please try again." },
      { status: 502 },
    );
  }

  const payload = await response.json();
  const url = payload?.data?.attributes?.url;

  if (!url) {
    console.error("[checkout] No checkout URL in response:", payload);
    return Response.json(
      { error: "Could not start checkout. Please try again." },
      { status: 502 },
    );
  }

  return Response.json({ url });
}
