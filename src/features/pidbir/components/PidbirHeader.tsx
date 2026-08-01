import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { SUPPORT_EMAIL } from "@/features/pidbir/schema";

/*
  Власний хедер підбору замість глобального (див. chromeless-routes).
  Навмисно без меню каталогу/тем/методів: з анкети мають вести лише два
  виходи — на головну (лого) і в каталог. Усе інше відволікає від флоу.
*/
export function PidbirHeader() {
  return (
    <header className="flex items-center justify-between gap-4 px-5 py-5 md:px-8">
      <Logo />

      <nav className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/catalog"
          className="rounded-full border-[1.5px] border-sand-dark bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-sage hover:text-sage sm:px-5"
        >
          Каталог
        </Link>
        <a
          // Гість не має доступу до кабінету, тож підтримка — це пошта з
          // футера, а не /dashboard/support, куди його розвернуло б на логін.
          href={`mailto:${SUPPORT_EMAIL}`}
          className="rounded-full border-[1.5px] border-sand-dark bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-sage hover:text-sage sm:px-5"
        >
          Служба підтримки
        </a>
      </nav>
    </header>
  );
}
