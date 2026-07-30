"use client";

import {
  DashboardSidebarShell,
  type DashboardNavItem,
} from "@/components/layout/DashboardSidebarShell";
import { ShieldIcon } from "./icons";

const NAV_ITEMS: DashboardNavItem[] = [
  { href: "/admin/psychologists", label: "Психологи", Icon: ShieldIcon },
];

export function AdminDashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardSidebarShell navItems={NAV_ITEMS} contentClassName="max-w-none">
      {children}
    </DashboardSidebarShell>
  );
}
