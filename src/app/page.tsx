import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { FeaturedTopicsSection } from "@/components/home/FeaturedTopicsSection";
import { WhyCalmiSection } from "@/components/home/WhyCalmiSection";
import { CrisisSupportSection } from "@/components/home/CrisisSupportSection";
import { FAQSection } from "@/components/home/FAQSection";
import { PartnersCTASection } from "@/components/home/PartnersCTASection";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <HowItWorksSection />
      <FeaturedTopicsSection />
      <WhyCalmiSection />
      <PartnersCTASection />
      <CrisisSupportSection />
      <FAQSection />
    </main>
  );
}
