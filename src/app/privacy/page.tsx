import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { getLegalDocument } from "@/lib/legal";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy — CoupleScan",
  description: "How CoupleScan handles your data and protects your privacy.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return <LegalPage doc={getLegalDocument("privacy")} />;
}
