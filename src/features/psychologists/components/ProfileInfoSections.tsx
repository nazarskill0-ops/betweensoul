import type { PsychologistProfile } from "../schema";
import { CollapsibleSection } from "./CollapsibleSection";
import { HeartIcon, ListIcon, MedalIcon, PersonIcon, TagIcon } from "./icons";

export function ProfileInfoSections({
  psychologist,
}: {
  psychologist: PsychologistProfile;
}) {
  return (
    <div>
      <h2 className="mb-3 font-display text-2xl font-bold text-sage">
        Про терапевта
      </h2>

      <div className="flex flex-col gap-3">
        {psychologist.topics.length > 0 && (
          <CollapsibleSection
            title="З чим я працюю"
            icon={<TagIcon className="h-5 w-5 text-sage" />}
            defaultOpen
          >
            <div className="flex flex-wrap gap-2">
              {psychologist.topics.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full border-[1.5px] border-sand-dark px-3 py-1.5 text-sm text-ink-muted"
                >
                  {topic}
                </span>
              ))}
            </div>
          </CollapsibleSection>
        )}

        <CollapsibleSection
          title="Про мене"
          icon={<PersonIcon className="h-5 w-5 text-sage" />}
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

        {psychologist.specializations.length > 0 && (
          <CollapsibleSection
            title="Методи роботи"
            icon={<ListIcon className="h-5 w-5 text-sage" />}
          >
            <div className="flex flex-wrap gap-2">
              {psychologist.specializations.map((spec) => (
                <span
                  key={spec}
                  className="rounded-full bg-sage-light px-3 py-1.5 text-sm text-ink"
                >
                  {spec}
                </span>
              ))}
            </div>
          </CollapsibleSection>
        )}
      </div>
    </div>
  );
}
