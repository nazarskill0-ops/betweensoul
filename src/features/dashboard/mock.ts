import type {
  ClientSession,
  ClientUser,
  NotificationSettingsValues,
} from "./schema";

export const mockClientUser: ClientUser = {
  id: "client-mock-1",
  fullName: "Марія Іванченко",
  email: "maria.ivanchenko@example.com",
  phone: "+380 67 123 45 67",
  avatarUrl: null,
};

export const mockFavoritePsychologistIds: string[] = ["p-01", "p-04", "p-07"];

export const mockNotificationSettings: NotificationSettingsValues = {
  emailReminders: true,
  smsReminders: false,
  marketingEmails: true,
};

// TODO: verify field names with Illia's booking schema
export const mockClientSessions: ClientSession[] = [
  {
    id: "s-01",
    psychologistId: "p-01",
    psychologistName: "Олена Коваленко",
    psychologistAvatarUrl: "https://i.pravatar.cc/300?img=47",
    startsAt: "2026-07-25T13:00:00.000Z",
    durationMinutes: 50,
    type: "individual",
    priceMinor: 90000,
    status: "confirmed",
  },
  {
    id: "s-02",
    psychologistId: "p-04",
    psychologistName: "Ірина Мельник",
    psychologistAvatarUrl: "https://i.pravatar.cc/300?img=44",
    startsAt: "2026-08-02T09:30:00.000Z",
    durationMinutes: 50,
    type: "couple",
    priceMinor: 140000,
    status: "pending_payment",
  },
  {
    id: "s-03",
    psychologistId: "p-01",
    psychologistName: "Олена Коваленко",
    psychologistAvatarUrl: "https://i.pravatar.cc/300?img=47",
    startsAt: "2026-06-18T13:00:00.000Z",
    durationMinutes: 50,
    type: "individual",
    priceMinor: 90000,
    status: "completed",
  },
  {
    id: "s-04",
    psychologistId: "p-07",
    psychologistName: "Юлія Савченко",
    psychologistAvatarUrl: "https://i.pravatar.cc/300?img=20",
    startsAt: "2026-06-04T15:00:00.000Z",
    durationMinutes: 50,
    type: "individual",
    priceMinor: 80000,
    status: "completed",
  },
  {
    id: "s-05",
    psychologistId: "p-04",
    psychologistName: "Ірина Мельник",
    psychologistAvatarUrl: "https://i.pravatar.cc/300?img=44",
    startsAt: "2026-05-21T10:00:00.000Z",
    durationMinutes: 50,
    type: "couple",
    priceMinor: 140000,
    status: "cancelled",
  },
];
