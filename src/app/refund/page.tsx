import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { getLegalDocument } from "@/lib/legal";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Refund Policy — CouplesScan",
  description: "CouplesScan refund policy for paid compatibility reports.",
  path: "/refund",
});

export default function RefundPage() {
  return <LegalPage doc={getLegalDocument("refund")} />;
}
