import { PartnerApplicationForm } from "@/features/marketing/components/PartnerApplicationForm";
import { PartnerHeroSection } from "@/components/partners/PartnerHeroSection";
import { RequirementsSection } from "@/components/partners/RequirementsSection";
import { OfferingsSection } from "@/components/partners/OfferingsSection";
import { JoinStepsSection } from "@/components/partners/JoinStepsSection";
import { PartnerFAQSection } from "@/components/partners/PartnerFAQSection";
import { PartnerFinalCTASection } from "@/components/partners/PartnerFinalCTASection";

export const metadata = {
  title: "Calmi для психологів — приєднатися",
  description:
    "Calmi самостійно знаходить клієнтів і приводить їх до вас. Реєстрація для психологів безкоштовна назавжди.",
};

export default function PartnersPage() {
  return (
    <main className="bg-white">
      <PartnerHeroSection />
      <RequirementsSection />
      <OfferingsSection />
      <JoinStepsSection />

      <section id="form" className="bg-sage-light px-5 py-20 md:px-12">
        <div className="mx-auto max-w-xl">
          <h2 className="text-center font-bold text-2xl md:text-3xl">
            Приєднатись до Calmi
          </h2>
          <p className="mt-2 mb-10 text-center text-ink-muted">
            Заповніть анкету — ми зв&apos;яжемось з вами протягом доби
          </p>
          <PartnerApplicationForm />
        </div>
      </section>

      <PartnerFAQSection />
      <PartnerFinalCTASection />
    </main>
  );
}
