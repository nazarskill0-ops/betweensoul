import Link from "next/link";

/* Общий каркас для страниц входа/регистрации: центр, фон sand, лого сверху. */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-sand px-5 py-12">
      <Link href="/" className="mb-8 font-display text-2xl tracking-tight">
        calm<span className="text-sage">i</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
