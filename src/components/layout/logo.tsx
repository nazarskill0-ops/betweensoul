import Link from "next/link";

type LogoProps = {
  variant?: "dark" | "light";
};

// Файла логотипа пока нет — временно текстовый логотип,
// когда появится SVG/PNG — заменить на <Image src="/logo.svg" ... />
export function Logo({ variant = "dark" }: LogoProps) {
  return (
    <Link
      href="/"
      className={`font-display text-2xl tracking-tight ${
        variant === "light" ? "text-white" : "text-ink"
      }`}
    >
      calm<span className="text-sage">i</span>
    </Link>
  );
}