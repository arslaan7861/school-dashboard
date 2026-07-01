"use client";

import { useEffect, useMemo, useState } from "react";

import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isToday,
  isBefore,
  isAfter,
  addMonths,
  subMonths,
} from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Lock,
  Flag,
  CalendarX,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { useCalendarMonth } from "@/features/calendar/hooks.calendar";
import { CalendarDay } from "@/features/calendar/types.calendar";

import { useAuthStore } from "@/store/authStore";

import { useSessions } from "@/features/session/hooks.session";
import { Session } from "@/features/session/types.session";

interface AcademicDaySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (academicDayId: number, date: Date) => void;

  selectedDate?: Date;

  dayId: number | null;
}

const weekDays = [
  { key: "sun", label: "Sunday", short: "S" },
  { key: "mon", label: "Monday", short: "M" },
  { key: "tue", label: "Tuesday", short: "T" },
  { key: "wed", label: "Wednesday", short: "W" },
  { key: "thu", label: "Thursday", short: "T" },
  { key: "fri", label: "Friday", short: "F" },
  { key: "sat", label: "Saturday", short: "S" },
];

export function AcademicDaySelector({
  isOpen,
  onClose,
  onSelect,
  selectedDate,
  dayId,
}: AcademicDaySelectorProps) {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());

  const [selectedDayId, setSelectedDayId] = useState<number | null>(null);

  const sessionId = useAuthStore((s) => s.activeSessionId);

  const { data } = useSessions();

  const sessions: Session[] = data?.data ?? [];

  const activeSession = useMemo(
    () =>
      sessions.find((s) => s.id === sessionId) ||
      sessions.find((s) => s.isActive) ||
      sessions[0] ||
      null,
    [sessionId, sessions],
  );

  const { sessionStartDate, sessionEndDate } = useMemo(() => {
    return {
      sessionStartDate: activeSession?.startDate
        ? new Date(activeSession.startDate)
        : undefined,

      sessionEndDate: activeSession?.endDate
        ? new Date(activeSession.endDate)
        : undefined,
    };
  }, [activeSession]);

  /* ----------------------------------------------------------
   * Reset Current Month
   * -------------------------------------------------------- */

  useEffect(() => {
    if (!isOpen) return;

    setCurrentDate(selectedDate || new Date());
  }, [isOpen, selectedDate]);

  /* ----------------------------------------------------------
   * Calendar Data
   * -------------------------------------------------------- */

  const year = format(currentDate, "yyyy");

  const month = format(currentDate, "MM");

  const { data: monthData = [], isLoading } = useCalendarMonth({
    year,
    month,
    sessionId: sessionId as number,
  });

  const dayMap = useMemo(() => {
    return new Map(monthData.map((day: CalendarDay) => [day.date, day]));
  }, [monthData]);

  /* ----------------------------------------------------------
   * Auto Select Today
   * -------------------------------------------------------- */

  useEffect(() => {
    if (dayId) return;
    const dateStr = format(new Date(), "yyyy-MM-dd");
    const today = dayMap.get(dateStr);
    if (!today) return;
    onSelect(today.id, new Date(today.date));
  }, [dayMap]);

  /* ----------------------------------------------------------
   * Navigation Bounds
   * -------------------------------------------------------- */

  const canGoToPrevMonth = useMemo(() => {
    if (!sessionStartDate) return true;

    const prevMonth = subMonths(currentDate, 1);

    return isBefore(endOfMonth(prevMonth), sessionStartDate) === false;
  }, [currentDate, sessionStartDate]);

  const canGoToNextMonth = useMemo(() => {
    if (!sessionEndDate) return true;

    const nextMonth = addMonths(currentDate, 1);

    return isAfter(startOfMonth(nextMonth), sessionEndDate) === false;
  }, [currentDate, sessionEndDate]);

  /* ----------------------------------------------------------
   * Calendar Grid
   * -------------------------------------------------------- */

  const monthStart = startOfMonth(currentDate);

  const monthEnd = endOfMonth(currentDate);

  const monthDays = eachDayOfInterval({
    start: monthStart,
    end: monthEnd,
  });

  const startDay = getDay(monthStart);

  const paddingDays = Array(startDay).fill(null);

  const totalDays = paddingDays.length + monthDays.length;

  const rowsNeeded = Math.ceil(totalDays / 7);

  const totalCells = rowsNeeded * 7;

  const endPaddingDays = Array(totalCells - totalDays).fill(null);

  /* ----------------------------------------------------------
   * Actions
   * -------------------------------------------------------- */

  const handleDaySelect = (day: CalendarDay) => {
    setSelectedDayId(day.id);

    onSelect(day.id, new Date(day.date));

    onClose();
  };

  /* ----------------------------------------------------------
   * UI
   * -------------------------------------------------------- */

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "overflow-hidden p-0 border-0 sm:border",

          "w-screen h-[100dvh] max-w-none rounded-none",

          "sm:h-auto sm:max-w-6xl sm:rounded-2xl",
        )}
      >
        {/* Header */}
        <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
          <DialogHeader className="px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex flex-col gap-4">
              <div>
                <DialogTitle className="text-lg sm:text-xl font-semibold">
                  Academic Day Selector
                </DialogTitle>

                <DialogDescription className="mt-1 text-xs sm:text-sm">
                  Select an operational academic day for attendance, exams, and
                  scheduling workflows.
                </DialogDescription>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="gap-1 h-7">
                  <Flag className="h-3 w-3 text-red-500" />
                  Holiday
                </Badge>

                <Badge variant="outline" className="gap-1 h-7">
                  <CalendarX className="h-3 w-3 text-blue-500" />
                  Event
                </Badge>

                <Badge variant="outline" className="gap-1 h-7">
                  <Lock className="h-3 w-3 text-amber-500" />
                  Locked
                </Badge>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Toolbar */}
        <div className="sticky top-[108px] sm:top-[116px] z-20 border-b bg-background/95 backdrop-blur px-4 sm:px-6 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Navigation */}
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={!canGoToPrevMonth}
                onClick={() => setCurrentDate((prev) => subMonths(prev, 1))}
                className={cn(
                  "h-9 w-9 sm:h-10 sm:w-10",
                  !canGoToPrevMonth && "opacity-50 cursor-not-allowed",
                )}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="min-w-[180px] sm:min-w-[220px] text-center">
                <h2 className="text-base sm:text-xl font-semibold tracking-tight">
                  {format(currentDate, "MMMM yyyy")}
                </h2>

                {sessionStartDate && sessionEndDate && (
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                    {format(sessionStartDate, "MMM d")} -{" "}
                    {format(sessionEndDate, "MMM d, yyyy")}
                  </p>
                )}
              </div>

              <Button
                variant="outline"
                size="icon"
                disabled={!canGoToNextMonth}
                onClick={() => setCurrentDate((prev) => addMonths(prev, 1))}
                className={cn(
                  "h-9 w-9 sm:h-10 sm:w-10",
                  !canGoToNextMonth && "opacity-50 cursor-not-allowed",
                )}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Today */}
            <Button
              variant="outline"
              onClick={() => setCurrentDate(new Date())}
              className="gap-2 w-full sm:w-auto"
            >
              <CalendarIcon className="h-4 w-4" />
              Today
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-6">
          {/* Week Headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-3">
            {weekDays.map((day) => (
              <div
                key={day.key}
                className="h-8 sm:h-10 flex items-center justify-center rounded-md bg-muted/40"
              >
                <span className="hidden sm:inline text-sm font-medium text-muted-foreground">
                  {day.label}
                </span>

                <span className="sm:hidden text-xs font-medium text-muted-foreground">
                  {day.short}
                </span>
              </div>
            ))}
          </div>

          {/* Loading */}
          {isLoading ? (
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {Array.from({
                length: 35,
              }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-[76px] sm:h-[120px] rounded-xl"
                />
              ))}
            </div>
          ) : (
            <div
              className="grid grid-cols-7 gap-1 sm:gap-2 auto-rows-fr"
              style={{
                gridTemplateRows: `repeat(${rowsNeeded}, minmax(76px, auto))`,
              }}
            >
              {/* Start Padding */}
              {paddingDays.map((_, index) => (
                <div
                  key={`start-${index}`}
                  className="rounded-xl border border-dashed border-border/50 bg-muted/10"
                />
              ))}

              {/* Days */}
              {monthDays.map((date) => {
                const dateStr = format(date, "yyyy-MM-dd");

                const day = dayMap.get(dateStr);

                const currentDay = isToday(date);

                if (!day) {
                  return (
                    <div
                      key={dateStr}
                      className={cn(
                        "rounded-xl border border-dashed border-border/50 bg-muted/10 flex items-center justify-center",
                        currentDay && "ring-2 ring-primary/20",
                      )}
                    >
                      <span className="text-lg sm:text-2xl font-light text-muted-foreground/40">
                        {format(date, "d")}
                      </span>
                    </div>
                  );
                }

                const isSelected = selectedDayId === day.id;

                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => handleDaySelect(day)}
                    className={cn(
                      "group relative rounded-xl border text-left transition-all duration-200",
                      "p-1.5 sm:p-3",
                      "hover:shadow-lg hover:-translate-y-0.5",
                      "active:scale-[0.98]",
                      "focus:outline-none focus:ring-2 focus:ring-primary",

                      "bg-card border-border",

                      currentDay && "ring-2 ring-primary/30",

                      isSelected &&
                        "border-primary ring-2 ring-primary shadow-md",

                      day.isHoliday &&
                        "border-red-200 bg-red-50/70 dark:border-red-900 dark:bg-red-950/20",

                      day.event &&
                        !day.isHoliday &&
                        "border-blue-200 bg-blue-50/70 dark:border-blue-900 dark:bg-blue-950/20",

                      day.isAttendanceLocked &&
                        !day.isHoliday &&
                        !day.event &&
                        "border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/20",
                    )}
                  >
                    {/* Accent */}
                    <div
                      className={cn(
                        "absolute inset-x-0 hidden md:block top-0 h-1 rounded-t-xl",

                        day.isHoliday && "bg-red-500",

                        day.event && !day.isHoliday && "bg-blue-500",

                        day.isAttendanceLocked &&
                          !day.isHoliday &&
                          !day.event &&
                          "bg-amber-500",

                        !day.isHoliday &&
                          !day.event &&
                          !day.isAttendanceLocked &&
                          "bg-primary/20",
                      )}
                    />

                    {/* Header */}
                    <div className="flex items-start justify-center sm:justify-between">
                      <div>
                        <p
                          className={cn(
                            "text-sm sm:text-lg font-semibold",
                            currentDay && "text-primary",
                          )}
                        >
                          {format(date, "d")}
                        </p>

                        <p className="hidden sm:block text-xs text-muted-foreground">
                          {format(date, "EEE")}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        {day.isAttendanceLocked && (
                          <Lock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-500" />
                        )}

                        {isSelected && (
                          <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mt-1 sm:mt-4 space-y-1">
                      {day.isHoliday && (
                        <Badge
                          variant="secondary"
                          className="w-full justify-start gap-1 h-5 sm:h-6 px-1.5 sm:px-2 bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300"
                        >
                          <Flag className="h-3 w-3" />

                          <span className="truncate hidden sm:inline">
                            {day.holidayTitle || "Holiday"}
                          </span>

                          <span className="sm:hidden">H</span>
                        </Badge>
                      )}

                      {!!day.event && !day.isHoliday && (
                        <Badge
                          variant="secondary"
                          className="w-full justify-start gap-1 h-5 sm:h-6 px-1.5 sm:px-2 bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300"
                        >
                          <CalendarX className="h-3 w-3" />

                          <span className="truncate hidden sm:inline">
                            {day.event}
                          </span>

                          <span className="sm:hidden">Event</span>
                        </Badge>
                      )}

                      {day.isAttendanceLocked && (
                        <Badge
                          variant="secondary"
                          className="w-full justify-start gap-1 h-5 sm:h-6 px-1.5 sm:px-2 bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300"
                        >
                          <Lock className="h-3 w-3" />

                          <span className="hidden sm:inline">
                            Attendance Locked
                          </span>

                          <span className="sm:hidden">Locked</span>
                        </Badge>
                      )}

                      {!day.isHoliday &&
                        !day.event &&
                        !day.isAttendanceLocked && (
                          <div className="hidden sm:block text-xs text-muted-foreground">
                            Operational day
                          </div>
                        )}
                    </div>
                  </button>
                );
              })}

              {/* End Padding */}
              {endPaddingDays.map((_, index) => (
                <div
                  key={`end-${index}`}
                  className="rounded-xl border border-dashed border-border/50 bg-muted/10"
                />
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="sticky bottom-0 mt-4 sm:mt-6 border-t bg-background px-2 sm:px-0 pt-3 sm:pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] sm:text-xs text-muted-foreground">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />

                <span>Only academic operational days can be selected.</span>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline">{monthDays.length} days</Badge>

                <Badge variant="outline">{rowsNeeded} weeks</Badge>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
