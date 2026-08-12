import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The legal pages are text, not code, so they live in one markdown file at the
 * repo root and are parsed here at build time. Rewriting the policies is a
 * content edit — no component changes, no redeploy of logic.
 *
 * The file holds three documents separated by a line of `---`, each opening
 * with an `# H1`. Only the handful of markdown features the documents actually
 * use are supported (h1/h2, paragraphs, `-` bullets, `**bold**`, blockquote) —
 * a full markdown dependency would be more surface than three static pages
 * need. Anything else is rendered as a plain paragraph rather than silently
 * dropped.
 */

export type LegalSlug = "terms" | "privacy" | "refund";

export type Block =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] };

export interface LegalDocument {
  /** The `# H1`, used as the page title. */
  title: string;
  blocks: Block[];
}

/** Matched against each document's H1 to decide which route renders it. */
const SLUG_KEYWORDS: Record<LegalSlug, string> = {
  terms: "terms",
  privacy: "privacy",
  refund: "refund",
};

const SOURCE = join(process.cwd(), "couplescan-legal-pages.md");

function parseDocument(raw: string): LegalDocument | null {
  const lines = raw.split("\n");
  const blocks: Block[] = [];
  let title = "";
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push({ kind: "paragraph", text: paragraph.join(" ").trim() });
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    blocks.push({ kind: "list", items: list });
    list = [];
  };
  const flush = () => {
    flushParagraph();
    flushList();
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // The editorial note at the top of the source file is for whoever edits it,
    // not for the public pages.
    if (trimmed.startsWith(">")) continue;

    if (!trimmed) {
      flush();
      continue;
    }
    if (trimmed.startsWith("# ")) {
      flush();
      title = trimmed.slice(2).trim();
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flush();
      blocks.push({ kind: "heading", text: trimmed.slice(3).trim() });
      continue;
    }
    if (trimmed.startsWith("- ")) {
      flushParagraph();
      list.push(trimmed.slice(2).trim());
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  flush();
  return title ? { title, blocks } : null;
}

/** Splits the source file on `---` lines and parses each document. */
function loadAll(): LegalDocument[] {
  const raw = readFileSync(SOURCE, "utf8");
  return raw
    .split(/^---\s*$/m)
    .map(parseDocument)
    .filter((doc): doc is LegalDocument => doc !== null);
}

export function getLegalDocument(slug: LegalSlug): LegalDocument {
  const keyword = SLUG_KEYWORDS[slug];
  const doc = loadAll().find((d) => d.title.toLowerCase().includes(keyword));

  // Failing the build is the right outcome: a legal route that silently renders
  // an empty page is worse than one that never ships.
  if (!doc) {
    throw new Error(
      `No "${keyword}" document found in couplescan-legal-pages.md — each document must open with an "# H1" containing that word.`,
    );
  }
  return doc;
}

