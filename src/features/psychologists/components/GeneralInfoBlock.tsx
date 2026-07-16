import { LANGUAGES, type PsychologistProfile } from "../schema";
import { formatAge, formatExperienceYears } from "../utils/formatters";
import { InfoRow } from "./InfoRow";
import { BriefcaseIcon, ClockIcon, GlobeIcon, PersonIcon } from "./icons";

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
        <InfoRow
          icon={<ClockIcon className="h-5 w-5 shrink-0 text-sage" />}
          label="Ціна (індивідуальна)"
          value={`${priceUah} ₴`}
        />
        {couplePriceUah !== null && (
          <InfoRow
            icon={<ClockIcon className="h-5 w-5 shrink-0 text-sage" />}
            label="Ціна (парна)"
            value={`${couplePriceUah} ₴`}
          />
        )}
      </div>
    </div>
  );
}
