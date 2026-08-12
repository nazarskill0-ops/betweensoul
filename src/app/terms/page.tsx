import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { getLegalDocument } from "@/lib/legal";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service — CouplesScan",
  description:
    "Terms of service for using CouplesScan relationship compatibility test.",
  path: "/terms",
});

export default function TermsPage() {
  return <LegalPage doc={getLegalDocument("terms")} />;
}
