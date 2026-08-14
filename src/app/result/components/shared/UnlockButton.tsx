"use client";

import { ReactNode, createContext, useContext } from "react";
import { PAID_SECTIONS, type PaidSectionId } from "../../paidSections";

export const PRICE = "$9.99";
/**
 * The price the discount is measured against, shown struck through beside it.
 *
 * Struck-through pricing is a claim about what the thing normally costs, and in
 * most of the markets this sells into — the UK, the EU, and a growing list of
 * US states — a "was" price has to have actually been charged, recently, for a
 * meaningful stretch. Right now it hasn't been: $9.99 is the only price this
 * has ever had. Worth knowing before the offer runs anywhere with a regulator.
 */
export const FULL_PRICE = "$14.99";
export const OFFER_LABEL = "Limited offer";

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
 * modal. Threading that through nine sections as props would be noise, so it
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
