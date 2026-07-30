import { Suspense } from "react";
import { AdminPsychologistsView } from "@/features/admin/components/AdminPsychologistsView";

export default function AdminPsychologistsPage() {
  return (
    <Suspense fallback={null}>
      <AdminPsychologistsView />
    </Suspense>
  );
}
