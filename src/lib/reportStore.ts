import { redis } from "@/lib/redis";
import { CouplescanReport, PaidSections } from "@/lib/types";

/**
 * Server-side store for generated reports, backed by Upstash Redis.
 *
 * The free sections are generated on submit; the paid sections are generated
 * only after the transaction is confirmed and are never sent to the browser
 * before that. That's what makes the paywall real rather than a CSS blur over
 * data the user already has.
 *
 * Redis rather than a Map because every request on Vercel can land on a
 * different instance: the webhook that confirms payment and the poll that
 * reads the result are almost never the same one, and a redeploy between the
 * two used to lose a report that had already been paid for.
 */

/** Reports expire 24h after the test — see the privacy policy. */
const TTL_SECONDS = 60 * 60 * 24;

/**
 * How long one paid generation may hold its claim. Long enough for five
 * parallel Sonnet requests plus retries; short enough that an instance killed
 * mid-run doesn't wedge the report.
 */
const CLAIM_TTL_SECONDS = 60 * 10;

const key = (id: string) => `report:${id}`;
/** Held for the duration of one paid generation. See claimPaidGeneration. */
const claimKey = (id: string) => `report:${id}:generating`;

/** The connection is shared with the rate limiter and the usage log. */
const db = redis;

/**
 * Every write uses the same absolute expiry rather than a fresh 24h window, so
 * unlocking a report — or retrying a generation — can't quietly extend how long
 * the answers are kept.
 */
function expiresAt(report: CouplescanReport) {
  const createdAt = Date.parse(report.createdAt);
  const base = Number.isNaN(createdAt) ? Date.now() : createdAt;
  return Math.floor(base / 1000) + TTL_SECONDS;
}

async function write(report: CouplescanReport): Promise<void> {
  await db().set(key(report.id), JSON.stringify(report), {
    exat: expiresAt(report),
  });
}

export async function saveReport(report: CouplescanReport): Promise<void> {
  await write(report);
}

export async function getReport(id: string): Promise<CouplescanReport | null> {
  // The client JSON-parses what `write` stringified.
  return (await db().get<CouplescanReport>(key(id))) ?? null;
}

/**
 * Marks a report as paid for. Called by the Paddle webhook and nothing else —
 * it is the only thing that authorises a paid generation.
 */
export async function markPaid(id: string): Promise<boolean> {
  const report = await getReport(id);
  if (!report) return false;
  if (report.paid) return true;

  await write({ ...report, paid: true });
  return true;
}

/**
 * Takes the exclusive right to generate the paid sections, across every
 * instance.
 *
 * The guard is a separate key set with NX, which Redis only creates if it does
 * not already exist. The webhook's background run and the buyer's own unlock
 * call routinely race here; only one can create the key, and the loser gets
 * `false` and does nothing rather than billing a second set of Sonnet requests.
 *
 * The key expires on its own, so a run whose instance dies mid-generation stops
 * blocking a later retry instead of leaving the report unclaimable forever.
 */
export async function claimPaidGeneration(id: string): Promise<boolean> {
  const report = await getReport(id);
  if (!report || !report.paid || report.paidStatus === "ready") return false;

  const claimed = await db().set(claimKey(id), "1", {
    nx: true,
    ex: CLAIM_TTL_SECONDS,
  });
  return claimed === "OK";
}

/** Stores the finished paid sections and flips the status to `ready`. */
export async function savePaidSections(
  id: string,
  sections: PaidSections,
): Promise<boolean> {
  const report = await getReport(id);
  if (!report) return false;

  await write({ ...report, paidSections: sections, paidStatus: "ready" });
  await db().del(claimKey(id));
  return true;
}

/**
 * Drops the claim after a failed run so the next unlock call can try again,
 * rather than leaving the buyer stuck on a spinner.
 */
export async function releasePaidGeneration(id: string): Promise<void> {
  await db().del(claimKey(id));
}

/** True while a generation is in flight — used to answer "come back shortly". */
export async function isGenerating(id: string): Promise<boolean> {
  return (await db().get<string>(claimKey(id))) !== null;
}
