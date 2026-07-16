import type { EducationItem, PsychologistProfile } from "../schema";

type Category = "higher" | "courses" | "other";

const CATEGORY_LABELS: Record<Category, string> = {
  higher: "Освіта",
  courses: "Курс",
  other: "Досвід",
};

function extractSortYear(years?: string): number {
  if (!years) return -1;
  if (years.includes("дотепер")) return 9999;
  const matches = years.match(/\d{4}/g);
  if (!matches || matches.length === 0) return -1;
  return parseInt(matches[matches.length - 1], 10);
}

export function EducationTimeline({
  education,
}: {
  education: PsychologistProfile["education"];
}) {
  const entries: (EducationItem & { category: Category })[] = [
    ...education.higher.map((item) => ({ ...item, category: "higher" as const })),
    ...education.courses.map((item) => ({ ...item, category: "courses" as const })),
    ...education.other.map((item) => ({ ...item, category: "other" as const })),
  ].sort((a, b) => extractSortYear(b.years) - extractSortYear(a.years));

  if (entries.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 rounded-card border-[1.5px] border-sand-dark bg-white p-5">
      <h2 className="font-display text-2xl text-ink">Моя освіта</h2>

      <div className="flex flex-col gap-6 border-l-2 border-sand-dark pl-6">
        {entries.map((entry, i) => (
          <div key={i} className="relative flex flex-col gap-1.5">
            <span className="absolute -left-[29px] top-1 h-2.5 w-2.5 rounded-full bg-sage ring-4 ring-white" />

            <div className="flex flex-wrap items-center gap-2">
              {entry.years && (
                <span className="font-semibold text-ink">{entry.years}</span>
              )}
              <span className="w-fit rounded-full bg-sage-light px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-sage">
                {CATEGORY_LABELS[entry.category]}
              </span>
            </div>

            <span className="font-semibold text-ink">{entry.title}</span>
            {entry.speciality && (
              <p className="text-sm text-ink-muted">{entry.speciality}</p>
            )}

            {entry.certificateUrls.length > 0 && (
              <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {entry.certificateUrls.map((url, j) => (
                  <a
                    key={url + j}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-card border-[1.5px] border-sand-dark"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Сертифікат ${j + 1}`}
                      className="h-20 w-full object-cover"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
