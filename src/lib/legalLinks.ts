/**
 * Route → label for the three legal pages.
 *
 * Kept out of `legal.ts` because that module reads the documents off disk with
 * `node:fs`, and this list is needed by client components — the unlock modal
 * among them. Importing it from there dragged the filesystem into the browser
 * bundle and the build refused, correctly.
 */
export const LEGAL_LINKS: { href: string; label: string }[] = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/refund", label: "Refunds" },
];
