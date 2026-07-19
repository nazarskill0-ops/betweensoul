import { Suspense } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { CatalogView } from "@/features/psychologists/components/CatalogView";

export default function CatalogPage() {
  return (
    <div className="min-h-dvh">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-5 py-8">
        <Suspense fallback={null}>
          <CatalogView />
        </Suspense>
      </main>
    </div>
  );
}
