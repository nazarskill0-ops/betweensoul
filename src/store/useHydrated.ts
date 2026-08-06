"use client";

import { useSyncExternalStore } from "react";
import { useTestStore } from "@/store/useTestStore";

const unsubscribeNoop = () => {};

// `persist` is always attached by the middleware — the guards only matter if
// the store is ever recreated without it, where "nothing to hydrate" should
// mean "ready", not a crash that takes down the page.
const subscribe = (onChange: () => void) =>
  useTestStore.persist?.onFinishHydration(onChange) ?? unsubscribeNoop;

/**
 * True once zustand's persist middleware has rehydrated from localStorage.
 * Rendering persisted values before this flips would mismatch the server HTML,
 * so the server snapshot is always `false`.
 */
export function useStoreHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => useTestStore.persist?.hasHydrated() ?? true,
    () => false,
  );
}
