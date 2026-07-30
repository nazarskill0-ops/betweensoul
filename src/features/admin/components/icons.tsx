export function ShieldIcon({ className }: { className?: string }) {
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
      <path d="M12 3l7 3v6c0 4.4-3 8-7 9-4-1-7-4.6-7-9V6l7-3z" />
      <path d="M9.5 12l1.8 1.8L14.5 10" />
    </svg>
  );
}
