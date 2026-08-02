"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SERVICES, SPECIALIZATIONS } from "@/features/psychologists/schema";
import { NavDropdown } from "@/components/layout/nav-dropdown";
import { TopicsMegaMenu } from "@/components/layout/topics-mega-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Logo } from "@/components/layout/logo";
import { AuthMenu } from "@/components/layout/auth-menu";
import { isChromelessRoute } from "@/components/layout/chromeless-routes";

export function AppHeader() {
  const pathname = usePathname();
  if (isChromelessRoute(pathname)) return null;

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-sand-dark bg-sand/90 px-5 backdrop-blur-md md:px-12">
      <Logo />

      <nav className="hidden items-center gap-8 md:flex">
        <NavDropdown label="Послуги" items={SERVICES} paramName="service" />
        <TopicsMegaMenu />
        <NavDropdown
          label="Методи"
          items={SPECIALIZATIONS}
          paramName="specializations"
          columns={2}
        />
        <Link
          href="/for-psychologists"
          className="text-sm text-ink transition-colors hover:text-sage"
        >
          Для психологів
        </Link>
      </nav>

      <div className="hidden md:flex">
        <AuthMenu />
      </div>

      <MobileNav />
    </header>
  );
}