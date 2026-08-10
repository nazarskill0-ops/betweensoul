/**
 * Fixture mode for local UI work: `/api/analyze` returns a canned free report
 * instead of calling Claude, and the paid sections come from the same fixtures
 * instead of Sonnet (see paidAnalysis.runPaidGeneration).
 *
 * Enable with MOCK_ANALYSIS=1 in .env.local. The NODE_ENV guard means it can
 * never be switched on in a production build, even if the variable is set —
 * otherwise this would hand out paid reports for free.
 */
export const MOCK_MODE =
  process.env.NODE_ENV !== "production" && process.env.MOCK_ANALYSIS === "1";

/**
 * Local-only escape hatch: lets `/api/report/[id]/unlock` run without a
 * payment, so the full report can be reviewed. Set DEV_PAID_BYPASS=1 in
 * .env.local — never in the Vercel environment. The NODE_ENV guard means a
 * stray production variable can't hand out paid reports for free.
 */
export const PAID_BYPASS =
  process.env.NODE_ENV !== "production" && process.env.DEV_PAID_BYPASS === "1";
