import { Suspense } from "react";
import { SessionsView } from "@/features/dashboard/components/SessionsView";

export default function DashboardSessionsPage() {
  return (
    <Suspense fallback={null}>
      <SessionsView />
    </Suspense>
  );
}
