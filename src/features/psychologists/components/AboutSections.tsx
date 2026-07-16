import type { PsychologistProfile } from "../schema";

export function AboutSections({
  psychologist,
}: {
  psychologist: PsychologistProfile;
}) {
  return (
    <div className="flex flex-col divide-y divide-sand-dark rounded-card border-[1.5px] border-sand-dark bg-white">
      <section className="flex flex-col gap-2 p-5">
        <h2 className="font-display text-xl text-ink">Про терапевта</h2>
        <p className="text-sm text-ink-muted">{psychologist.aboutMe}</p>
      </section>

      <section className="flex flex-col gap-4 p-5">
        <h2 className="font-display text-xl text-ink">Досвід і компетенції</h2>
        <p className="text-sm text-ink-muted">{psychologist.experienceText}</p>

        {psychologist.specializations.length > 0 && (
          <div className="flex flex-col gap-2 rounded-card bg-sage-light p-4">
            <span className="text-xs font-medium uppercase tracking-wide text-sage">
              Методи роботи
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

        {psychologist.topics.length > 0 && (
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
        )}
      </section>

      <section className="flex flex-col gap-2 p-5">
        <h2 className="font-display text-xl text-ink">Особливості терапії</h2>
        <p className="text-sm text-ink-muted">{psychologist.therapyStyle}</p>
      </section>
    </div>
  );
}
