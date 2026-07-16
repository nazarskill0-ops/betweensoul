export function TopicsHighlight({ topics }: { topics: string[] }) {
  if (topics.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-card border-[1.5px] border-sand-dark bg-white p-5">
      <h2 className="font-display text-xl text-ink">З чим я працюю</h2>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <span
            key={topic}
            className="rounded-full border-[1.5px] border-sand-dark px-3 py-1.5 text-sm text-ink-muted"
          >
            {topic}
          </span>
        ))}
      </div>
    </div>
  );
}
