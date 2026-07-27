import type { ClientSession } from "../schema";

/**
 * Мокові дані зберігають `status` як статичне поле — воно не оновлюється
 * з часом. Тому для відображення завжди рахуємо ефективний статус відносно
 * поточного моменту: сесія, час якої вже минув, вважається завершеною, якщо
 * вона не була скасована (сирий статус "confirmed"/"pending_payment" з
 * минулою датою не повинен показуватись як актуальний).
 */
export function getEffectiveStatus(session: ClientSession): ClientSession["status"] {
  if (session.status === "cancelled" || session.status === "completed") {
    return session.status;
  }

  const endsAt = new Date(session.startsAt).getTime() + session.durationMinutes * 60000;
  return endsAt < Date.now() ? "completed" : session.status;
}
