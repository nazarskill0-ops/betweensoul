import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { getLegalDocument } from "@/lib/legal";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service — CoupleScan",
  description:
    "Terms of service for using CoupleScan relationship compatibility test.",
  path: "/terms",
});

export default function TermsPage() {
  return <LegalPage doc={getLegalDocument("terms")} />;
}
