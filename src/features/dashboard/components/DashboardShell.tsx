"use client";

import {
  DashboardSidebarShell,
  type DashboardNavItem,
} from "@/components/layout/DashboardSidebarShell";
import {
  CalendarIcon,
  HeartIcon,
  PersonIcon,
} from "@/features/psychologists/components/icons";
import { GearIcon, MailIcon } from "./icons";

const NAV_ITEMS: DashboardNavItem[] = [
  { href: "/dashboard", label: "Мій профіль", Icon: PersonIcon },
  { href: "/dashboard/sessions", label: "Сесії", Icon: CalendarIcon },
  { href: "/dashboard/favorites", label: "Улюблені психологи", Icon: HeartIcon },
  { href: "/dashboard/support", label: "Підтримка", Icon: MailIcon },
  { href: "/dashboard/settings", label: "Налаштування", Icon: GearIcon },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return <DashboardSidebarShell navItems={NAV_ITEMS}>{children}</DashboardSidebarShell>;
}
