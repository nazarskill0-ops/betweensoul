"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import {
  CalendarIcon,
  HeartIcon,
  PersonIcon,
} from "@/features/psychologists/components/icons";
import { GearIcon, MailIcon } from "./icons";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Мій профіль", Icon: PersonIcon },
  { href: "/dashboard/sessions", label: "Сесії", Icon: CalendarIcon },
  { href: "/dashboard/favorites", label: "Улюблені психологи", Icon: HeartIcon },
  { href: "/dashboard/support", label: "Підтримка", Icon: MailIcon },
  { href: "/dashboard/settings", label: "Налаштування", Icon: GearIcon },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col md:flex-row md:min-h-dvh">
      <div className="px-5 pt-6 md:hidden">
        <Logo />
        <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border-[1.5px] px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-sage bg-sage-light text-sage"
                    : "border-sand-dark text-ink-muted hover:border-sage"
                }`}
              >
                <item.Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <aside className="hidden shrink-0 bg-white md:block md:w-64">
        <div className="sticky top-0 flex flex-col gap-6 p-4">
          <div className="px-4 pt-2">
            <Logo />
          </div>

          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-sage-light text-sage"
                      : "text-ink-muted hover:bg-sand"
                  }`}
                >
                  <item.Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="min-w-0 flex-1 px-5 py-8 md:px-8">
        <div className="max-w-4xl">{children}</div>
      </div>
    </div>
  );
}
