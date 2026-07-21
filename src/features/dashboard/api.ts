import { fetchPsychologistById } from "@/features/psychologists/api";
import type { PsychologistProfile } from "@/features/psychologists/schema";
import {
  mockClientSessions,
  mockClientUser,
  mockFavoritePsychologistIds,
  mockNotificationSettings,
} from "./mock";
import type {
  ChangeEmailValues,
  ChangePasswordValues,
  ClientSession,
  ClientUser,
  EditProfileValues,
  NotificationSettingsValues,
} from "./schema";

/*
  Единственное место, где берутся данные клиентського кабінету.
  Зараз працює на моках (mock.ts) — без реальної Supabase auth інтеграції.
  TODO(backend): замінити fetchCurrentClientUser на реальну сесію Supabase,
  fetchClientSessions на запит до bookings.
*/

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchCurrentClientUser(): Promise<ClientUser> {
  await delay(300);
  return mockClientUser;
}

export async function fetchClientSessions(): Promise<ClientSession[]> {
  await delay(300);
  return mockClientSessions;
}

export async function fetchFavoritePsychologists(): Promise<
  PsychologistProfile[]
> {
  await delay(300);
  const results = await Promise.all(
    mockFavoritePsychologistIds.map((id) => fetchPsychologistById(id))
  );
  return results.filter((p): p is PsychologistProfile => p !== null);
}

export async function fetchNotificationSettings(): Promise<NotificationSettingsValues> {
  await delay(300);
  return mockNotificationSettings;
}

// TODO(backend): усі мутації нижче — заглушки, реальний запис піде через
// Supabase (profiles / auth.updateUser) після підключення справжньої авторизації.
export async function updateClientProfile(_values: EditProfileValues): Promise<void> {
  await delay(300);
}

export async function changeClientPassword(_values: ChangePasswordValues): Promise<void> {
  await delay(300);
}

export async function changeClientEmail(_values: ChangeEmailValues): Promise<void> {
  await delay(300);
}

export async function updateNotificationSettings(
  _values: NotificationSettingsValues
): Promise<void> {
  await delay(300);
}

export async function deleteClientAccount(): Promise<void> {
  await delay(300);
}
