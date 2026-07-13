import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { SERVICES, SPECIALIZATIONS, TOPIC_GROUPS } from "@/features/psychologists/schema";

const POPULAR_TOPICS = TOPIC_GROUPS.flatMap((g) => g.topics).slice(0, 6);

export function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#151a18] px-5 py-14 md:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-12">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <Logo variant="light" />
            <p className="mt-3 text-sm text-white/60">
              Платформа для пошуку психологів та психотерапевтів в Україні
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
                  href={`/catalog?topic=${encodeURIComponent(topic)}`}
                  label={topic}
                />
              ))}
            </FooterColumn>

            <FooterColumn title="Методи">
              {SPECIALIZATIONS.slice(0, 6).map((item) => (
                <FooterLink
                  key={item}
                  href={`/catalog?specialization=${encodeURIComponent(item)}`}
                  label={item}
                />
              ))}
            </FooterColumn>
          </div>

          <div className="max-w-xs">
            <div className="mb-3 text-xs font-medium uppercase tracking-wide text-white/40">
              Юридична інформація
            </div>
            <FooterLink href="/terms" label="Умови користування" />
            <FooterLink href="/privacy" label="Політика конфіденційності" />

            <div className="mt-6 text-xs font-medium uppercase tracking-wide text-white/40">
              Зв'язатися з нами
            </div>
            <a
              href="mailto:hello@calmi.me"
              className="mt-2 block text-sm text-white/90 hover:text-white"
            >
              hello@calmi.me
            </a>
          </div>
        </div>

        <div className="flex flex-col-reverse items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <span className="text-xs text-white/40">
            © {year} Calmi. Усі права захищені.
          </span>
          <div className="flex items-center gap-5">
            <Link href="/terms" className="text-xs text-white/40 hover:text-white/70">
              Умови користування
            </Link>
            <Link href="/privacy" className="text-xs text-white/40 hover:text-white/70">
              Політика конфіденційності
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 text-xs font-medium uppercase tracking-wide text-white/40">
        {title}
      </div>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-sm text-white/90 transition-colors hover:text-white">
      {label}
    </Link>
  );
}