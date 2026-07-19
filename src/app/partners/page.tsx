import { PartnerForm } from "@/features/marketing/components/PartnerForm";

/*
  Partner recruitment landing («Терапевтам») — collects applications from
  psychologists who want to join the platform. Ported from
  _design_ref/index.html. The client-facing homepage lives at / (see TASKS.md).
*/

export const metadata = {
  title: "Calmi для психологів — станьте партнером",
  description:
    "Calmi залучає клієнтів і направляє їх до вас. Реєстрація для психологів безкоштовна.",
};

const STEPS = [
  {
    n: 1,
    title: "Реєструєтесь безкоштовно",
    text: "Заповнюєте форму: спеціалізація, досвід, графік. Ми створюємо ваш профіль і запускаємо рекламу, яка веде клієнтів саме до вас.",
  },
  {
    n: 2,
    title: "Клієнт бронює і платить",
    text: "Клієнт знаходить вас через Calmi, обирає зручний час і одразу оплачує сесію на платформі. Ви отримуєте сповіщення — і більше нічого зайвого.",
  },
  {
    n: 3,
    title: "Проводите сесію на Calmi",
    text: "Відеосесія відбувається прямо на нашій платформі. Ніяких сторонніх застосунків, ніякого обміну контактами — все в одному місці.",
  },
];

const BENEFITS = [
  {
    title: "Активне залучення клієнтів",
    text: "Ми запускаємо рекламні кампанії в Google, Instagram та Facebook, щоб люди, які шукають психолога, знаходили саме вас. Це наша робота — не ваша.",
  },
  {
    title: "Захищений канал зв'язку",
    text: "Всі сесії проходять через нашу платформу. Клієнт не отримує ваш номер телефону або email — лише захищений відеозв'язок прямо на Calmi.",
  },
  {
    title: "Оплата одразу на платформі",
    text: "Клієнт платить через Calmi до початку сесії. Ви не займаєтесь збором грошей — кошти надходять вам автоматично після кожної сесії.",
  },
  {
    title: "Тільки цільові клієнти",
    text: "До вас потрапляють люди, які вже готові до терапії і підходять за вашою спеціалізацією. Ніякого холодного пошуку — лише мотивовані клієнти.",
  },
];

const FAQ = [
  {
    q: "Скільки коштує розміщення на платформі для психолога?",
    a: "Реєстрація безкоштовна. Ви самі встановлюєте свою ціну за сесію — вона повністю ваша. Сервісний збір Calmi додається зверху для клієнта, тобто ваш дохід це не зменшує. Умови діють для перших партнерів платформи.",
  },
  {
    q: "Як Calmi знаходить клієнтів?",
    a: "Залучення клієнтів — це не додаткова функція платформи, це її головна задача. Ми запускаємо рекламні кампанії в Google, Instagram та Facebook, орієнтовані на людей, які вже шукають психологічну допомогу.",
  },
  {
    q: "Як відбувається оплата і скільки я отримую?",
    a: "Клієнт оплачує сесію через Calmi ще до її початку. Ви отримуєте свою повну встановлену ціну — сервісний збір додається зверху і не зменшує вашу суму.",
  },
   {
    q: "Чи може розмір сервісного збору змінитись у майбутньому?",
    a: "На старті ми свідомо тримаємо його мінімальним. У довгостроковій перспективі умови можуть змінюватись у міру розвитку платформи, але про будь-які зміни ми завжди повідомляємо заздалегідь.",
  },
  {
    q: "Чи потрібен мені ФОП?",
    a: "Зараз — ні, оскільки платформа ще не запущена. Але на момент старту платформи знадобиться ФОП 3 групи — це необхідно для того, щоб легально отримувати виплати. Ми завчасно попередимо про це і підкажемо деталі оформлення.",
  },
   {
    q: "Чи буде офіційний договір?",
    a: "Так, ми укладаємо повністю офіційний договір з кожним партнером — в електронному форматі, без потреби особистих зустрічей. Умови завжди обговорюються з терапевтом заздалегідь, до підписання.",
  },
  {
    q: "Як проходить сама сесія — через Zoom чи Telegram?",
    a: "Сесія проходить прямо на платформі Calmi через вбудований відеозв'язок. Ніяких сторонніх застосунків встановлювати не потрібно — ні вам, ні клієнту.",
  },
    {
    q: "Чи підходить платформа для терапевтів за кордоном?",
    a: "Так, це для нас важливо. Наразі це потребує ще певної технічної розробки з нашого боку, але це одна з першочергових задач — ми активно працюємо над тим, щоб зробити виплати зручними і для партнерів, які живуть за межами України.",
  },
  {
    q: "Чи отримає клієнт мій номер телефону або email?",
    a: "Ні. Вся комунікація і відеозв'язок відбуваються виключно через платформу Calmi. Клієнт не має доступу до ваших особистих контактів.",
  },
  {
    q: "Чи можу я в будь-який момент призупинити прийом?",
    a: "Так, ви повністю контролюєте свій графік. Можна закрити прийом на будь-який термін без штрафів — просто оновлюєте доступні слоти у своєму кабінеті.",
  },
  {
    q: "Що відбуватиметься після того як я залишу заявку?",
    a: "Заповнення анкети — це лише збір інформації і ні до чого не зобов'язує. Ми зв'яжемось з вами особисто, щоб узгодити деталі співпраці перед запуском платформи.",
  },
];

