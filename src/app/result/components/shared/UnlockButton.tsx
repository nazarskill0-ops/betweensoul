"use client";

import { ReactNode, createContext, useContext } from "react";

export const PRICE = "$9.99";

interface UnlockState {
  onUnlock: () => void;
  loading: boolean;
  error: string | null;
}

/**
 * Every unlock button on the page opens the same checkout for the same
 * purchase — there is nothing to buy per section. Passing the handler through
 * ten locked sections and the final CTA as props would be noise, so it rides on
 * context instead.
 */
const UnlockContext = createContext<UnlockState>({
  onUnlock: () => {},
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

/** Compact by design: this is an invitation, not the checkout. */
export function UnlockButton({ full = false }: { full?: boolean }) {
  const { onUnlock, loading, error } = useUnlock();

  return (
    <div className={full ? "space-y-2" : "space-y-2"}>
      <button
        onClick={onUnlock}
        disabled={loading}
        className={`btn-unlock ${full ? "w-full py-3.5 text-base" : ""}`}
      >
        {loading ? "Opening checkout…" : `🔓 Unlock Full Report — ${PRICE}`}
      </button>
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}
