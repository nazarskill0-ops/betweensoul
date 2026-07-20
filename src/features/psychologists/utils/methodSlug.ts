import { SPECIALIZATIONS } from "../schema";

// Deterministic Cyrillic -> Latin transliteration for building stable,
// readable URL slugs from the (Ukrainian) SPECIALIZATIONS taxonomy values.
const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ie",
  ж: "zh", з: "z", и: "y", і: "i", ї: "i", й: "i", к: "k", л: "l",
  м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
  ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ю: "iu",
  я: "ia", ь: "", "'": "", "’": "",
};

export function slugifyMethod(name: string): string {
  return name
    .toLowerCase()
    .split("")
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const SLUG_TO_METHOD = new Map(
  SPECIALIZATIONS.map((name) => [slugifyMethod(name), name] as const)
);

export function getMethodBySlug(slug: string): string | undefined {
  return SLUG_TO_METHOD.get(slug);
}

export function getAllMethodSlugs(): { slug: string; name: string }[] {
  return SPECIALIZATIONS.map((name) => ({ slug: slugifyMethod(name), name }));
}
