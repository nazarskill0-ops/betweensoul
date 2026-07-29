import Link from "next/link";

export function PartnerFinalCTASection() {
  return (
    <section className="px-5 py-10 md:px-12 md:py-14">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 rounded-card bg-ink px-8 py-16 text-center text-white md:px-16 md:py-20">
        <h2 className="font-bold text-2xl md:text-3xl">
          Готові приєднатися?
        </h2>
        <p className="max-w-md text-white/70">
          Заповніть анкету — це займає близько 15 хвилин і ні до чого не
          зобов&apos;язує.
        </p>
        <Link
          href="#form"
          className="mt-2 rounded-full bg-sage px-8 py-3.5 font-semibold text-white transition-colors hover:bg-sage/90"
        >
          Приєднатися
        </Link>
      </div>
    </section>
  );
}
