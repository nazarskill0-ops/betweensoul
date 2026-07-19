import type { PsychologistProfile } from "../schema";

export function TopicsBlock({
  psychologist,
}: {
  psychologist: PsychologistProfile;
}) {
  if (psychologist.topics.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 rounded-card bg-white p-5">
      <h2 className="font-display text-xl font-bold text-ink">З чим я працюю</h2>

      <div className="flex flex-wrap gap-2">
        {psychologist.topics.map((topic) => (
          <span
            key={topic}
            className="rounded-lg border border-sand-dark px-2 py-1 text-[13px] text-ink-muted"
          >
            {topic}
          </span>
        ))}
      </div>
    </div>
  );
}
