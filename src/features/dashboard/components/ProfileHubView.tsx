"use client";

import Link from "next/link";
import { useCurrentClientUser } from "../hooks/useCurrentClientUser";
import { ArrowRightIcon } from "./icons";
import { NextSessionSection } from "./NextSessionSection";
import { RebookSection } from "./RebookSection";

export function ProfileHubView() {
  const { data: user } = useCurrentClientUser();
  const firstName = user?.fullName.split(" ")[0];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl text-ink">
        Привіт{firstName ? `, ${firstName}` : ""}!
      </h1>

      <div className="flex flex-col items-start gap-4 rounded-card bg-sage-light p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="font-display text-xl text-ink">З чого хочете почати?</p>
          <p className="text-sm text-ink-muted">
            Підберемо психолога під ваш запит або перегляньте каталог самостійно.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <Link
            href="/pidbir"
            className="flex items-center gap-1.5 rounded-full bg-sage px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sage/90"
          >
            Підібрати спеціаліста
            <ArrowRightIcon className="h-4 w-4 shrink-0" />
          </Link>
          <Link
            href="/catalog"
            className="flex items-center gap-1.5 rounded-full border-[1.5px] border-sage px-6 py-2.5 text-sm font-medium text-sage transition-colors hover:bg-sage-light"
          >
            Переглянути каталог
          </Link>
        </div>
      </div>

      <NextSessionSection />
      <RebookSection />
    </div>
  );
}
