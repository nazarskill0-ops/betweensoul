import type { ReactNode } from "react";

/*
  Спільний вигляд юридичних сторінок (Умови використання, Політика
  конфіденційності): суцільний текст без карток, рамок і фонів — заголовок
  по центру, далі звичайні абзаци в колонці ~800px.
*/

export type LegalSection = {
  /** Якір для прямого посилання на розділ (напр. /terms#refund). */
  id?: string;
  /** Підзаголовок секції — жирний текст, ліворуч. */
  h: string;
  p?: string[];
  ul?: string[];
  /** Абзаци після списку. */
  pAfter?: string[];
  /** Рядки без буллетів, кожен з нового рядка (реквізити, контакти). */
  lines?: ReactNode[];
};

export function LegalDocument({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: readonly LegalSection[];
}) {
  return (
    <main className="bg-white">
      <div className="mx-auto max-w-[800px] px-5 py-20 md:px-8 md:py-28">
        <h1 className="text-center font-display text-3xl leading-tight font-extrabold tracking-tight md:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-center text-sm text-ink-muted">{updated}</p>

        {sections.map((section) => (
          <section key={section.h} id={section.id} className="mt-10 scroll-mt-24">
            <h2 className="text-lg font-bold text-ink">{section.h}</h2>

            {section.p?.map((text) => (
              <p key={text} className="mt-4 leading-relaxed text-ink-muted">
                {text}
              </p>
            ))}

            {section.ul && (
              <ul className="mt-4 list-disc space-y-2 pl-6 leading-relaxed text-ink-muted">
                {section.ul.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}

            {section.lines && (
              <div className="mt-4 leading-relaxed text-ink-muted">
                {section.lines.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            )}

            {section.pAfter?.map((text) => (
              <p key={text} className="mt-4 leading-relaxed text-ink-muted">
                {text}
              </p>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
