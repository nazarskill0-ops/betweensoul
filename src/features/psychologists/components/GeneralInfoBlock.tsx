import { LANGUAGES, type PsychologistProfile } from "../schema";
import { formatAge, formatExperienceYears } from "../utils/formatters";

type Stat = { value: string; label: string };

function StatCell({ value, label, spanFull }: Stat & { spanFull?: boolean }) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-card bg-sand p-4 ${
        spanFull ? "col-span-2 items-center text-center" : ""
      }`}
    >
      <span className="font-sans text-2xl font-semibold text-ink">{value}</span>
      <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
        {label}
      </span>
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

  const stats: Stat[] = [
    { value: formatAge(psychologist.age), label: "Вік" },
    ...(psychologist.experienceYears !== null
      ? [{ value: formatExperienceYears(psychologist.experienceYears), label: "Досвід" }]
      : []),
    ...(languageLabels.length > 0
      ? [{ value: languageLabels.join(", "), label: "Мова" }]
      : []),
  ];

  return (
    <div
      id="general-info"
      className="flex flex-col gap-4 rounded-card border-[1.5px] border-sand-dark bg-white p-5"
    >
      <h2 className="font-display text-xl text-ink">Загальна інформація</h2>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <StatCell
            key={stat.label}
            value={stat.value}
            label={stat.label}
            spanFull={i === stats.length - 1 && stats.length % 2 !== 0}
          />
        ))}
      </div>
    </div>
  );
}
