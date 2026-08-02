import Link from "next/link";

export const metadata = { title: "Верифікація психологів — Calmi" };

const STEPS = [
  {
    title: "Перевірка освіти",
    text: "Кожен фахівець надає дипломи та сертифікати про профільну освіту й підвищення кваліфікації. Ми перевіряємо їх справжність.",
  },
  {
    title: "Підтвердження досвіду",
    text: "Ми уточнюємо реальний досвід практики, напрями роботи та методи, у яких фахівець має підготовку.",
  },
  /*{
    title: "Особиста співбесіда",
    text: "Перед публікацією профілю кожен психолог проходить розмову з нашою командою.",
  },*/
  {
    title: "Позначка «Верифіковано»",
    text: "Лише після цього профіль стає видимим для клієнтів. Ви завжди спілкуєтесь із перевіреним фахівцем.",
  },
];

export default function VerificationPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-16 md:px-8">
      <h1 className="font-display text-3xl md:text-4xl">
        Як ми перевіряємо фахівців
      </h1>
      <p className="mt-4 text-ink-muted">
        На Calmi неможливо просто зареєструватись і почати приймати клієнтів.
        Кожен фахівець проходить перевірку, перш ніж з&apos;явитися в каталозі.
        Ось із чого вона складається.
      </p>

      <ol className="mt-10 space-y-6">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage-light font-display text-sage">
              {i + 1}
            </span>
            <div>
              <h2 className="font-semibold">{s.title}</h2>
              <p className="mt-1 text-sm text-ink-muted">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-12 rounded-card bg-sage-light p-6 text-center">
        <p className="text-sm text-ink">
          Ви психолог і готові пройти верифікацію?
        </p>
        <Link
          href="/for-psychologists"
          className="mt-4 inline-block rounded-full bg-sage px-7 py-3 font-semibold text-white transition-colors hover:bg-sage/90"
        >
          Стати партнером
        </Link>
      </div>
    </main>
  );
}
