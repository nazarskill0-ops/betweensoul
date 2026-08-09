import { PaidReport, PaidStatus, StoredReport } from "@/lib/types";

/**
 * Server-side store for generated reports.
 *
 * The free sections are generated on submit; the paid sections are generated
 * only after the order is confirmed paid and are never sent to the browser
 * before that. That's what makes the paywall real rather than a CSS blur over
 * data the user already has.
 *
 * ⚠️ This is an in-memory implementation: it survives hot reloads in dev (via
 * globalThis) but NOT multiple serverless instances or a redeploy. Before going
 * live, swap the functions below for a real store — Vercel KV / Upstash Redis /
 * Postgres. Nothing outside this file needs to change.
 */

const REPORT_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

type Store = Map<string, StoredReport>;

const globalForReports = globalThis as unknown as { __reports?: Store };

function db(): Store {
  if (!globalForReports.__reports) {
    globalForReports.__reports = new Map();
  }
  return globalForReports.__reports;
}

function prune() {
  const cutoff = Date.now() - REPORT_TTL_MS;
  for (const [id, report] of db()) {
    if (report.createdAt < cutoff) db().delete(id);
  }
}

export async function saveReport(report: StoredReport): Promise<void> {
  prune();
  db().set(report.id, report);
}

export async function getReport(id: string): Promise<StoredReport | null> {
  return db().get(id) ?? null;
}

/**
 * Moves a report to `processing` — but only from `unpaid`, and only once.
 *
 * The check and the write happen together here so two concurrent callers (a
 * webhook retry, or a second browser tab polling with the dev bypass on) can't
 * both start a Sonnet run for the same report. The loser gets `false` and does
 * nothing.
 */
export async function claimForPaidGeneration(id: string): Promise<boolean> {
  const report = db().get(id);
  if (!report || report.paidStatus !== "unpaid") return false;
  db().set(id, { ...report, paidStatus: "processing" });
  return true;
}

/** Stores the finished paid sections and flips the status to `ready`. */
export async function savePaidReport(
  id: string,
  paid: PaidReport,
): Promise<boolean> {
  const report = db().get(id);
  if (!report) return false;
  db().set(id, { ...report, paid, paidStatus: "ready" });
  return true;
}

/**
 * Returns a failed generation to `unpaid` so the next poll (or a webhook
 * retry) can try again, rather than leaving the buyer stuck on a spinner.
 */
export async function releasePaidGeneration(id: string): Promise<void> {
  const report = db().get(id);
  if (!report || report.paidStatus !== "processing") return;
  db().set(id, { ...report, paidStatus: "unpaid" });
}

export async function getPaidStatus(id: string): Promise<PaidStatus | null> {
  return db().get(id)?.paidStatus ?? null;
}
