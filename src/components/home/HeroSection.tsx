import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-5 pt-16 pb-20 md:px-12 md:pt-24 md:pb-28">
      <div className="relative mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <Link
            href="/partners"
            className="text-sm font-medium text-ink-muted underline decoration-sand-dark underline-offset-4 transition-colors hover:text-sage"
          >
            Для психологів →
          </Link>

          <h1 className="mt-4 font-semibold text-4xl leading-tight tracking-tight md:text-5xl">
            Психотерапія онлайн —
без довгих пошуків.
          </h1>
          <p className="mt-5 max-w-md text-lg text-ink-muted font-medium">
            Пошук психолога став простішим.
Знайдіть спеціаліста, якому довірятимете.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/catalog"
              className="rounded-full bg-sage px-8 py-3.5 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-sage/90"
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
