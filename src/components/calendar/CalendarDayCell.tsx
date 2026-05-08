"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { CalendarDay } from "@/features/calendar/types.calendar";
import { format } from "date-fns";
import {
  Lock,
  Flag,
  CalendarX,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Sun,
  Cloud,
  Sparkles,
  Star,
  Eye,
  Trash2,
  Ban,
} from "lucide-react";

interface CalendarDayCellProps {
  day: CalendarDay;
  onClick: () => void;
  onMarkHoliday?: () => void;
  onRemoveHoliday?: () => void;
  onCreateEvent?: () => void;
  onRemoveEvent?: () => void;
  onLockAttendance?: () => void;
  onUnlockAttendance?: () => void;
  onViewDetails?: () => void;
  isCurrentDay?: boolean;
}

export function CalendarDayCell({
  day,
  onClick,
  onMarkHoliday,
  onRemoveHoliday,
  onCreateEvent,
  onRemoveEvent,
  onLockAttendance,
  onUnlockAttendance,
  onViewDetails,
  isCurrentDay,
}: CalendarDayCellProps) {
  const date = new Date(day.date);
  const dayNumber = format(date, "d");
  const dayName = format(date, "EEE");
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  const totalClasses = parseInt(day.totalClasses);
  const attendanceRecords = parseInt(day.attendanceRecords);
  const present = parseInt(day.present);
  const absent = parseInt(day.absent);
  const leave = parseInt(day.leave);

  const attendancePercentage =
    totalClasses > 0 ? Math.round((attendanceRecords / totalClasses) * 100) : 0;

  // Determine card style based on day status
  const getCardStyles = () => {
    const baseStyles =
      "p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg border-2 min-h-[120px] sm:min-h-[160px] flex flex-col relative overflow-hidden group";

    if (isCurrentDay) {
      return cn(
        baseStyles,
        "ring-2 ring-primary ring-offset-2 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30",
      );
    }

    if (day.isHoliday) {
      return cn(
        baseStyles,
        "bg-gradient-to-br from-red-50 to-rose-50 border-red-200 hover:border-red-300 dark:from-red-950/40 dark:to-rose-950/40 dark:border-red-800/50",
      );
    }

    if (day.event) {
      return cn(
        baseStyles,
        "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300 dark:from-blue-950/40 dark:to-indigo-950/40 dark:border-blue-800/50",
      );
    }

    if (attendanceRecords === totalClasses && totalClasses > 0) {
      return cn(
        baseStyles,
        "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:border-green-300 dark:from-green-950/40 dark:to-emerald-950/40 dark:border-green-800/50",
      );
    }

    if (attendanceRecords > 0 && attendanceRecords < totalClasses) {
      return cn(
        baseStyles,
        "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 hover:border-yellow-300 dark:from-yellow-950/40 dark:to-amber-950/40 dark:border-yellow-800/50",
      );
    }

    // Default working day - more interesting than plain card
    if (isWeekend) {
      return cn(
        baseStyles,
        "bg-gradient-to-br from-purple-50/50 to-pink-50/50 border-purple-200/50 hover:border-purple-300 dark:from-purple-950/20 dark:to-pink-950/20 dark:border-purple-800/30",
      );
    }

    return cn(
      baseStyles,
      "bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200 hover:border-slate-300 dark:from-slate-900/40 dark:to-gray-900/40 dark:border-slate-800/50",
    );
  };

  // Collect all statuses
  const statuses = [];

  if (day.isHoliday) {
    statuses.push({
      icon: Flag,
      label: "Holiday",
      description: day.holidayDescription || "No work today",
      color: "text-red-500",
      bgColor:
        "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300",
      tooltip: day.holidayTitle || "Holiday",
    });
  }

  if (day.event) {
    statuses.push({
      icon: CalendarX,
      label: "Event",
      description: day.eventDescription || "Special event scheduled",
      color: "text-blue-500",
      bgColor:
        "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300",
      tooltip: day.event || "Event",
    });
  }

  if (day.isAttendanceLocked) {
    statuses.push({
      icon: Lock,
      label: "Locked",
      description: "Attendance cannot be modified",
      color: "text-amber-500",
      bgColor:
        "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300",
      tooltip: "Attendance Locked",
    });
  }

  // Get day mood/weather based on status
  const getDayMood = () => {
    if (day.isHoliday)
      return { icon: Sparkles, text: "Relax!", color: "text-red-500" };
    if (day.event)
      return { icon: Star, text: "Special day", color: "text-blue-500" };
    if (attendancePercentage === 100)
      return { icon: CheckCircle2, text: "All done!", color: "text-green-500" };
    if (attendancePercentage > 50)
      return { icon: Sun, text: "Productive", color: "text-yellow-500" };
    if (attendancePercentage > 0)
      return { icon: Cloud, text: "In progress", color: "text-gray-500" };
    return { icon: Clock, text: "No data", color: "text-gray-400" };
  };

  const dayMood = getDayMood();
  const MoodIcon = dayMood.icon;

  // Handle action button clicks without triggering the card click
  const handleActionClick = (e: React.MouseEvent, action?: () => void) => {
    e.stopPropagation();
    if (action) action();
  };

  return (
    <TooltipProvider>
      <HoverCard openDelay={200} closeDelay={100}>
        <HoverCardTrigger asChild>
          <Card className={cn(getCardStyles())} onClick={onClick}>
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
              <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-current to-transparent rounded-full blur-2xl" />
            </div>

            {/* Date and status badges */}
            <div className="flex items-start justify-between mb-2 relative z-10">
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-bold tracking-tight">
                  {dayNumber}
                </span>
                {isCurrentDay && (
                  <Badge
                    variant="default"
                    className="h-5 px-1.5 text-[10px] font-medium bg-primary text-primary-foreground"
                  >
                    Today
                  </Badge>
                )}
              </div>

              {/* Status badges */}
              <div className="flex gap-1">
                {statuses.map((status, index) => (
                  <Tooltip key={status.label}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "h-6 w-6 sm:h-7 sm:w-7 rounded-full flex items-center justify-center border-2",
                          status.bgColor,
                          "border-white dark:border-gray-800 shadow-sm",
                        )}
                      >
                        <status.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <p className="font-medium">{status.label}</p>
                      {status.description && (
                        <p className="text-muted-foreground text-[10px]">
                          {status.description}
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* Titles section */}
            <div className="space-y-0.5 mb-2 min-h-8">
              {day.holidayTitle && (
                <p className="text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 line-clamp-1 flex items-center gap-1">
                  <Flag className="h-3 w-3 inline-flex shrink-0" />
                  <span className="truncate">{day.holidayTitle}</span>
                </p>
              )}
              {day.event && (
                <p className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 line-clamp-1 flex items-center gap-1">
                  <CalendarX className="h-3 w-3 inline-flex shrink-0" />
                  <span className="truncate">{day.event}</span>
                </p>
              )}
            </div>

            {/* Attendance section */}
            <div className="space-y-2 mt-auto relative z-10">
              {/* Progress bar with label */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] sm:text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Attendance
                  </span>
                  <span className="font-medium tabular-nums">
                    {attendanceRecords}/{totalClasses}
                  </span>
                </div>
                <Progress
                  value={attendancePercentage}
                  className={cn(
                    "h-1.5",
                    attendancePercentage === 100
                      ? "bg-green-200 dark:bg-green-900"
                      : "",
                  )}
                />
              </div>

              {/* Quick stats - hidden on mobile, shown on hover */}
              <div className="hidden sm:flex items-center justify-between text-[10px] text-muted-foreground group-hover:opacity-100 opacity-0 transition-opacity">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-0.5">
                    <CheckCircle2 className="h-2.5 w-2.5 text-green-500" />
                    {present}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <XCircle className="h-2.5 w-2.5 text-red-500" />
                    {absent}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5 text-yellow-500" />
                    {leave}
                  </span>
                </div>
                <MoodIcon className={cn("h-3 w-3", dayMood.color)} />
              </div>

              {/* Mobile summary */}
              <div className="sm:hidden flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">
                  {present} present, {absent} absent
                </span>
                <MoodIcon className={cn("h-3 w-3", dayMood.color)} />
              </div>
            </div>

            {/* Click hint */}
            <div className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Badge
                variant="secondary"
                className="h-4 text-[8px] bg-background/80 backdrop-blur-sm"
              >
                Click for details
              </Badge>
            </div>
          </Card>
        </HoverCardTrigger>

        {/* Hover Card with detailed info and action buttons */}
        <HoverCardContent
          side="right"
          align="start"
          className="w-80 p-0 overflow-hidden"
        >
          <div className="relative">
            {/* Header with gradient background */}
            <div
              className={cn(
                "p-4 text-white",
                day.isHoliday
                  ? "bg-linear-to-r from-red-500 to-rose-500"
                  : day.event
                    ? "bg-linear-to-r from-blue-500 to-indigo-500"
                    : "bg-linear-to-r from-primary to-primary/80",
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">{format(date, "EEEE")}</p>
                  <p className="text-2xl font-bold">
                    {format(date, "MMMM d, yyyy")}
                  </p>
                </div>
                <div className="text-4xl opacity-50 font-bold">{dayNumber}</div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Status summary */}
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <Badge
                    key={status.label}
                    variant="outline"
                    className={cn("gap-1 px-2 py-1", status.bgColor)}
                  >
                    <status.icon className="h-3 w-3" />
                    {status.label}
                  </Badge>
                ))}
                {statuses.length === 0 && (
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-700 border-green-200"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Working Day
                  </Badge>
                )}
              </div>

              {/* Detailed attendance breakdown */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Attendance Summary
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Present</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {present}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Absent</p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">
                      {absent}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Leave</p>
                    <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                      {leave}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-lg font-bold">{totalClasses} classes</p>
                  </div>
                </div>

                {/* Progress bar with explanation */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Completion rate
                    </span>
                    <span className="font-medium">{attendancePercentage}%</span>
                  </div>
                  <Progress value={attendancePercentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {attendanceRecords} out of {totalClasses} classes have
                    attendance marked
                  </p>
                </div>
              </div>

              {/* Holiday/Event details */}
              {day.holidayTitle && (
                <div className="space-y-1 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                    <Flag className="h-3 w-3" />
                    Holiday Details
                  </p>
                  <p className="text-sm font-medium">{day.holidayTitle}</p>
                  {day.holidayDescription && (
                    <p className="text-xs text-muted-foreground">
                      {day.holidayDescription}
                    </p>
                  )}
                </div>
              )}

              {day.event && (
                <div className="space-y-1 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <CalendarX className="h-3 w-3" />
                    Event Details
                  </p>
                  <p className="text-sm font-medium">{day.event}</p>
                  {day.eventDescription && (
                    <p className="text-xs text-muted-foreground">
                      {day.eventDescription}
                    </p>
                  )}
                </div>
              )}

              <Separator />

              {/* Action Buttons */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Quick Actions
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {/* Holiday Actions */}
                  {!day.isHoliday && onMarkHoliday && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30"
                      onClick={(e) => handleActionClick(e, onMarkHoliday)}
                    >
                      <Flag className="h-3.5 w-3.5 text-red-500" />
                      <span className="text-xs">Holiday</span>
                    </Button>
                  )}

                  {day.isHoliday && onRemoveHoliday && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30 text-destructive"
                      onClick={(e) => handleActionClick(e, onRemoveHoliday)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      <span className="text-xs">Remove Holiday</span>
                    </Button>
                  )}

                  {/* Event Actions */}
                  {!day.event && onCreateEvent && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/30"
                      onClick={(e) => handleActionClick(e, onCreateEvent)}
                    >
                      <CalendarX className="h-3.5 w-3.5 text-blue-500" />
                      <span className="text-xs">Event</span>
                    </Button>
                  )}

                  {day.event && onRemoveEvent && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/30 text-destructive"
                      onClick={(e) => handleActionClick(e, onRemoveEvent)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-blue-500" />
                      <span className="text-xs">Remove Event</span>
                    </Button>
                  )}

                  {/* Attendance Lock Actions */}
                  {!day.isAttendanceLocked && onLockAttendance && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 border-amber-200 hover:border-amber-300 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-950/30"
                      onClick={(e) => handleActionClick(e, onLockAttendance)}
                    >
                      <Lock className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-xs">Lock</span>
                    </Button>
                  )}

                  {day.isAttendanceLocked && onUnlockAttendance && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 border-amber-200 hover:border-amber-300 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-950/30"
                      onClick={(e) => handleActionClick(e, onUnlockAttendance)}
                    >
                      <Ban className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-xs">Unlock</span>
                    </Button>
                  )}

                  {/* View Details - always shown, spans full width if it's the only button */}
                  {onViewDetails && (
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "w-full gap-1.5",
                        (!onMarkHoliday &&
                          !onCreateEvent &&
                          !onLockAttendance) ||
                          (!day.isHoliday &&
                            !day.event &&
                            !day.isAttendanceLocked)
                          ? "col-span-2"
                          : "",
                      )}
                      onClick={(e) => handleActionClick(e, onViewDetails)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span className="text-xs">View Details</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Footer note */}
              <p className="text-[10px] text-center text-muted-foreground">
                Click card for full day details
              </p>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </TooltipProvider>
  );
}
