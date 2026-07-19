import type { ReactNode } from "react";
import { LANGUAGES, type PsychologistProfile } from "../schema";
import { formatAge, formatExperienceYears } from "../utils/formatters";
import { BriefcaseIcon, ChatBubbleIcon, FlagIcon, GlobeIcon, PersonIcon } from "./icons";

type Stat = { icon: ReactNode; label: string; value: string };

function StatCell({ icon, label, value }: Stat) {
  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-1.5 text-sm text-ink-muted">
        {icon}
        {label}
      </span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}

export function GeneralInfoBlock({
  psychologist,
}: {
  psychologist: PsychologistProfile;
}) {
  const languageLabels = psychologist.languages
    .map((code) => LANGUAGES.find((l) => l.value === code)?.label)
    .filter((label): label is NonNullable<typeof label> => label !== undefined);

  const therapyTypesLabel =
    psychologist.couplePriceMinor !== null ? "Індивідуальна, Парна" : "Індивідуальна";

  const stats: Stat[] = [
    ...(languageLabels.length > 0
      ? [
          {
            icon: <ChatBubbleIcon className="h-4 w-4 shrink-0 text-sage" />,
            label: "Мова надання сесій",
            value: languageLabels.join(", "),
          },
        ]
      : []),
    {
      icon: <FlagIcon className="h-4 w-4 shrink-0 text-sage" />,
      label: "Типи терапії",
      value: therapyTypesLabel,
    },
    {
      icon: <PersonIcon className="h-4 w-4 shrink-0 text-sage" />,
      label: "Вік",
      value: formatAge(psychologist.age),
    },
    ...(psychologist.experienceYears !== null
      ? [
          {
            icon: <BriefcaseIcon className="h-4 w-4 shrink-0 text-sage" />,
            label: "Досвід",
            value: formatExperienceYears(psychologist.experienceYears),
          },
        ]
      : []),
  ];

  return (
    <div
      id="general-info"
      className="flex flex-col gap-4 rounded-card bg-white p-5"
    >
      <h2 className="font-display text-xl font-bold text-ink">Загальна інформація</h2>

      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {stats.map((stat) => (
          <StatCell key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} />
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-base font-bold text-ink">Формат</h3>
        <span className="flex items-center gap-1.5 text-sm font-medium text-ink">
          <GlobeIcon className="h-4 w-4 shrink-0 text-sage" />
          Онлайн
        </span>
      </div>
    </div>
  );
}
