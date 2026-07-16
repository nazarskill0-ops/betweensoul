import type { PsychologistProfile } from "../schema";
import { CollapsibleSection } from "./CollapsibleSection";

export function AboutSections({
  psychologist,
}: {
  psychologist: PsychologistProfile;
}) {
  return (
    <div className="flex flex-col gap-4">
      <CollapsibleSection title="Про мене" defaultOpen>
        <p className="text-sm text-ink-muted">{psychologist.aboutMe}</p>
      </CollapsibleSection>

      <CollapsibleSection title="Досвід і компетенції">
        <p className="text-sm text-ink-muted">{psychologist.experienceText}</p>
      </CollapsibleSection>

      <CollapsibleSection title="Особливості терапії">
        <p className="text-sm text-ink-muted">{psychologist.therapyStyle}</p>
      </CollapsibleSection>
    </div>
  );
}
