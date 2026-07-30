import { mockPsychologists } from "@/features/psychologists/mock";
import type {
  PsychologistProfile,
  PsychologistStatus,
} from "@/features/psychologists/schema";
import type { AdminPsychologistRow } from "./schema";

/*
  Единственное место, где адмінка бере/міняє дані психологів.
  Зараз працює на тому самому mock.ts, що й публічний каталог (features/psychologists) —
  toggle статусу тут одразу відображається в /catalog і /psychologist/[id], бо це
  той самий масив у пам'яті.
  TODO(backend): замінити на запити до Supabase (таблиця psychologists), коли
  весь фіче-модуль психологів переїде з моків на реальний бекенд.
*/

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isProfileComplete(p: PsychologistProfile): boolean {
  const hasEducation =
    p.education.higher.length > 0 ||
    p.education.courses.length > 0 ||
    p.education.other.length > 0;
  return (
    p.aboutMe.trim().length > 0 &&
    p.topics.length > 0 &&
    p.specializations.length > 0 &&
    hasEducation &&
    p.priceMinor > 0
  );
}

function toRow(p: PsychologistProfile): AdminPsychologistRow {
  return {
    profileId: p.profileId,
    fullName: p.fullName,
    email: p.email,
    avatarUrl: p.avatarUrl,
    createdAt: p.createdAt,
    status: p.status,
    qualification: p.qualification,
    specializations: p.specializations,
    profileComplete: isProfileComplete(p),
  };
}

export async function fetchAdminPsychologists(): Promise<AdminPsychologistRow[]> {
  await delay(300);
  return [...mockPsychologists]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map(toRow);
}

export async function updatePsychologistStatus(
  profileId: string,
  status: PsychologistStatus
): Promise<void> {
  await delay(200);
  const target = mockPsychologists.find((p) => p.profileId === profileId);
  if (!target) throw new Error("Психолога не знайдено");
  target.status = status;
}
