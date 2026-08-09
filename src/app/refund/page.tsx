import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { getLegalDocument } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Refund Policy — CouplesScan",
  description: "When we refund the $9.99 full report, and how to ask.",
};

export default function RefundPage() {
  return <LegalPage doc={getLegalDocument("refund")} />;
}
