import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { PartnerApplicationForm } from "@/features/marketing/components/PartnerApplicationForm";

export const metadata = {
  title: "Приєднатись до Calmi — анкета психолога",
  description:
    "Заповніть анкету, щоб приєднатися до Calmi як психолог або психотерапевт.",
};

function ArrowLeftIcon({ className }: { className?: string }) {
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
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  );
}

export default function ApplyPage() {
  return (
    <main className="min-h-screen bg-sand px-5 pb-24 md:px-12">
      <header className="mx-auto flex max-w-xl items-center justify-between py-6">
        <Logo />
        <Link
          href="/for-psychologists"
          className="flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-sage"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Назад
        </Link>
      </header>

      <div className="mx-auto max-w-xl pt-10 md:pt-16">
        <h1 className="text-center font-display text-3xl leading-snug font-extrabold tracking-tight md:text-4xl">
          Приєднатись до Calmi
        </h1>
        <p className="mx-auto mt-4 mb-10 max-w-md text-center leading-relaxed text-ink-muted">
          Заповніть анкету — ми перевіримо її та зв&apos;яжемось з вами
          протягом доби.
        </p>

        <PartnerApplicationForm />
      </div>
    </main>
  );
}
