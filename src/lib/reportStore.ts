import { StoredReport } from "@/lib/types";

/**
 * Server-side store for generated reports.
 *
 * The full analysis is generated once and kept here; the browser only ever
 * receives the teaser until the matching order is confirmed paid. That's what
 * makes the paywall real rather than a CSS blur over data the user already has.
 *
 * ⚠️ This is an in-memory implementation: it survives hot reloads in dev (via
 * globalThis) but NOT multiple serverless instances or a redeploy. Before going
 * live, swap the four functions below for a real store — Vercel KV / Upstash
 * Redis / Postgres. Nothing outside this file needs to change.
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

export async function markPaid(id: string): Promise<boolean> {
  const report = db().get(id);
  if (!report) return false;
  db().set(id, { ...report, paid: true });
  return true;
}

export async function isPaid(id: string): Promise<boolean> {
  return db().get(id)?.paid ?? false;
}
