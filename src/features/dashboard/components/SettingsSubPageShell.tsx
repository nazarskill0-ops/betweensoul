import Link from "next/link";

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
      <path d="M11 18l-6-6 6-6" />
    </svg>
  );
}

export function SettingsSubPageShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/dashboard/settings"
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-sage"
      >
        <ArrowLeftIcon className="h-4 w-4 shrink-0" />
        Налаштування
      </Link>

      <h1 className="font-display text-3xl text-ink">{title}</h1>

      <div className="max-w-lg rounded-card border-[1.5px] border-sand-dark bg-white p-6">
        {children}
      </div>
    </div>
  );
}
