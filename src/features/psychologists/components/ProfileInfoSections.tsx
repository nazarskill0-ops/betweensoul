import { QUALIFICATIONS, type PsychologistProfile } from "../schema";
import { CollapsibleSection } from "./CollapsibleSection";
import { CalendarIcon, HeartIcon, MedalIcon, PersonIcon } from "./icons";

export function ProfileInfoSections({
  psychologist,
}: {
  psychologist: PsychologistProfile;
}) {
  const qualificationLabel = QUALIFICATIONS.find(
    (q) => q.value === psychologist.qualification
  )?.label;

  return (
    <div className="flex flex-col">
      <div>
        <h2 className="mb-3 font-display text-2xl font-bold text-sage">
          Про терапевта
        </h2>

        <div className="flex flex-col gap-3">
          <CollapsibleSection
            title="Про мене"
            icon={<PersonIcon className="h-5 w-5 text-sage" />}
            defaultOpen
          >
            <p className="text-sm text-ink-muted">{psychologist.aboutMe}</p>
          </CollapsibleSection>

          <CollapsibleSection
            title="Досвід і компетенції"
            icon={<MedalIcon className="h-5 w-5 text-sage" />}
          >
            <p className="text-sm text-ink-muted">{psychologist.experienceText}</p>
          </CollapsibleSection>

          <CollapsibleSection
            title="Особливості терапії"
            icon={<HeartIcon className="h-5 w-5 text-sage" />}
          >
            <p className="text-sm text-ink-muted">{psychologist.therapyStyle}</p>
          </CollapsibleSection>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="mb-3 font-display text-2xl font-bold text-sage">
          Кваліфікація та методи
        </h2>

        <CollapsibleSection
          title="Кваліфікація та методи"
          icon={<CalendarIcon className="h-5 w-5 text-sage" />}
        >
          {qualificationLabel && <p className="text-sm text-ink">{qualificationLabel}</p>}

          {psychologist.specializations.length > 0 && (
            <div className="flex flex-col gap-2 rounded-card bg-sage-light p-4">
              <span className="text-xs font-medium uppercase tracking-wide text-sage">
                Підходи
              </span>
              <div className="flex flex-wrap gap-2">
                {psychologist.specializations.map((spec) => (
                  <span
                    key={spec}
                    className="rounded-full bg-white px-3 py-1.5 text-sm text-ink"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CollapsibleSection>
      </div>
    </div>
  );
}
