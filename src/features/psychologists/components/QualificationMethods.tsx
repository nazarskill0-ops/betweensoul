import { QUALIFICATIONS, type PsychologistProfile } from "../schema";
import { CollapsibleSection } from "./CollapsibleSection";

export function QualificationMethods({
  psychologist,
}: {
  psychologist: PsychologistProfile;
}) {
  const qualificationLabel = QUALIFICATIONS.find(
    (q) => q.value === psychologist.qualification
  )?.label;

  if (!qualificationLabel && psychologist.specializations.length === 0) return null;

  return (
    <CollapsibleSection title="Кваліфікація та методи">
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
  );
}
