import type { Metadata } from "next";

/**
 * The report page is a client component, and a client component can't export
 * metadata — so the `noindex` lives in a layout wrapping it.
 *
 * `nofollow` as well as `noindex`: the page links to the checkout and back into
 * the funnel, and there is no reason to hand a crawler that arrived at somebody
 * else's report a set of paths to follow out of it.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ResultLayout({ children }: LayoutProps<"/result">) {
  return children;
}
