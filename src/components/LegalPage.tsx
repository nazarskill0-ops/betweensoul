import Link from "next/link";
import { Block, LegalDocument } from "@/lib/legal";

/**
 * Shared shell for /terms, /privacy and /refund — a single prose column on the
 * app's normal background, so the legal pages read as part of the product
 * rather than a bolted-on afterthought.
 */

/**
 * Renders `**bold**` and `[label](href)`; everything else is literal text.
 *
 * Links matter here specifically: the support address and the Paddle billing
 * portal are the two things a reader arrives on these pages needing, and a
 * legal page that prints them as dead text makes the reader do the work.
 */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-bold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          );
        }

        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) {
          const [, label, href] = link;
          const external = href.startsWith("http");
          return (
            <a
              key={i}
              href={href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="font-semibold text-accent-600 underline decoration-accent-200 underline-offset-2 transition-colors hover:decoration-accent-500"
            >
              {label}
            </a>
          );
        }

        return part;
      })}
    </>
  );
}

function BlockView({ block }: { block: Block }) {
  if (block.kind === "heading") {
    return (
      <h2 className="pt-6 text-xl font-bold text-slate-900">{block.text}</h2>
    );
  }

  if (block.kind === "list") {
    return (
      <ul className="space-y-2 pl-1">
        {block.items.map((item) => (
          <li key={item} className="flex gap-2.5 text-slate-600">
            <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-200" />
            <span>
              <RichText text={item} />
            </span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p className="text-slate-600">
      <RichText text={block.text} />
    </p>
  );
}

export function LegalPage({ doc }: { doc: LegalDocument }) {
  return (
    <main className="flex-1 px-5 py-12">
      <div className="mx-auto w-full max-w-[700px]">
        <Link
          href="/"
          className="text-sm font-semibold text-slate-500 transition-colors hover:text-slate-600"
        >
          ← Back
        </Link>

        <h1 className="mt-6 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          {doc.title}
        </h1>

        {/* No sibling nav here — the root layout's footer already carries the
            three links on every route. */}
        <article className="mt-6 space-y-4 text-[15px] leading-relaxed">
          {doc.blocks.map((block, i) => (
            <BlockView key={i} block={block} />
          ))}
        </article>
      </div>
    </main>
  );
}
