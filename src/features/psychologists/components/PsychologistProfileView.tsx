"use client";

import { notFound } from "next/navigation";
import { usePsychologist } from "../hooks/usePsychologist";
import { useUser } from "@/features/auth/hooks/useUser";
import type { PsychologistProfile } from "../schema";
import { PsychologistProfileContent } from "./PsychologistProfileContent";
import { getFirstName } from "../utils/formatters";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

/**
 * `previewData` дозволяє відрендерити цю саму публічну верстку з "чернетковими"
 * (ще не збереженими) даними — використовується кабінетом психолога для
 * прев'ю "як побачать клієнти". Коли передано previewData, id не потрібен і
 * реальний фетч не відбувається.
 *
 * Сама верстка профілю живе в PsychologistProfileContent — її ділять сторінка
 * /psychologist/[id] і результат підбору (/pidbir).
 */
export function PsychologistProfileView({
  id,
  previewData,
}: {
  id?: string;
  previewData?: PsychologistProfile;
}) {
  const { data: fetchedData, isLoading } = usePsychologist(id ?? "", {
    enabled: !previewData && !!id,
  });
  const data = previewData ?? fetchedData;
  const { data: user, isLoading: isUserLoading } = useUser();

  if (!previewData && (isLoading || isUserLoading)) {
    return (
      <div className="h-96 animate-pulse rounded-card border-[1.5px] border-sand-dark bg-sand" />
    );
  }

  if (!data) {
    notFound();
  }

  // Неопубліковані профілі бачить лише сам психолог (кабінет — через
  // previewData, сюди взагалі не заходить) та адмін (перегляд перед
  // публікацією з /admin/psychologists). Для решти — як і не існує.
  if (!previewData && data.status !== "approved" && user?.role !== "admin") {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumbs
        items={[
          { label: "Calmi", href: "/" },
          { label: "Каталог", href: "/catalog" },
          { label: getFirstName(data.fullName) },
        ]}
      />

      <PsychologistProfileContent psychologist={data} />
    </div>
  );
}
