import { PartnerHeroSection } from "@/components/partners/PartnerHeroSection";
import { JoinStepsSection } from "@/components/partners/JoinStepsSection";
import { OfferingsSection } from "@/components/partners/OfferingsSection";
import { RequirementsSection } from "@/components/partners/RequirementsSection";
import { PartnerFAQSection } from "@/components/partners/PartnerFAQSection";
import { PartnerFinalCTASection } from "@/components/partners/PartnerFinalCTASection";

export const metadata = {
  title: "Calmi для психологів — приєднатися",
  description:
    "Calmi самостійно знаходить клієнтів і приводить їх до вас. Реєстрація для психологів безкоштовна назавжди.",
};

export default function ForPsychologistsPage() {
  return (
    <main className="bg-white">
      <PartnerHeroSection />
      <JoinStepsSection />
      <OfferingsSection />
      <RequirementsSection />
      <PartnerFAQSection />
      <PartnerFinalCTASection />
    </main>
  );
}
