/**
 * Fixture mode for local UI work: `/api/analyze` returns a canned free report
 * instead of calling Claude, and the paid deep dive comes from the same
 * fixtures instead of Sonnet (see paidAnalysis.runPaidGeneration).
 *
 * Enable with MOCK_ANALYSIS=1 in .env.local. The NODE_ENV guard means it can
 * never be switched on in a production build, even if the variable is set —
 * otherwise this would hand out paid reports for free.
 */
export const MOCK_MODE =
  process.env.NODE_ENV !== "production" && process.env.MOCK_ANALYSIS === "1";
