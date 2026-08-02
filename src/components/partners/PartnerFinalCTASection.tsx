import { CtaBanner } from "@/components/marketing/CtaBanner";

export function PartnerFinalCTASection() {
  return (
    <CtaBanner
      title="Готові приєднатися?"
      text="Заповніть анкету — це займає близько 15 хвилин і ні до чого не зобов'язує."
      ctaLabel="Приєднатися"
      ctaHref="/for-psychologists/apply"
      className="pb-24 md:pb-[120px]"
    />
  );
}
