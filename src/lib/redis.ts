import { Redis } from "@upstash/redis";

/**
 * The one Upstash connection, shared by everything that needs it: the report
 * store, the rate limiter and the usage log.
 *
 * Constructed lazily so a build without the variables still succeeds — the
 * failure lands on the request that needed it, naming what's missing, rather
 * than at import time on a machine that was only compiling.
 */
let client: Redis | null = null;

export function redis(): Redis {
  if (client) return client;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set to store reports.",
    );
  }

  client = new Redis({ url, token });
  return client;
}
