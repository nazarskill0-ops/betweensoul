"use client";

import Link from "next/link";
import { SERVICES, SPECIALIZATIONS } from "@/features/psychologists/schema";
import { NavDropdown } from "@/components/layout/nav-dropdown";
import { TopicsMegaMenu } from "@/components/layout/topics-mega-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Logo } from "@/components/layout/logo";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-sand-dark bg-sand/90 px-5 backdrop-blur-md md:px-12">
      <Logo />

      <nav className="hidden items-center gap-8 md:flex">
        <NavDropdown label="Послуги" items={SERVICES} paramName="service" />
        <TopicsMegaMenu />
        <NavDropdown
          label="Методи"
          items={SPECIALIZATIONS}
          paramName="specialization"
          columns={2}
        />
        <Link
          href="/partners"
          className="text-sm text-ink transition-colors hover:text-sage"
        >
          Терапевтам
        </Link>
      </nav>

      <div className="hidden items-center gap-3 md:flex">
        <Link
          href="/login"
          className="text-sm font-medium text-ink transition-colors hover:text-sage"
        >
          Вхід
        </Link>
        <Link
          href="/register"
          className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sage"
        >
          Реєстрація
        </Link>
      </div>

      <MobileNav />
    </header>
  );
}