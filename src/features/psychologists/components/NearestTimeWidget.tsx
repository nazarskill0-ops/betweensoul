import { combineDateAndTime, type DayColumn } from "../utils/generateFakeSlots";
import { formatSlotRange } from "../utils/formatSlotRange";

export function NearestTimeWidget({
  nearestDay,
  selectedTime,
  onSelectTime,
  durationMinutes,
}: {
  nearestDay: DayColumn | null;
  selectedTime: string | null;
  onSelectTime: (time: string | null) => void;
  durationMinutes: number;
}) {
  if (!nearestDay) return null;

  const freeSlots = nearestDay.slots.filter((s) => !s.isBooked).slice(0, 2);
  if (freeSlots.length === 0) return null;

  return (
    <div className="rounded-card bg-sage-light p-4">
      <span className="mb-3 block text-center text-xs font-medium uppercase tracking-wide text-ink-muted">
        Найближчий час
      </span>
      <span className="mb-4 block text-center font-display text-2xl font-bold text-ink">
        {nearestDay.date.toLocaleDateString("uk-UA", {
          day: "numeric",
          month: "long",
        })}
      </span>
      <div className="flex flex-wrap gap-2">
        {freeSlots.map((slot) => {
          const isSelected = selectedTime === slot.time;
          return (
            <button
              key={slot.time}
              type="button"
              onClick={() => onSelectTime(isSelected ? null : slot.time)}
              className={`rounded-full border-[1.5px] border-sage px-6 py-4 text-base font-medium transition-colors ${
                isSelected
                  ? "bg-sage text-white"
                  : "bg-white text-ink hover:bg-sage hover:text-white"
              }`}
            >
              {formatSlotRange(combineDateAndTime(nearestDay.date, slot.time), durationMinutes)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
