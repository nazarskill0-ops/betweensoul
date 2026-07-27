import { SERVICES, type PsychologistProfile } from "@/features/psychologists/schema";
import type { EducationRowValues, ProfileFormValues } from "../schema";

function toEducationItem(row: EducationRowValues) {
  return {
    title: row.title,
    speciality: row.speciality,
    years: row.years,
    certificateUrls: row.certificateFiles.map((f) => f.url),
  };
}

/**
 * Зливає "чернеткові" (ще не збережені) значення форми редагування профілю
 * поверх реального каталожного запису психолога — для прев'ю через ту саму
 * публічну верстку PsychologistProfileView. Поля, які кабінет психолога не
 * редагує (ім'я/прізвище, відео-презентація, відгуки, кількість сесій,
 * статус верифікації тощо — модеровані чи системні), лишаються з базового
 * запису.
 */
export function buildPreviewProfile(
  base: PsychologistProfile,
  draft: ProfileFormValues
): PsychologistProfile {
  return {
    ...base,
    qualification: draft.qualification,
    birthDate: draft.birthDate,
    practiceStartYear: draft.practiceStartYear,
    languages: draft.languages,
    experienceText: draft.experienceText,
    therapyStyle: draft.therapyStyle,
    avatarUrl: draft.avatarUrl,
    aboutMe: draft.aboutMe,
    specializations: draft.specializations,
    topics: draft.topics,
    priceMinor: draft.priceMinor,
    couplePriceMinor: draft.offersCoupleTherapy ? draft.couplePriceMinor : null,
    coupleSessionDurationMinutes: draft.offersCoupleTherapy
      ? draft.coupleSessionDurationMinutes
      : null,
    services: draft.offersCoupleTherapy ? [...SERVICES] : [SERVICES[0]],
    education: {
      higher: draft.educationHigher.map(toEducationItem),
      courses: draft.educationCourses.map(toEducationItem),
      other: draft.educationOther.map(toEducationItem),
    },
  };
}
