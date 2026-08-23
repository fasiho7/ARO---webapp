import type { WeeklyHours } from "@/data/mock/types";

export function WeeklyChart({ data }: { data: WeeklyHours[] }) {
  const max = Math.max(...data.map((item) => item.hours), 1);

  return (
    <div className="flex h-40 items-end gap-2 sm:gap-3">
      {data.map((item) => (
        <div key={item.day} className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <div className="flex h-28 w-full items-end rounded-lg bg-white/5 [data-theme=light]:bg-black/5">
            <div
              className="w-full rounded-lg grad-bg"
              style={{ height: `${(item.hours / max) * 100}%` }}
            />
          </div>
          <span className="text-[11px] text-muted">{item.day}</span>
        </div>
      ))}
    </div>
  );
}