function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-logo ${className}`}>
      calm<span className="text-sage">i</span>
    </span>
  );
}

export default function LandingPage() {
  return (
    <>
      {/* NAV */}
      <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-sand-dark bg-sand/90 px-5 backdrop-blur-md md:px-12">
        <Logo className="text-2xl tracking-tight" />
        <a
          href="#form"
          className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sage"
        >
          Стати партнером
        </a>
      </nav>

      {/* HERO */}
      <section className="mx-auto max-w-5xl px-5 pt-16 pb-20 md:px-12 md:pt-24">
        <div className="max-w-2xl">
          <h1 className="mb-5 font-display text-4xl leading-tight md:text-5xl">
            Займайтесь терапією.
            <br />
            Маркетинг — <em className="text-sage italic">наша справа</em>
          </h1>
          <p className="mb-9 max-w-md text-lg text-ink-muted">
            Calmi активно залучає клієнтів через рекламні кампанії і направляє їх
            до вас. Ніякого маркетингу з вашого боку — лише готові клієнти і
            зручні сесії прямо на платформі.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#form"
              className="rounded-full bg-sage px-8 py-3.5 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-sage/90"
            >
              Залишити заявку
            </a>
            <a
              href="#how"
              className="rounded-full border-[1.5px] border-sand-dark px-7 py-3.5 font-medium text-ink transition-colors hover:border-sage hover:text-sage"
            >
              Як це працює
            </a>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-5xl px-5 py-20 md:px-12">
        <h2 className="mb-12 font-display text-3xl leading-snug md:text-4xl">
          Як працюватиме наша платформа?
          <br />
          Три кроки — і клієнти вже у вас
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-card bg-white p-8">
              <div className="mb-4 text-center font-display text-6xl leading-none text-sand-dark">
                {s.n}
              </div>
              <h3 className="mb-2 font-semibold">{s.title}</h3>
              <p className="text-sm text-ink-muted">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFITS */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-5 py-20 md:px-12">
          <h2 className="mb-12 font-display text-3xl leading-snug md:text-4xl">
            Ви фокусуєтесь на терапії —
            <br />
            ми активно шукаємо вам клієнтів
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="flex items-start gap-4 rounded-card bg-sand p-7"
              >
                <div className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-sage" />
                <div>
                  <h3 className="mb-1 font-semibold">{b.title}</h3>
                  <p className="text-sm text-ink-muted">{b.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BANNER */}
      <div className="bg-ink px-5 py-16 text-center md:px-12">
        <h2 className="mb-2 font-display text-2xl text-white md:text-3xl">
          Реєстрація для терапевтів — безкоштовна назавжди
        </h2>
        <p className="mb-7 text-sm text-white/55">
          Ніяких підписок, авансів чи прихованих платежів.
        </p>
        <a
          href="#form"
          className="inline-block rounded-full bg-sage px-8 py-3.5 font-semibold text-white transition-colors hover:bg-sage/90"
        >
          Залишити заявку
        </a>
      </div>

      {/* FORM */}
      <section id="form" className="bg-sage-light px-5 py-20 md:px-12">
        <div className="mx-auto max-w-xl">
          <h2 className="text-center font-display text-3xl md:text-4xl">
            Приєднатись до Calmi
          </h2>
          <p className="mt-2 mb-10 text-center text-ink-muted">
            Заповніть форму — ми зв&apos;яжемось з вами протягом доби
          </p>
          <PartnerForm />
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-5xl px-5 py-20 md:px-12">
        <h2 className="mb-12 font-display text-3xl md:text-4xl">
          Часті запитання
        </h2>
        <div className="max-w-2xl">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group border-b border-sand-dark py-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                {item.q}
                <span className="text-2xl font-light text-sage transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="flex flex-col items-center gap-3 border-t border-sand-dark px-5 py-8 text-center text-sm text-ink-muted md:flex-row md:justify-between md:px-12 md:text-left">
        <Logo className="text-lg text-ink" />
        <div>© 2026 Calmi. Всі права захищені.</div>
        <div className="flex gap-5">
          <a href="/privacy" className="transition-colors hover:text-sage">
            Політика конфіденційності
          </a>
          <a href="/terms" className="transition-colors hover:text-sage">
            Умови використання
          </a>
        </div>
      </footer>
    </>
  );
}
