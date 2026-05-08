"use client";

import { CalendarDayCell } from "./CalendarDayCell";
import { CalendarDay } from "@/features/calendar/types.calendar";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isToday,
} from "date-fns";
import { cn } from "@/lib/utils";

interface CalendarGridProps {
  currentDate: Date;
  days: CalendarDay[];
  onDayClick: (day: CalendarDay) => void;
  onMarkHoliday?: (day: CalendarDay) => void;
  onCreateEvent?: (day: CalendarDay) => void;
  onLockAttendance?: (day: CalendarDay) => void;
  onViewDetails?: (day: CalendarDay) => void;
  isLoading?: boolean;
}

const weekDays = [
  { key: "sun", label: "S", full: "Sunday" },
  { key: "mon", label: "M", full: "Monday" },
  { key: "tue", label: "T", full: "Tuesday" },
  { key: "wed", label: "W", full: "Wednesday" },
  { key: "thu", label: "T", full: "Thursday" },
  { key: "fri", label: "F", full: "Friday" },
  { key: "sat", label: "S", full: "Saturday" },
];

export function CalendarGrid({
  currentDate,
  days = [],
  onDayClick,
  onMarkHoliday,
  onCreateEvent,
  onLockAttendance,
  onViewDetails,
  isLoading = false,
}: CalendarGridProps) {
  const safeDays = Array.isArray(days) ? days : [];
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);
  const paddingDays = Array(startDay).fill(null);

  // Calculate total cells needed
  const totalDays = paddingDays.length + monthDays.length;

  // Calculate how many rows we need (minimum 5, maximum 6)
  const rowsNeeded = Math.ceil(totalDays / 7);
  const totalCells = rowsNeeded * 7;

  // Calculate padding days at the end
  const endPaddingDays = Array(totalCells - totalDays).fill(null);

  const dayMap = new Map(safeDays.map((day) => [day.date, day]));

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div key={day.key} className="text-center py-2">
              <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
                {day.full}
              </span>
              <span className="text-xs font-medium text-muted-foreground sm:hidden">
                {day.label}
              </span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div
              key={i}
              className="min-h-[120px] sm:min-h-[140px] bg-muted/20 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div key={day.key} className="text-center py-2" title={day.full}>
            <span className="text-xs sm:text-sm font-medium text-muted-foreground hidden sm:inline">
              {day.full}
            </span>
            <span className="text-xs font-medium text-muted-foreground sm:hidden">
              {day.label}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar grid with dynamic rows */}
      <div
        className="grid grid-cols-7 gap-1 sm:gap-2 auto-rows-fr"
        style={{
          gridTemplateRows: `repeat(${rowsNeeded}, minmax(100px, auto))`,
        }}
      >
        {/* Padding days (previous month) */}
        {paddingDays.map((_, index) => (
          <div
            key={`padding-start-${index}`}
            className="min-h-[100px] sm:min-h-[140px] bg-muted/5 rounded-lg border border-dashed border-border/50"
          />
        ))}

        {/* Actual days */}
        {monthDays.map((date) => {
          const dateStr = format(date, "yyyy-MM-dd");
          const dayData = dayMap.get(dateStr);
          const isCurrentDay = isToday(date);

          if (!dayData) {
            return (
              <div
                key={dateStr}
                className={cn(
                  "min-h-[100px] sm:min-h-[140px] bg-muted/10 rounded-lg border border-dashed border-border/50 flex items-center justify-center",
                  isCurrentDay && "ring-2 ring-primary/20",
                )}
              >
                <span className="text-2xl font-light text-muted-foreground/30">
                  {format(date, "d")}
                </span>
              </div>
            );
          }

          return (
            <CalendarDayCell
              key={dateStr}
              day={dayData}
              onClick={() => onDayClick(dayData)}
              onMarkHoliday={() => onMarkHoliday?.(dayData)}
              onCreateEvent={() => onCreateEvent?.(dayData)}
              onLockAttendance={() => onLockAttendance?.(dayData)}
              onViewDetails={() => onViewDetails?.(dayData)}
              isCurrentDay={isCurrentDay}
            />
          );
        })}

        {/* Padding days (next month) - only shown if needed */}
        {endPaddingDays.map((_, index) => (
          <div
            key={`padding-end-${index}`}
            className="min-h-[100px] sm:min-h-[140px] bg-muted/5 rounded-lg border border-dashed border-border/50"
          />
        ))}
      </div>

      {/* Optional: Show month info */}
      <div className="text-xs text-muted-foreground text-right mt-1">
        {monthDays.length} days • {rowsNeeded} week{rowsNeeded !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
