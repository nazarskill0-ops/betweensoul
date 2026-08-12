/**
 * Month names, written out rather than derived.
 *
 * `toLocaleDateString` and the native date controls render in the *browser's*
 * locale, which is how an English form ended up showing a calendar headed
 * "серпень 2026 р." to anyone whose browser was set to Ukrainian. The report
 * and the interface are both English (see the LANGUAGE rule in prompts.ts), so
 * the pickers are too.
 */
export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * For the closed field, which sits in a column about 150px wide on a phone:
 * "September 22, 1994" wraps onto a second line there and leaves one partner's
 * field taller than the other's.
 */
export const SHORT_MONTHS = MONTHS.map((month) => month.slice(0, 3));
