import Link from "next/link";

function MethodIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 21c4-3 7-6.5 7-10.5A7 7 0 0 0 5 10.5C5 14.5 8 18 12 21z" />
      <path d="M9 11h6" />
      <path d="M12 8v6" />
    </svg>
  );
}

const FEATURED_METHODS = [
  "КПТ",
  "Гештальт",
  "Психоаналіз",
  "EMDR",
  "Сімейна терапія",
  "Арт-терапія",
] as const;

export function PopularMethodsSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-5xl px-5 py-20 md:px-12">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-display text-2xl leading-snug md:text-3xl">
            Популярні методи
          </h2>
          <Link
            href="/catalog"
            className="text-sm font-medium text-sage transition-colors hover:text-sage/80"
          >
            Дивитися всі
          </Link>
        </div>

        <div className="flex flex-wrap gap-3">
          {FEATURED_METHODS.map((method) => (
            <Link
              key={method}
              href={`/catalog?specializations=${encodeURIComponent(method)}`}
              className="flex items-center gap-2 rounded-full border-[1.5px] border-sand-dark px-4 py-2 text-sm text-ink transition-colors hover:border-sage hover:text-sage"
            >
              <MethodIcon className="h-4 w-4 shrink-0 text-sage" />
              {method}
            </Link>
          ))}

          <Link
            href="/catalog"
            className="rounded-full border-[1.5px] border-dashed border-sand-dark px-4 py-2 text-sm text-ink-muted transition-colors hover:border-sage hover:text-sage"
          >
            Інші методи
          </Link>
        </div>
      </div>
    </section>
  );
}
