import { payoutForPrice } from "@/lib/config";
import {
  INDIVIDUAL_SESSION_DURATION_MINUTES,
  TEMPLATED_PSYCHOLOGIST_ID,
  addExceptionRange,
  getBlockedSlots as getBlockedSlotsFromStore,
  getCoupleSettings,
  getExceptions,
  getRecurringBookings,
  getWeeklyAvailability,
  removeExceptionRange,
  setCoupleSettings,
  setWeeklyAvailability,
  toggleBlockedSlot as toggleBlockedSlotInStore,
  type BlockedSlot,
} from "@/features/psychologists/utils/availabilityStore";
import {
  mockClientSessionHistory,
  mockPayoutSessions,
  mockProfile,
  mockUpcomingSessions,
} from "./mock";
import type {
  AddExceptionValues,
  AvailabilityException,
  AvailabilityValues,
  CalendarBooking,
  ClientSessionHistoryEntry,
  DashboardStats,
  PayoutSession,
  ProfileFormValues,
  UpcomingSession,
} from "./schema";

/*
  Единственное место, где берутся данные кабінету психолога.
  Зараз працює на моках (mock.ts) — без реальної Supabase auth інтеграції.
  Доступність/винятки/заблоковані слоти йдуть через спільний availabilityStore
  (features/psychologists/utils) — те саме джерело, яким користується
  публічний SlotPicker при генерації слотів для бронювання.
  TODO(backend): fetchUpcomingSessions/fetchDashboardStats → bookings,
  fetchWeeklyCalendar → bookings + availability_slots.
*/

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

let profileState: ProfileFormValues = { ...mockProfile };

export async function fetchUpcomingSessions(): Promise<UpcomingSession[]> {
  await delay(300);
  return mockUpcomingSessions;
}

export async function fetchClientSessionHistory(): Promise<ClientSessionHistoryEntry[]> {
  await delay(300);
  return mockClientSessionHistory;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  await delay(300);
  const now = new Date();
  const thisMonthSessions = mockPayoutSessions.filter((s) => {
    const d = new Date(s.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const monthlyRevenueMinor = thisMonthSessions
    .filter((s) => s.status === "paid")
    .reduce((sum, s) => sum + payoutForPrice(s.priceMinor), 0);

  return {
    monthlyRevenueMinor,
    monthlySessionsCount: thisMonthSessions.length,
  };
}

export async function fetchAvailability(): Promise<AvailabilityValues> {
  await delay(300);
  // TEMPLATED_PSYCHOLOGIST_ID завжди має розклад (засіяний в availabilityStore).
  return getWeeklyAvailability(TEMPLATED_PSYCHOLOGIST_ID) as AvailabilityValues;
}

export async function updateAvailability(values: AvailabilityValues): Promise<void> {
  await delay(300);
  setWeeklyAvailability(TEMPLATED_PSYCHOLOGIST_ID, values);
}

export async function fetchAvailabilityExceptions(): Promise<AvailabilityException[]> {
  await delay(300);
  return getExceptions(TEMPLATED_PSYCHOLOGIST_ID);
}

export async function addAvailabilityException(
  values: AddExceptionValues
): Promise<AvailabilityException[]> {
  await delay(300);
  return addExceptionRange(TEMPLATED_PSYCHOLOGIST_ID, {
    startDate: values.startDate,
    endDate: values.endDate || values.startDate,
    reason: values.reason ?? null,
  });
}

export async function removeAvailabilityException(
  id: string
): Promise<AvailabilityException[]> {
  await delay(300);
  return removeExceptionRange(TEMPLATED_PSYCHOLOGIST_ID, id);
}

export async function fetchBlockedSlots(): Promise<BlockedSlot[]> {
  await delay(300);
  return getBlockedSlotsFromStore(TEMPLATED_PSYCHOLOGIST_ID);
}

export async function toggleBlockedSlot(input: {
  date: string;
  startTime: string;
  endTime: string;
}): Promise<BlockedSlot[]> {
  await delay(150);
  return toggleBlockedSlotInStore(
    TEMPLATED_PSYCHOLOGIST_ID,
    input.date,
    input.startTime,
    input.endTime
  );
}

export async function fetchWeeklyCalendar(): Promise<CalendarBooking[]> {
  await delay(300);
  return getRecurringBookings(TEMPLATED_PSYCHOLOGIST_ID);
}

export async function fetchMyProfile(): Promise<ProfileFormValues> {
  await delay(300);
  const couple = getCoupleSettings(TEMPLATED_PSYCHOLOGIST_ID);
  return {
    ...profileState,
    // Фіксовано для всіх — ігноруємо будь-яке збережене значення.
    individualSessionDurationMinutes: INDIVIDUAL_SESSION_DURATION_MINUTES,
    offersCoupleTherapy: couple?.offersCoupleTherapy ?? false,
    coupleSessionDurationMinutes: couple?.offersCoupleTherapy
      ? couple.coupleSessionDurationMinutes
      : null,
  };
}

export async function updateMyProfile(values: ProfileFormValues): Promise<void> {
  await delay(300);
  profileState = values;
  setCoupleSettings(TEMPLATED_PSYCHOLOGIST_ID, {
    offersCoupleTherapy: values.offersCoupleTherapy,
    coupleSessionDurationMinutes: values.coupleSessionDurationMinutes ?? 0,
  });
}

export async function fetchPayoutSessions(): Promise<PayoutSession[]> {
  await delay(300);
  return mockPayoutSessions;
}
