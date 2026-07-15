"use client";

import { notFound } from "next/navigation";
import { usePsychologist } from "../hooks/usePsychologist";
import { PsychologistProfileHeader } from "./PsychologistProfileHeader";

export function PsychologistProfileView({ id }: { id: string }) {
  const { data, isLoading } = usePsychologist(id);

  if (isLoading) {
    return (
      <div className="h-96 animate-pulse rounded-card border-[1.5px] border-sand-dark bg-sand" />
    );
  }

  if (!data) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <PsychologistProfileHeader psychologist={data} />
    </div>
  );
}
