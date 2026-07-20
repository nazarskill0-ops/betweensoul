"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SERVICES } from "../schema";

export function ServiceGate() {
  const searchParams = useSearchParams();

  function hrefFor(service: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("service", service);
    return `/catalog?${params.toString()}`;
  }

  return (
    <div className="flex flex-col items-center gap-8 py-16 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl tracking-tight">
          З чим вам допомогти?
        </h1>
        <p className="text-ink-muted">
          Оберіть формат — покажемо психологів, які з ним працюють
        </p>
      </div>

      <div className="grid w-full max-w-xl gap-4 sm:grid-cols-2">
        {SERVICES.map((service) => (
          <Link
            key={service}
            href={hrefFor(service)}
            className="rounded-card border-[1.5px] border-sand-dark bg-white px-6 py-8 font-semibold text-ink transition-colors hover:border-sage hover:text-sage"
          >
            {service}
          </Link>
        ))}
      </div>
    </div>
  );
}
