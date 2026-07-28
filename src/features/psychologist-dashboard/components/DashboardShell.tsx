"use client";

import {
  DashboardSidebarShell,
  type DashboardNavItem,
} from "@/components/layout/DashboardSidebarShell";
import { CalendarIcon, PersonIcon } from "@/features/psychologists/components/icons";
import { MailIcon } from "@/features/dashboard/components/icons";
import { HomeIcon, WalletIcon } from "./icons";

const NAV_ITEMS: DashboardNavItem[] = [
  { href: "/psychologist-dashboard", label: "Дашборд", Icon: HomeIcon },
  { href: "/psychologist-dashboard/schedule", label: "Розклад", Icon: CalendarIcon },
  { href: "/psychologist-dashboard/profile", label: "Мій профіль", Icon: PersonIcon },
  { href: "/psychologist-dashboard/payouts", label: "Виплати", Icon: WalletIcon },
  { href: "/psychologist-dashboard/support", label: "Підтримка", Icon: MailIcon },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return <DashboardSidebarShell navItems={NAV_ITEMS}>{children}</DashboardSidebarShell>;
}
