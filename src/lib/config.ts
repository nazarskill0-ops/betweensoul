/*
  Single source of truth for business constants.
  NEVER hardcode these numbers anywhere else in the code — import from here.
  If the founder changes the commission, it changes in ONE place.
*/

/** Platform commission taken from each paid session, as a fraction (0.10 = 10%). */
export const PLATFORM_COMMISSION_RATE = 0.1;

/** Default session length in minutes. */
export const DEFAULT_SESSION_DURATION_MIN = 50;

/** Currency everything is priced in for now. */
export const CURRENCY = "UAH" as const;

/** All times are stored in UTC in the DB and converted to this zone for display
 *  until we add per-user timezones (expansion beyond Ukraine). */
export const DEFAULT_TIMEZONE = "Europe/Kyiv" as const;

/** Interface locale. Ukrainian only for now — see docs/RULES.md (i18n section). */
export const DEFAULT_LOCALE = "uk" as const;

/** Given a session price, how much the psychologist receives after commission. */
export function payoutForPrice(priceMinor: number): number {
  return Math.round(priceMinor * (1 - PLATFORM_COMMISSION_RATE));
}

/** Given a session price, the platform's cut. */
export function commissionForPrice(priceMinor: number): number {
  return priceMinor - payoutForPrice(priceMinor);
}
