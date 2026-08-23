import type { CalendarDay } from "@/data/mock/types";
import { cn } from "@/lib/cn";

const levels = [
  "bg-white/8 [data-theme=light]:bg-black/8",
  "bg-teal/25",
  "bg-teal/45",
  "bg-teal/70",
  "bg-teal",
] as const;

export function ActivityCalendar({ days }: { days: CalendarDay[] }) {
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex gap-1">
        <div className="mr-1 flex flex-col justify-between py-1 text-[10px] text-muted">
          <span>Mon</span>
          <span>Wed</span>
          <span>Fri</span>
          <span>Sun</span>
        </div>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date} · level ${day.intensity}`}
                className={cn(
                  "size-3 rounded-[3px] sm:size-3.5",
                  levels[day.intensity] ?? levels[0],
                )}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted">
        <span>Less</span>
        {levels.map((level) => (
          <span key={level} className={cn("size-3 rounded-[3px]", level)} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
