import type { PsychologistProfile } from "../schema";
import { CollapsibleSection } from "./CollapsibleSection";
import { EducationTimeline } from "./EducationTimeline";
import { GraduationCapIcon, HeartIcon, ListIcon, MedalIcon, PersonIcon } from "./icons";

export function ProfileInfoSections({
  psychologist,
}: {
  psychologist: PsychologistProfile;
}) {
  const hasEducation =
    psychologist.education.higher.length > 0 ||
    psychologist.education.courses.length > 0 ||
    psychologist.education.other.length > 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="divide-y divide-[#f2f2f2] overflow-hidden rounded-card bg-white">
        <CollapsibleSection
          bare
          defaultOpen
          title="Про мене"
          icon={<PersonIcon className="h-4 w-4 text-sage" />}
        >
          <p className="text-sm text-ink-muted">{psychologist.aboutMe}</p>
        </CollapsibleSection>

        <CollapsibleSection
          bare
          title="Досвід і компетенції"
          icon={<MedalIcon className="h-4 w-4 text-sage" />}
        >
          <p className="text-sm text-ink-muted">{psychologist.experienceText}</p>
        </CollapsibleSection>

        <CollapsibleSection
          bare
          title="Особливості терапії"
          icon={<HeartIcon className="h-4 w-4 text-sage" />}
        >
          <p className="text-sm text-ink-muted">{psychologist.therapyStyle}</p>
        </CollapsibleSection>

        {psychologist.specializations.length > 0 && (
          <CollapsibleSection
            bare
            title="Методи роботи"
            icon={<ListIcon className="h-4 w-4 text-sage" />}
          >
            <div className="flex flex-wrap gap-2">
              {psychologist.specializations.map((spec) => (
                <span
                  key={spec}
                  className="rounded-lg border-[1.5px] border-sand-dark px-2 py-1 text-[13px] font-medium text-ink-muted"
                >
                  {spec}
                </span>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {hasEducation && (
          <CollapsibleSection
            bare
            title="Моя освіта"
            icon={<GraduationCapIcon className="h-4 w-4 text-sage" />}
          >
            <EducationTimeline education={psychologist.education} />
          </CollapsibleSection>
        )}
      </div>
    </div>
  );
}
