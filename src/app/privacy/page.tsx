import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { getLegalDocument } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy — BetweenSoul",
  description: "What BetweenSoul collects, why, and how long it is kept.",
};

export default function PrivacyPage() {
  return <LegalPage doc={getLegalDocument("privacy")} />;
}
