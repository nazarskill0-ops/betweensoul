import Link from "next/link";
import {
  BellIcon,
  ChevronRightIcon,
  LockIcon,
  MailIcon,
  QuestionCircleIcon,
  TrashIcon,
} from "./icons";
import { SettingsSignOutButton } from "./SettingsSignOutButton";
import { PersonIcon } from "@/features/psychologists/components/icons";

const SETTINGS_ITEMS = [
  { href: "/dashboard/settings/profile", label: "Редагувати профіль", Icon: PersonIcon },
  { href: "/dashboard/settings/password", label: "Змінити пароль", Icon: LockIcon },
  { href: "/dashboard/settings/email", label: "Змінити пошту", Icon: MailIcon },
  {
    href: "/dashboard/settings/notifications",
    label: "Налаштування сповіщень",
    Icon: BellIcon,
  },
  { href: "/dashboard/settings/delete", label: "Видалення профілю", Icon: TrashIcon },
  { href: "/dashboard/settings/faq", label: "FAQ", Icon: QuestionCircleIcon },
];

export function SettingsView() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl text-ink">Налаштування</h1>

      <div className="max-w-lg divide-y divide-sand-dark overflow-hidden rounded-card border-[1.5px] border-sand-dark bg-white">
        {SETTINGS_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-sand"
          >
            <item.Icon className="h-5 w-5 shrink-0 text-ink-muted" />
            <span className="flex-1 text-sm font-medium text-ink">{item.label}</span>
            <ChevronRightIcon className="h-4 w-4 shrink-0 text-ink-muted" />
          </Link>
        ))}
      </div>

      <SettingsSignOutButton />
    </div>
  );
}
