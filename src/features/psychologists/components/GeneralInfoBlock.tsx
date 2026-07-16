import { LANGUAGES, type PsychologistProfile } from "../schema";
import { formatAge, formatExperienceYears } from "../utils/formatters";
import { InfoRow } from "./InfoRow";
import { BriefcaseIcon, ClockIcon, GlobeIcon, PersonIcon } from "./icons";

const INDIVIDUAL_SESSION_DURATION_MINUTES = 50;

export function GeneralInfoBlock({
  psychologist,
}: {
  psychologist: PsychologistProfile;
}) {
  const priceUah = psychologist.priceMinor / 100;
  const couplePriceUah =
    psychologist.couplePriceMinor !== null ? psychologist.couplePriceMinor / 100 : null;

  const languageLabels = psychologist.languages
    .map((code) => LANGUAGES.find((l) => l.value === code)?.label)
    .filter(Boolean);

  return (
    <div id="general-info" className="flex flex-col gap-4 rounded-card border-[1.5px] border-sand-dark bg-white p-5">
      <h2 className="font-display text-xl text-ink">Загальна інформація</h2>

      <div className="flex flex-col gap-2.5 rounded-card bg-sand p-3">
        <InfoRow
          icon={<PersonIcon className="h-5 w-5 shrink-0 text-sage" />}
          label="Вік"
          value={formatAge(psychologist.age)}
        />
        {psychologist.experienceYears !== null && (
          <InfoRow
            icon={<BriefcaseIcon className="h-5 w-5 shrink-0 text-sage" />}
            label="Досвід"
            value={formatExperienceYears(psychologist.experienceYears)}
          />
        )}
        {languageLabels.length > 0 && (
          <InfoRow
            icon={<GlobeIcon className="h-5 w-5 shrink-0 text-sage" />}
            label="Мова"
            value={languageLabels.join(", ")}
          />
        )}
      </div>

      <div className="flex items-center gap-1.5 text-lg">
        <ClockIcon className="h-5 w-5 shrink-0 text-sage" />
        <span className="text-ink-muted">{INDIVIDUAL_SESSION_DURATION_MINUTES} хв</span>
        <span className="text-ink-muted"> · </span>
        <span className="font-bold text-ink">{priceUah} ₴</span>
      </div>

      {couplePriceUah !== null && (
        <div className="flex items-center gap-1.5 text-lg">
          <ClockIcon className="h-5 w-5 shrink-0 text-sage" />
          <span className="text-ink-muted">
            {psychologist.coupleSessionDurationMinutes ?? INDIVIDUAL_SESSION_DURATION_MINUTES} хв
            (парна)
          </span>
          <span className="text-ink-muted"> · </span>
          <span className="font-bold text-ink">{couplePriceUah} ₴</span>
        </div>
      )}
    </div>
  );
}
