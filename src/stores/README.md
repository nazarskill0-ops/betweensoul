# stores/

Zustand stores for **UI state only** — modal open/closed, booking-wizard step,
mobile menu, etc.

Do NOT put server data (users, psychologists, bookings) here. That belongs in
TanStack Query. See docs/RULES.md rule #4.

Example:

```ts
import { create } from "zustand";

interface BookingWizard {
  step: number;
  next: () => void;
  reset: () => void;
}

export const useBookingWizard = create<BookingWizard>((set) => ({
  step: 0,
  next: () => set((s) => ({ step: s.step + 1 })),
  reset: () => set({ step: 0 }),
}));
```
