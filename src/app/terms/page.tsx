import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { getLegalDocument } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of Service — CouplesScan",
  description: "The terms you agree to when you use CouplesScan.",
};

export default function TermsPage() {
  return <LegalPage doc={getLegalDocument("terms")} />;
}
