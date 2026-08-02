import Link from "next/link";

function ImagePlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-4.5-4.5L7 21" />
    </svg>
  );
}

/**
 * TODO(content): replace with the real hero photo (next/image, 1:1 crop) once
 * the asset is delivered — the frame keeps the layout stable until then.
 */
function HeroPhotoSlot() {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl border-[1.5px] border-sand-dark bg-sand shadow-[0_30px_70px_-20px_rgba(18,22,20,0.25)]">
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-ink-muted">
        <ImagePlaceholderIcon className="h-10 w-10" />
        <span className="text-sm">Фото психолога / консультації</span>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-5 pt-16 pb-20 md:px-12 md:pt-[88px] md:pb-[120px]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 right-24 hidden h-[340px] w-[340px] rounded-full bg-sage-light blur-3xl md:block"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1.05fr_0.95fr] md:gap-14">
        <div>
          <h1 className="font-display text-4xl leading-[1.08] font-extrabold tracking-tight sm:text-5xl md:text-[56px]">
            Онлайн-консультації психотерапевта без довгих пошуків
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-muted md:text-[19px]">
            Перевірені психологи, зручний запис, оплата прямо на платформі.
          </p>

          <div className="mt-10 flex flex-wrap gap-3.5">
            <Link
              href="/catalog"
              className="rounded-full border-[1.5px] border-sage bg-sage px-7 py-4 font-semibold text-white transition-colors hover:bg-transparent hover:text-sage"
            >
              Усі психологи
            </Link>
            <Link
              href="/pidbir"
              className="rounded-full border-[1.5px] border-sand-dark px-7 py-4 font-semibold text-ink transition-colors hover:border-sage hover:text-sage"
            >
              Підібрати психолога
            </Link>
          </div>
        </div>

        <HeroPhotoSlot />
      </div>
    </section>
  );
}
