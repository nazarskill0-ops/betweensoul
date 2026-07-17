import { combineDateAndTime, type DayColumn } from "../utils/generateFakeSlots";
import { formatRelativeDate, isToday } from "../utils/formatRelativeDate";
import { formatSlotRange } from "../utils/formatSlotRange";
import { CalendarIcon } from "./icons";

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

  const isSingleSlotToday = isToday(nearestDay.date) && freeSlots.length === 1;

  const scrollToBooking = () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-4 rounded-card border border-sand-dark p-4">
      <div className="flex flex-col gap-1">
        <span className="block text-center text-sm text-ink-muted">Найближчий час</span>
        <span className="block text-center font-sans text-xl font-bold text-ink">
          {formatRelativeDate(nearestDay.date)}
        </span>
      </div>

      <div className={isSingleSlotToday ? "flex justify-center" : "flex flex-wrap justify-center gap-2"}>
        {freeSlots.map((slot) => {
          const isSelected = selectedTime === slot.time;
          return (
            <button
              key={slot.time}
              type="button"
              onClick={() => onSelectTime(isSelected ? null : slot.time)}
              className={`rounded-full border-[1.5px] px-6 py-4 text-base font-medium transition-colors ${
                isSelected
                  ? "border-sage bg-sage text-white"
                  : "border-sand-dark bg-white text-ink hover:border-sage"
              }`}
            >
              {formatSlotRange(combineDateAndTime(nearestDay.date, slot.time), durationMinutes)}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={scrollToBooking}
        className="flex items-center justify-center gap-1.5 text-sm font-medium text-sage transition-colors hover:text-sage/80"
      >
        Усі доступні дати
        <CalendarIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
