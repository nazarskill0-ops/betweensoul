"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { isChromelessRoute } from "@/components/layout/chromeless-routes";
import { SERVICES, TOPIC_GROUPS } from "@/features/psychologists/schema";
import { slugifyMethod } from "@/features/psychologists/utils/methodSlug";

const POPULAR_TOPICS = TOPIC_GROUPS.flatMap((g) => g.topics).slice(0, 6);
// Fixed curated list (not the full SPECIALIZATIONS taxonomy) — each links to
// its informational /methods/[slug] page rather than a catalog filter.
const FOOTER_METHODS = [
  "КПТ",
  "Гештальт",
  "Психоаналіз",
  "Арт-терапія",
  "EMDR",
  "Екзистенційний аналіз",
] as const;

export function AppFooter() {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  if (isChromelessRoute(pathname)) return null;

  return (
    <footer className="bg-sand-dark px-5 py-14 md:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-16">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-3 text-sm text-ink-muted">
              Онлайн платформа для пошуку психологів та психотерапевтів в Україні. Ви знайдете спеціаліста, якому будете довіряти.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <FooterColumn title="Послуги">
              {SERVICES.map((item) => (
                <FooterLink
                  key={item}
                  href={`/catalog?service=${encodeURIComponent(item)}`}
                  label={item}
                />
              ))}
            </FooterColumn>

            <FooterColumn title="Популярні теми">
              {POPULAR_TOPICS.map((topic) => (
                <FooterLink
                  key={topic}
                  href={`/catalog?topics=${encodeURIComponent(topic)}`}
                  label={topic}
                />
              ))}
            </FooterColumn>

            <FooterColumn title="Методи">
              {FOOTER_METHODS.map((item) => (
                <FooterLink
                  key={item}
                  href={`/methods/${slugifyMethod(item)}`}
                  label={item}
                />
              ))}
            </FooterColumn>
          </div>

          <div className="max-w-xs">
            <div className="mb-4 text-xs font-medium uppercase tracking-wide text-ink-muted">
              Юридична інформація
            </div>
            <div className="flex flex-col gap-3">
              <FooterLink href="/terms" label="Умови користування" />
              <FooterLink href="/privacy" label="Політика конфіденційності" />
            </div>

            <div className="mt-8 mb-3 text-xs font-medium uppercase tracking-wide text-ink-muted">
              Зв'язатися з нами
            </div>
            <a
              href="mailto:support@calmi.in.ua"
              className="block text-sm text-ink transition-colors hover:text-sage"
            >
              support@calmi.in.ua
            </a>
          </div>
        </div>

        <div className="flex flex-col-reverse items-center justify-between gap-4 border-t border-sand-dark pt-6 sm:flex-row">
          <span className="text-xs text-ink-muted">
            © {year} Calmi. Усі права захищені.
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-4 text-xs font-medium uppercase tracking-wide text-ink-muted">
        {title}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-sm text-ink transition-colors hover:text-sage">
      {label}
    </Link>
  );
}
