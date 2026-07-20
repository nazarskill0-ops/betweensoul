import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllMethodSlugs,
  getMethodBySlug,
} from "@/features/psychologists/utils/methodSlug";

export function generateStaticParams() {
  return getAllMethodSlugs().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const method = getMethodBySlug(slug);
  return { title: method ? `${method} — Calmi` : "Метод терапії — Calmi" };
}

export default async function MethodPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const method = getMethodBySlug(slug);

  if (!method) notFound();

  return (
    <main className="mx-auto max-w-3xl px-5 py-16 md:px-12">
      <h1 className="font-display text-3xl md:text-4xl">{method}</h1>
      <p className="mt-4 text-ink-muted">
        Короткий опис методу «{method}» з&apos;явиться тут незабаром —
        розповімо, що це за підхід, кому він підходить і як проходять сесії.
      </p>

      <div className="mt-8 rounded-card border-[1.5px] border-sand-dark bg-white p-6">
        <h2 className="font-semibold text-ink">
          Психологи, які працюють цим методом
        </h2>
        <p className="mt-1.5 text-sm text-ink-muted">
          Перегляньте профілі фахівців, що використовують «{method}» у роботі.
        </p>
        <Link
          href={`/catalog?specializations=${encodeURIComponent(method)}`}
          className="mt-4 inline-block rounded-full bg-sage px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sage/90"
        >
          Переглянути психологів
        </Link>
      </div>
    </main>
  );
}
