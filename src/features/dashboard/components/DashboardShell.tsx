"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarIcon,
  HeartIcon,
  PersonIcon,
} from "@/features/psychologists/components/icons";
import { GearIcon } from "./icons";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Мій профіль", Icon: PersonIcon },
  { href: "/dashboard/sessions", label: "Сесії", Icon: CalendarIcon },
  { href: "/dashboard/favorites", label: "Улюблені психологи", Icon: HeartIcon },
  { href: "/dashboard/settings", label: "Налаштування", Icon: GearIcon },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
        <aside className="md:w-64 md:shrink-0">
          <nav className="flex gap-2 overflow-x-auto pb-1 md:hidden">
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

          <nav className="sticky top-24 hidden flex-col gap-1 rounded-card border-[1.5px] border-sand-dark bg-white p-3 md:flex">
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
        </aside>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
