"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const navLinks = [
  { href: "/therapists", label: "Каталог" },
  { href: "/partners", label: "Терапевтам" },
];

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-sand-dark bg-sand/90 px-5 backdrop-blur-md md:px-12">
      <Link href="/" className="font-display text-2xl tracking-tight">
        calm<span className="text-sage">i</span>
      </Link>

      <nav className="hidden items-center gap-8 md:flex">
        {navLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="text-sm text-ink transition-colors hover:text-sage"
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <AuthMenu />
    </header>
  );
}

function AuthMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sage"
      >
        Увійти
        <span className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-[14px] border border-sand-dark bg-white shadow-lg">
          <Link
            href="/login"
            className="block px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-sage-light"
          >
            Вхід в акаунт
          </Link>
          <div className="border-t border-sand-dark px-4 pt-3 pb-1 text-xs font-medium uppercase tracking-wide text-ink-muted">
            Реєстрація
          </div>
          <Link
            href="/register"
            className="block px-4 py-3 text-sm text-ink transition-colors hover:bg-sage-light"
          >
            Я шукаю психолога
          </Link>
          <Link
            href="/therapist-register"
            className="block px-4 py-3 text-sm text-ink transition-colors hover:bg-sage-light"
          >
            Я психолог
          </Link>
        </div>
      )}
    </div>
  );
}
