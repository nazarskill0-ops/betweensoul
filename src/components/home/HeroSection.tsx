import Link from "next/link";

function PersonIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  );
}

function VideoIcon({ className }: { className?: string }) {
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
      <rect x="3" y="6" width="13" height="12" rx="2" />
      <path d="m16 10 5-3v10l-5-3" />
    </svg>
  );
}

function HeroIllustration() {
  return (
    <div
      aria-hidden
      className="absolute top-1/2 right-0 hidden h-[420px] w-[420px] -translate-y-1/2 translate-x-1/4 md:block"
    >
      {/* Background sage circles — kept as depth behind the illustration */}
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
        <circle cx="220" cy="180" r="160" className="fill-sage-light" />
        <circle cx="240" cy="150" r="90" className="fill-sage/20" />
        <circle cx="150" cy="260" r="50" className="fill-sage/15" />
      </svg>

      {/* Video-session illustration */}
      <div className="absolute top-1/2 left-1/2 h-64 w-72 -translate-x-1/2 -translate-y-1/2 rounded-card border-[1.5px] border-sand-dark bg-white shadow-sm">
        <div className="flex h-full items-center justify-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-sage-light">
            <PersonIcon className="h-14 w-14 text-sage" />
          </div>
        </div>

        <div className="absolute right-3 bottom-3 flex h-16 w-16 items-center justify-center rounded-card border-2 border-white bg-sage">
          <PersonIcon className="h-8 w-8 text-white" />
        </div>

        <div className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white">
          <VideoIcon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-5 pt-[88px] pb-[44px] md:px-12 md:pt-[132px] md:pb-[66px]">
      <HeroIllustration />
      <div className="relative mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <Link
            href="/partners"
            className="text-sm font-medium text-ink-muted underline decoration-sand-dark underline-offset-4 transition-colors hover:text-sage"
          >
            Для психологів →
          </Link>

          <h1 className="mt-4 text-5xl leading-[1.05] font-bold tracking-tight md:text-6xl">
            Онлайн-консультації психолога без довгих пошуків
          </h1>
          <p className="mt-5 max-w-md text-lg text-ink-muted">
            Перевірені психологи, зручний запис, оплата прямо на платформі
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/catalog"
              className="rounded-full border-[1.5px] border-sage bg-sage px-8 py-3.5 font-semibold text-white transition-colors hover:bg-transparent hover:text-sage"
            >
              Знайти психолога
            </Link>
            <Link
              href="/pidbir"
              className="rounded-full border-[1.5px] border-sage px-8 py-3.5 font-semibold text-sage transition-colors hover:bg-sage-light"
            >
              Підібрати спеціаліста
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
