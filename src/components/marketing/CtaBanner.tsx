import Link from "next/link";

/*
  Sage-банер із декоративними колами в кутах. Спільний для CTA «стати
  партнером» на головній і фінального CTA на лендінгу психологів.
*/

export function CtaBanner({
  title,
  text,
  ctaLabel,
  ctaHref,
  className = "",
}: {
  title: string;
  text: string;
  ctaLabel: string;
  ctaHref: string;
  className?: string;
}) {
  return (
    <section className={`px-5 md:px-12 ${className}`}>
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl bg-sage px-8 py-16 text-center text-white md:px-12 md:py-[72px]">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-20 -left-16 h-64 w-64 rounded-full bg-white/10"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 -bottom-24 h-72 w-72 rounded-full bg-white/[0.08]"
        />

        <div className="relative">
          <h2 className="font-display text-2xl leading-snug font-extrabold tracking-tight md:text-[34px]">
            {title}
          </h2>
          <p className="mx-auto mt-4 max-w-md leading-relaxed text-white/85">
            {text}
          </p>
          <Link
            href={ctaHref}
            className="mt-8 inline-block rounded-full bg-white px-8 py-4 font-bold text-sage transition-colors hover:bg-white/90"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
