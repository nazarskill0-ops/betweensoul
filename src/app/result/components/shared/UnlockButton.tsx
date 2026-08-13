"use client";

import { ReactNode, createContext, useContext } from "react";
import { PAID_SECTIONS, type PaidSectionId } from "../../paidSections";

export const PRICE = "$9.99";
/**
 * The price the offer is measured against, shown struck through beside it.
 *
 * Read as a "was" price this would be a problem: in most of the markets this
 * sells into — the UK, the EU, and a growing list of US states — a crossed-out
 * price has to be one that was actually charged, recently, for a meaningful
 * stretch, and $9.99 is the only price this has ever had. So nothing here says
 * "was". It says $14.99 is the standard price and $9.99 is the launch offer,
 * which is a statement about what happens next rather than about a past that
 * didn't happen — and it is the direction that creates urgency anyway, because
 * the deadline is in front of the reader instead of behind them.
 *
 * That makes it a promise rather than a claim, and it stays true only while
 * the intention to charge $14.99 is real. Terms §2 names both numbers; if the
 * standard price is ever settled at something else, it changes in both places.
 */
export const FULL_PRICE = "$14.99";
export const OFFER_LABEL = "Launch offer";
/** Spelled out under the button, so the strikethrough can't be read as a "was". */
export const OFFER_NOTE = `Goes to ${FULL_PRICE} when the launch offer ends`;

interface UnlockState {
  /** Opens the one modal that sells the report. */
  openModal: () => void;
  /** Hands off to Paddle. Only the modal calls this. */
  startCheckout: () => void;
  loading: boolean;
  error: string | null;
}

/**
 * There is one purchase on this page, and everything that offers it — ten
 * blurred sections, the bar at the bottom, the CTA at the end — opens the same
 * modal. Threading that through ten sections as props would be noise, so it
 * rides on context.
 */
const UnlockContext = createContext<UnlockState>({
  openModal: () => {},
  startCheckout: () => {},
  loading: false,
  error: null,
});

export function UnlockProvider({
  value,
  children,
}: {
  value: UnlockState;
  children: ReactNode;
}) {
  return <UnlockContext.Provider value={value}>{children}</UnlockContext.Provider>;
}

export function useUnlock() {
  return useContext(UnlockContext);
}

/**
 * The button on a blurred section.
 *
 * It names what is behind *this* padlock and says nothing about money. The
 * price used to sit here, on all ten of them, which read as ten separate
 * $9.99 purchases rather than one — the single thing this page most needed to
 * stop implying. The price is stated once, in the modal this opens.
 */
export function SectionUnlockButton({
  sectionId,
}: {
  sectionId: PaidSectionId;
}) {
  const { openModal } = useUnlock();

  return (
    <button onClick={openModal} className="btn-unlock w-full sm:w-auto">
      {PAID_SECTIONS[sectionId].cta}
    </button>
  );
}
