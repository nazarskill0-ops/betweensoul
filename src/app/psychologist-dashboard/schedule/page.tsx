import { Suspense } from "react";
import { ScheduleView } from "@/features/psychologist-dashboard/components/ScheduleView";

export default function PsychologistSchedulePage() {
  return (
    <Suspense fallback={null}>
      <ScheduleView />
    </Suspense>
  );
}
