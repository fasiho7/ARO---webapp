import type { CalendarDay, WeeklyHours } from "./types";

const INTENSITY_GRID = [
  [0, 1, 0, 2, 1, 0, 0],
  [1, 0, 1, 2, 2, 1, 0],
  [0, 2, 1, 3, 2, 1, 0],
  [1, 2, 2, 3, 2, 0, 1],
  [2, 3, 2, 3, 4, 2, 1],
  [1, 2, 3, 3, 2, 2, 0],
  [2, 3, 4, 3, 3, 2, 1],
  [3, 4, 3, 4, 3, 2, 1],
  [2, 3, 3, 4, 2, 1, 0],
  [1, 2, 3, 3, 4, 3, 2],
  [2, 3, 4, 4, 3, 2, 1],
  [3, 3, 4, 3, 4, 3, 2],
  [2, 4, 3, 4, 3, 2, 1],
  [3, 4, 4, 3, 4, 3, 2],
  [2, 3, 4, 4, 3, 2, 0],
  [1, 2, 3, 3, 2, 1, 0],
  [2, 3, 3, 4, 3, 2, 1],
  [3, 4, 3, 4, 4, 3, 2],
  [3, 4, 4, 3, 4, 3, 2],
  [4, 4, 3, 4, 4, 3, 2],
] as const;

function isoDate(daysAgo: number): string {
  const date = new Date("2026-08-14T12:00:00");
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

export const calendarDays: CalendarDay[] = INTENSITY_GRID.flatMap((week, weekIndex) =>
  week.map((intensity, dayIndex) => {
    const weeksFromEnd = INTENSITY_GRID.length - 1 - weekIndex;
    const daysFromSunday = 6 - dayIndex;
    const daysAgo = weeksFromEnd * 7 + daysFromSunday;
    return {
      date: isoDate(daysAgo),
      intensity: intensity as CalendarDay["intensity"],
    };
  }),
);

export const weeklyHours: WeeklyHours[] = [
  { day: "Mon", hours: 1.4 },
  { day: "Tue", hours: 2.1 },
  { day: "Wed", hours: 0.8 },
  { day: "Thu", hours: 2.6 },
  { day: "Fri", hours: 1.9 },
  { day: "Sat", hours: 0.5 },
  { day: "Sun", hours: 1.2 },
];
