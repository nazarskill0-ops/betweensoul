import { Redis } from "@upstash/redis";
import { PaidReport, PaidStatus, StoredReport } from "@/lib/types";

/**
 * Server-side store for generated reports, backed by Upstash Redis.
 *
 * The free sections are generated on submit; the paid sections are generated
 * only after the transaction is confirmed paid and are never sent to the
 * browser before that. That's what makes the paywall real rather than a CSS
 * blur over data the user already has.
 *
 * Redis rather than a Map because every request on Vercel can land on a
 * different instance: the webhook that confirms payment and the poll that
 * reads the result are almost never the same one, and a redeploy between the
 * two used to lose a report that had already been paid for.
 */

/** Reports expire 24h after the test — see the privacy policy. */
const TTL_SECONDS = 60 * 60 * 24;

/**
 * How long one paid generation may hold its claim. Long enough for the ~70s
 * Sonnet pass plus a retry; short enough that an instance killed mid-run
 * doesn't wedge the report forever.
 */
const CLAIM_TTL_SECONDS = 60 * 10;

const key = (id: string) => `report:${id}`;
/** Held for the duration of one paid generation. See claimForPaidGeneration. */
const claimKey = (id: string) => `report:${id}:generating`;

let client: Redis | null = null;

function db(): Redis {
  if (client) return client;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Constructed lazily so a build without the variables still succeeds; the
  // failure lands on the request that needed the store, naming what's missing.
  if (!url || !token) {
    throw new Error(
      "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set to store reports.",
    );
  }

  client = new Redis({ url, token });
  return client;
}

/**
 * Every write uses the same absolute expiry rather than a fresh 24h window, so
 * unlocking a report — or retrying a generation — can't quietly extend how long
 * the answers are kept.
 */
function expiresAt(report: StoredReport) {
  return Math.floor(report.createdAt / 1000) + TTL_SECONDS;
}

async function write(report: StoredReport): Promise<void> {
  await db().set(key(report.id), JSON.stringify(report), {
    exat: expiresAt(report),
  });
}

export async function saveReport(report: StoredReport): Promise<void> {
  await write(report);
}

export async function getReport(id: string): Promise<StoredReport | null> {
  // The client JSON-parses what `write` stringified.
  return (await db().get<StoredReport>(key(id))) ?? null;
}

/**
 * Moves a report to `processing` — but only once, across every instance.
 *
 * The guard is a separate key set with NX, which Redis only creates if it does
 * not already exist. Two callers (a webhook retry, or a second tab polling with
 * the dev bypass on) can both read `unpaid` and race here; only one can create
 * the key, and the loser gets `false` and does nothing.
 *
 * The key expires on its own, so a run whose instance dies mid-generation stops
 * blocking a later retry instead of leaving the report unclaimable forever.
 */
export async function claimForPaidGeneration(id: string): Promise<boolean> {
  const report = await getReport(id);
  if (!report || report.paidStatus === "ready") return false;

  const claimed = await db().set(claimKey(id), "1", {
    nx: true,
    ex: CLAIM_TTL_SECONDS,
  });
  if (claimed !== "OK") return false;

  await write({ ...report, paidStatus: "processing" });
  return true;
}

/** Stores the finished paid sections and flips the status to `ready`. */
export async function savePaidReport(
  id: string,
  paid: PaidReport,
): Promise<boolean> {
  const report = await getReport(id);
  if (!report) return false;

  await write({ ...report, paid, paidStatus: "ready" });
  await db().del(claimKey(id));
  return true;
}

/**
 * Returns a failed generation to `unpaid` so the next poll (or a webhook
 * retry) can try again, rather than leaving the buyer stuck on a spinner.
 */
export async function releasePaidGeneration(id: string): Promise<void> {
  const report = await getReport(id);
  if (report?.paidStatus === "processing") {
    await write({ ...report, paidStatus: "unpaid" });
  }
  await db().del(claimKey(id));
}

export async function getPaidStatus(id: string): Promise<PaidStatus | null> {
  return (await getReport(id))?.paidStatus ?? null;
}
