"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  MoreVertical,
  Flag,
  CalendarX,
  Lock,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { format, isBefore, isAfter, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMemo } from "react";

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onMarkHoliday: () => void;
  onCreateEvent: () => void;
  onLockAttendance: () => void;
  sessionStartDate?: Date;
  sessionEndDate?: Date;
  isLoading?: boolean;
}

export function CalendarHeader({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  onMarkHoliday,
  onCreateEvent,
  onLockAttendance,
  sessionStartDate,
  sessionEndDate,
  isLoading = false,
}: CalendarHeaderProps) {
  // Check if navigation to previous/next month is within session bounds
  const canGoToPrevMonth = useMemo(() => {
    if (!sessionStartDate) return true;
    const prevMonthDate = new Date(currentDate);
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
    const prevMonthStart = startOfMonth(prevMonthDate);
    const prevMonthEnd = endOfMonth(prevMonthDate);

    // Can go to previous month if it overlaps with session
    return (
      isBefore(prevMonthEnd, sessionStartDate) === false &&
      isAfter(prevMonthStart, sessionEndDate || new Date()) === false
    );
  }, [currentDate, sessionStartDate, sessionEndDate]);

  const canGoToNextMonth = useMemo(() => {
    if (!sessionEndDate) return true;
    const nextMonthDate = new Date(currentDate);
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
    const nextMonthStart = startOfMonth(nextMonthDate);
    const nextMonthEnd = endOfMonth(nextMonthDate);

    // Can go to next month if it overlaps with session
    return (
      isBefore(nextMonthEnd, sessionStartDate || new Date()) === false &&
      isAfter(nextMonthStart, sessionEndDate) === false
    );
  }, [currentDate, sessionStartDate, sessionEndDate]);

  // Check if current month is within session bounds
  const isCurrentMonthInSession = useMemo(() => {
    if (!sessionStartDate || !sessionEndDate) return true;
    const currentMonthStart = startOfMonth(currentDate);
    const currentMonthEnd = endOfMonth(currentDate);

    return (
      isBefore(currentMonthEnd, sessionStartDate) === false &&
      isAfter(currentMonthStart, sessionEndDate) === false
    );
  }, [currentDate, sessionStartDate, sessionEndDate]);

  // Get tooltip message for disabled buttons
  const getDisabledMessage = (direction: "prev" | "next") => {
    if (!sessionStartDate || !sessionEndDate) return "";

    if (direction === "prev") {
      return `Session starts on ${format(sessionStartDate, "MMM d, yyyy")}`;
    }
    return `Session ends on ${format(sessionEndDate, "MMM d, yyyy")}`;
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Main header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Month navigation - centered on mobile */}
          <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={!canGoToPrevMonth ? "cursor-not-allowed" : ""}
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={onPrevMonth}
                      disabled={isLoading || !canGoToPrevMonth}
                      className={cn(
                        "h-9 w-9 sm:h-10 sm:w-10",
                        !canGoToPrevMonth && "opacity-50 cursor-not-allowed",
                      )}
                      title={
                        !canGoToPrevMonth
                          ? getDisabledMessage("prev")
                          : "Previous month"
                      }
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </span>
                </TooltipTrigger>
                {!canGoToPrevMonth && (
                  <TooltipContent side="bottom">
                    <p className="text-xs flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {getDisabledMessage("prev")}
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
              <h2 className="text-xl sm:text-2xl font-bold text-primary">
                {format(currentDate, "MMMM yyyy")}
              </h2>

              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={!canGoToNextMonth ? "cursor-not-allowed" : ""}
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={onNextMonth}
                      disabled={isLoading || !canGoToNextMonth}
                      className={cn(
                        "h-9 w-9 sm:h-10 sm:w-10",
                        !canGoToNextMonth && "opacity-50 cursor-not-allowed",
                      )}
                      title={
                        !canGoToNextMonth
                          ? getDisabledMessage("next")
                          : "Next month"
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </span>
                </TooltipTrigger>
                {!canGoToNextMonth && (
                  <TooltipContent side="bottom">
                    <p className="text-xs flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {getDisabledMessage("next")}
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onToday}
              disabled={isLoading}
              className="h-9 sm:h-10 px-4"
              title="Go to today"
            >
              <Calendar className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Today</span>
            </Button>
          </div>

          {/* Session info indicator (optional) */}
          {sessionStartDate && sessionEndDate && !isCurrentMonthInSession && (
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-md border border-amber-200 dark:border-amber-800">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>
                Current month is outside session range (
                {format(sessionStartDate, "MMM d")} -{" "}
                {format(sessionEndDate, "MMM d, yyyy")})
              </span>
            </div>
          )}

          {/* Action buttons - hidden on mobile, shown in dropdown */}
          <div className="hidden sm:flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkHoliday}
              disabled={isLoading || !isCurrentMonthInSession}
              className={cn(
                "h-10 px-4 gap-2 border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30",
                !isCurrentMonthInSession && "opacity-50 cursor-not-allowed",
              )}
              title={
                !isCurrentMonthInSession
                  ? "Cannot modify dates outside session"
                  : "Mark holiday"
              }
            >
              <Flag className="h-4 w-4 text-red-500" />
              <span>Holiday</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateEvent}
              disabled={isLoading || !isCurrentMonthInSession}
              className={cn(
                "h-10 px-4 gap-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/30",
                !isCurrentMonthInSession && "opacity-50 cursor-not-allowed",
              )}
              title={
                !isCurrentMonthInSession
                  ? "Cannot modify dates outside session"
                  : "Create event"
              }
            >
              <CalendarX className="h-4 w-4 text-blue-500" />
              <span>Event</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onLockAttendance}
              disabled={isLoading || !isCurrentMonthInSession}
              className={cn(
                "h-10 px-4 gap-2 border-amber-200 hover:border-amber-300 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-950/30",
                !isCurrentMonthInSession && "opacity-50 cursor-not-allowed",
              )}
              title={
                !isCurrentMonthInSession
                  ? "Cannot modify dates outside session"
                  : "Lock attendance"
              }
            >
              <Lock className="h-4 w-4 text-amber-500" />
              <span>Lock</span>
            </Button>
          </div>

          {/* Mobile actions dropdown */}
          <div className="sm:hidden flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="default"
                  size="default"
                  className="w-full gap-2"
                  disabled={!isCurrentMonthInSession}
                >
                  <MoreVertical className="h-4 w-4" />
                  Actions
                  <ChevronDown className="h-4 w-4 ml-auto" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={onMarkHoliday}
                  className="gap-3 py-2"
                  disabled={!isCurrentMonthInSession}
                >
                  <div className="p-1 rounded-md bg-red-100 dark:bg-red-900/30">
                    <Flag className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Mark Holiday</span>
                    <span className="text-xs text-muted-foreground">
                      Set a holiday for selected dates
                    </span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onCreateEvent}
                  className="gap-3 py-2"
                  disabled={!isCurrentMonthInSession}
                >
                  <div className="p-1 rounded-md bg-blue-100 dark:bg-blue-900/30">
                    <CalendarX className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Create Event</span>
                    <span className="text-xs text-muted-foreground">
                      Add an event to the calendar
                    </span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onLockAttendance}
                  className="gap-3 py-2"
                  disabled={!isCurrentMonthInSession}
                >
                  <div className="p-1 rounded-md bg-amber-100 dark:bg-amber-900/30">
                    <Lock className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Lock Attendance</span>
                    <span className="text-xs text-muted-foreground">
                      Prevent attendance modifications
                    </span>
                  </div>
                </DropdownMenuItem>

                {/* Show session info in dropdown if out of range */}
                {!isCurrentMonthInSession &&
                  sessionStartDate &&
                  sessionEndDate && (
                    <>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-3 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 rounded-md mx-1">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span>
                            Current month is outside session range (
                            {format(sessionStartDate, "MMM d")} -{" "}
                            {format(sessionEndDate, "MMM d, yyyy")})
                          </span>
                        </div>
                      </div>
                    </>
                  )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Session info for desktop (if out of range) */}
        {sessionStartDate && sessionEndDate && !isCurrentMonthInSession && (
          <div className="hidden sm:flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-md border border-amber-200 dark:border-amber-800">
            <AlertCircle className="h-4 w-4" />
            <span>
              <span className="font-medium">Outside Session Range:</span> This
              month is outside the active session (
              {format(sessionStartDate, "MMM d, yyyy")} -{" "}
              {format(sessionEndDate, "MMM d, yyyy")}). Modifications are
              disabled.
            </span>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
