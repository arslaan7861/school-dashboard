"use client";

import { useEffect, useMemo, useCallback, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Lock,
  Unlock,
  Flag,
  CalendarX,
  RefreshCw,
  School,
  Users,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Trash2,
  MoreHorizontal,
  Info,
} from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import {
  useDayDetails,
  useCalendarMutations,
  calendarKeys,
} from "@/features/calendar/hooks.calendar";
import { useAuthStore } from "@/store/authStore";
import { useCalendarDayDetailsStore } from "@/store/calendarDayDetailsStore";
import { HolidayModal } from "./HolidayModal";
import { EventModal } from "./EventModal";
import { cn } from "@/lib/utils";

interface DayDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dayId: number | null;
  selectedDate: Date | null;
  onSuccess?: () => void;
}

export function DayDetailsSheet({
  open,
  onOpenChange,
  dayId,
  selectedDate,
  onSuccess,
}: DayDetailsSheetProps) {
  const { activeSessionId } = useAuthStore();
  const queryClient = useQueryClient();

  // Local state for override details modal
  const [selectedOverrideClass, setSelectedOverrideClass] = useState<any>(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);

  // Zustand store
  const {
    selectedClass,
    showMobileDetails,
    holidayModalOpen,
    eventModalOpen,
    dialogType,
    dialogClassId,
    openHolidayModal,
    closeHolidayModal,
    openEventModal,
    closeEventModal,
    openRemoveDialog,
    closeDialogs,
    selectClass,
    closeClassDetails,
    reset,
  } = useCalendarDayDetailsStore();

  // Reset store when sheet closes
  useEffect(() => {
    if (!open) {
      reset();
      setOverrideModalOpen(false);
      setSelectedOverrideClass(null);
    }
  }, [open, reset]);

  // Queries and mutations
  const {
    data: apiData,
    isLoading,
    isFetching,
  } = useDayDetails(dayId || undefined);

  const {
    markHoliday,
    removeHoliday,
    createEvent,
    removeEvent,
    lockAttendance,
    unlockAttendance,
    isUpdating,
  } = useCalendarMutations();

  const data = apiData?.data;
  const dayInfo = data?.dayInfo;
  const classes = data?.classes || [];

  // Memoized calculations
  const summary = useMemo(() => {
    const total = classes.length;
    const holidays = classes.filter((c) => c.isHoliday).length;
    const events = classes.filter((c) => c.event && !c.isHoliday).length;
    const locked = classes.filter((c) => c.isAttendanceLocked).length;
    const attendanceMarked = classes.filter(
      (c) => parseInt(c.attendanceRecords) > 0,
    ).length;
    const attendancePercentage =
      total > 0 ? Math.round((attendanceMarked / total) * 100) : 0;

    return {
      total,
      holidays,
      events,
      locked,
      attendanceMarked,
      attendancePercentage,
    };
  }, [classes]);

  // Day type badge
  const DayBadge = useMemo(() => {
    if (dayInfo?.holidayTitle) {
      return {
        icon: Flag,
        label: "Holiday",
        color: "destructive",
        bgColor: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      };
    }
    if (dayInfo?.event) {
      return {
        icon: CalendarX,
        label: "Event",
        color: "info",
        bgColor:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      };
    }
    if (dayInfo?.isAttendanceLocked) {
      return {
        icon: Lock,
        label: "Locked",
        color: "warning",
        bgColor:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      };
    }
    return {
      icon: CheckCircle2,
      label: "Working Day",
      color: "success",
      bgColor:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    };
  }, [dayInfo]);

  const handleRefresh = useCallback(() => {
    if (dayId) {
      queryClient.invalidateQueries({
        queryKey: calendarKeys.day(dayId),
      });
    }
  }, [queryClient, dayId]);

  const handleMarkHoliday = useCallback(
    (classId?: number) => {
      if (!selectedDate || !activeSessionId) return;
      openHolidayModal(classId);
    },
    [selectedDate, activeSessionId, openHolidayModal],
  );

  const handleCreateEvent = useCallback(
    (classId?: number) => {
      if (!selectedDate || !activeSessionId) return;
      openEventModal(classId);
    },
    [selectedDate, activeSessionId, openEventModal],
  );

  const handleLockAttendance = useCallback(
    async (classId?: number, lock: boolean = true) => {
      if (!selectedDate || !activeSessionId) return;

      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const mutation = lock ? lockAttendance : unlockAttendance;

      try {
        await mutation({
          sessionId: Number(activeSessionId),
          startDate: dateStr,
          endDate: dateStr,
          classIds: classId ? [classId] : undefined,
        });
        onSuccess?.();
      } catch (error) {
        // Error handled in hook
      }
    },
    [
      selectedDate,
      activeSessionId,
      lockAttendance,
      unlockAttendance,
      onSuccess,
    ],
  );

  const handleRemoveHoliday = useCallback(async () => {
    if (
      !selectedDate ||
      !activeSessionId ||
      (!dialogClassId && dialogType !== "removeHoliday")
    )
      return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");

    try {
      await removeHoliday({
        sessionId: Number(activeSessionId),
        startDate: dateStr,
        endDate: dateStr,
        classIds: dialogClassId ? [dialogClassId] : undefined,
      });

      closeDialogs();
      onSuccess?.();
    } catch (error) {
      // Error handled in hook
    }
  }, [
    selectedDate,
    activeSessionId,
    removeHoliday,
    dialogClassId,
    dialogType,
    closeDialogs,
    onSuccess,
  ]);

  const handleRemoveEvent = useCallback(async () => {
    if (
      !selectedDate ||
      !activeSessionId ||
      (!dialogClassId && dialogType !== "removeEvent")
    )
      return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");

    try {
      await removeEvent({
        sessionId: Number(activeSessionId),
        startDate: dateStr,
        endDate: dateStr,
        classIds: dialogClassId ? [dialogClassId] : undefined,
      });

      closeDialogs();
      onSuccess?.();
    } catch (error) {
      // Error handled in hook
    }
  }, [
    selectedDate,
    activeSessionId,
    removeEvent,
    dialogClassId,
    dialogType,
    closeDialogs,
    onSuccess,
  ]);

  const handleClassClick = useCallback(
    (cls: any) => {
      // If class has override (holiday or event), show the modal
      if (cls.isHoliday || cls.event) {
        setSelectedOverrideClass(cls);
        setOverrideModalOpen(true);
      } else {
        // Otherwise use existing mobile detail view
        selectClass(cls);
      }
    },
    [selectClass],
  );

  const handleClassSelect = useCallback(
    (cls: any) => selectClass(cls),
    [selectClass],
  );
  const handleBackToList = useCallback(
    () => closeClassDetails(),
    [closeClassDetails],
  );
  const handleModalSuccess = useCallback(() => onSuccess?.(), [onSuccess]);

  const DayIcon = DayBadge.icon;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-[600px] lg:max-w-[800px] xl:max-w-[900px] p-0">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background border-b">
            <SheetHeader className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn("p-2 rounded-lg shrink-0", DayBadge.bgColor)}
                  >
                    <DayIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <SheetTitle className="text-base truncate">
                        {selectedDate
                          ? format(selectedDate, "MMMM d, yyyy")
                          : "Day Details"}
                      </SheetTitle>
                      <Badge
                        variant="outline"
                        className={cn("text-xs", DayBadge.bgColor)}
                      >
                        <DayIcon className="h-3 w-3 mr-1" />
                        {DayBadge.label}
                      </Badge>
                    </div>
                    <SheetDescription className="text-xs flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {selectedDate && format(selectedDate, "EEEE")}
                      </span>
                    </SheetDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isFetching || isUpdating}
                  className="h-8 w-8"
                >
                  <RefreshCw
                    className={cn(
                      "h-4 w-4",
                      (isFetching || isUpdating) && "animate-spin",
                    )}
                  />
                </Button>
              </div>
            </SheetHeader>
          </div>

          {/* Mobile Back Button */}
          {showMobileDetails && (
            <div className="lg:hidden p-3 border-b">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToList}
                className="gap-1"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
                Back to all classes
              </Button>
            </div>
          )}

          <ScrollArea className="h-[calc(100vh-8rem)]">
            {isLoading ? (
              <div className="p-4 space-y-4">
                <Skeleton className="h-20 w-full" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
                <Skeleton className="h-48 w-full" />
              </div>
            ) : dayInfo ? (
              <div className="p-4 space-y-4">
                {/* Quick Actions Bar */}
                <div className="flex flex-wrap items-center gap-2 p-2 bg-muted/50 rounded-lg">
                  <span className="text-xs font-medium text-muted-foreground px-2">
                    Quick Actions:
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkHoliday()}
                    disabled={isUpdating}
                    className="h-8"
                  >
                    <Flag className="h-3.5 w-3.5 mr-1.5 text-red-500" />
                    Holiday
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCreateEvent()}
                    disabled={isUpdating}
                    className="h-8"
                  >
                    <CalendarX className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                    Event
                  </Button>
                  {dayInfo.isAttendanceLocked ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLockAttendance(undefined, false)}
                      disabled={isUpdating}
                      className="h-8"
                    >
                      <Unlock className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                      Unlock
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLockAttendance(undefined, true)}
                      disabled={isUpdating}
                      className="h-8"
                    >
                      <Lock className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                      Lock
                    </Button>
                  )}
                  <Separator orientation="vertical" className="h-4 mx-1" />
                  {(dayInfo.holidayTitle || dayInfo.event) && (
                    <>
                      {dayInfo.holidayTitle && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openRemoveDialog("holiday")}
                          disabled={isUpdating}
                          className="h-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                          Remove Holiday
                        </Button>
                      )}
                      {dayInfo.event && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openRemoveDialog("event")}
                          disabled={isUpdating}
                          className="h-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                          Remove Event
                        </Button>
                      )}
                    </>
                  )}
                </div>

                {/* Day Info Cards - Compact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {dayInfo.holidayTitle && (
                    <Card className=" bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-800">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <Flag className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-red-600 dark:text-red-400">
                              {dayInfo.holidayTitle}
                            </p>
                            {dayInfo.holidayDescription && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                {dayInfo.holidayDescription}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {dayInfo.event && (
                    <Card className=" bg-blue-50/50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-800">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <CalendarX className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                              {dayInfo.event}
                            </p>
                            {dayInfo.eventDescription && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                {dayInfo.eventDescription}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-4 gap-2">
                  <Card>
                    <CardContent className="p-2 text-center">
                      <School className="h-4 w-4 mx-auto text-muted-foreground" />
                      <p className="text-lg font-bold mt-1">{summary.total}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Classes
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-2 text-center">
                      <Flag className="h-4 w-4 mx-auto text-red-500" />
                      <p className="text-lg font-bold mt-1">
                        {summary.holidays}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Holidays
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-2 text-center">
                      <CalendarX className="h-4 w-4 mx-auto text-blue-500" />
                      <p className="text-lg font-bold mt-1">{summary.events}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Events
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-2 text-center">
                      <Lock className="h-4 w-4 mx-auto text-amber-500" />
                      <p className="text-lg font-bold mt-1">{summary.locked}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Locked
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Attendance Overview */}
                {summary.total > 0 && (
                  <Card>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          Attendance
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {summary.attendanceMarked}/{summary.total} (
                          {summary.attendancePercentage}%)
                        </span>
                      </div>
                      <Progress
                        value={summary.attendancePercentage}
                        className="h-1.5"
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Class Overview */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Classes</h4>

                  {/* Desktop Table */}
                  {!showMobileDetails && (
                    <div className="hidden lg:block border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead className="h-8 text-xs">Class</TableHead>
                            <TableHead className="h-8 text-xs">
                              Status
                            </TableHead>
                            <TableHead className="h-8 text-xs">
                              Attendance
                            </TableHead>
                            <TableHead className="h-8 text-xs text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {classes.map((cls) => (
                            <TableRow
                              key={cls.classId}
                              className={cn(
                                "group h-12",
                                (cls.isHoliday || cls.event) &&
                                  "cursor-pointer hover:bg-muted/50",
                              )}
                              onClick={() => handleClassClick(cls)}
                            >
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-[10px]">
                                      {cls.name.charAt(0)}
                                      {cls.section}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-xs font-medium">
                                      {cls.name}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      Sec {cls.section}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  {cls.isHoliday && (
                                    <Badge
                                      variant="outline"
                                      className="h-5 px-1.5 text-[10px] bg-red-100 text-red-700 border-red-200"
                                    >
                                      <Flag className="h-2.5 w-2.5 mr-1" />
                                      Holiday
                                    </Badge>
                                  )}
                                  {cls.event && !cls.isHoliday && (
                                    <Badge
                                      variant="outline"
                                      className="h-5 px-1.5 text-[10px] bg-blue-100 text-blue-700 border-blue-200"
                                    >
                                      <CalendarX className="h-2.5 w-2.5 mr-1" />
                                      Event
                                    </Badge>
                                  )}
                                  {!cls.isHoliday && !cls.event && (
                                    <Badge
                                      variant="outline"
                                      className="h-5 px-1.5 text-[10px] bg-green-100 text-green-700 border-green-200"
                                    >
                                      <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                                      Working
                                    </Badge>
                                  )}
                                  {(cls.isHoliday || cls.event) && (
                                    <Info className="h-3 w-3 text-muted-foreground ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Badge
                                    variant="secondary"
                                    className="h-5 text-[10px]"
                                  >
                                    {cls.attendanceRecords}
                                  </Badge>
                                  {cls.isAttendanceLocked && (
                                    <Lock className="h-3 w-3 text-amber-500" />
                                  )}
                                </div>
                              </TableCell>
                              <TableCell
                                className="text-right"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                    >
                                      <MoreHorizontal className="h-3.5 w-3.5" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-44"
                                  >
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleMarkHoliday(cls.classId)
                                      }
                                      className="text-xs"
                                    >
                                      <Flag className="h-3.5 w-3.5 mr-2 text-red-500" />
                                      Mark Holiday
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleCreateEvent(cls.classId)
                                      }
                                      className="text-xs"
                                    >
                                      <CalendarX className="h-3.5 w-3.5 mr-2 text-blue-500" />
                                      Create Event
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {cls.isAttendanceLocked ? (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleLockAttendance(
                                            cls.classId,
                                            false,
                                          )
                                        }
                                        className="text-xs"
                                      >
                                        <Unlock className="h-3.5 w-3.5 mr-2 text-amber-500" />
                                        Unlock Attendance
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleLockAttendance(
                                            cls.classId,
                                            true,
                                          )
                                        }
                                        className="text-xs"
                                      >
                                        <Lock className="h-3.5 w-3.5 mr-2 text-amber-500" />
                                        Lock Attendance
                                      </DropdownMenuItem>
                                    )}
                                    {(cls.isHoliday || cls.event) && (
                                      <>
                                        <DropdownMenuSeparator />
                                        {cls.isHoliday && (
                                          <DropdownMenuItem
                                            onClick={() =>
                                              openRemoveDialog(
                                                "holiday",
                                                cls.classId,
                                              )
                                            }
                                            className="text-xs text-destructive focus:text-destructive"
                                          >
                                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                                            Remove Holiday
                                          </DropdownMenuItem>
                                        )}
                                        {cls.event && (
                                          <DropdownMenuItem
                                            onClick={() =>
                                              openRemoveDialog(
                                                "event",
                                                cls.classId,
                                              )
                                            }
                                            className="text-xs text-destructive focus:text-destructive"
                                          >
                                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                                            Remove Event
                                          </DropdownMenuItem>
                                        )}
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Mobile Card View */}
                  {!showMobileDetails && (
                    <div className="lg:hidden space-y-2">
                      {classes.map((cls) => (
                        <Card
                          key={cls.classId}
                          className={cn(
                            "cursor-pointer hover:bg-accent/50 transition-colors",
                            (cls.isHoliday || cls.event) &&
                              "border-l-4 border-l-primary",
                          )}
                          onClick={() => handleClassClick(cls)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs">
                                    {cls.name.charAt(0)}
                                    {cls.section}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">
                                    {cls.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Section {cls.section}
                                  </p>
                                </div>
                              </div>
                              {(cls.isHoliday || cls.event) && (
                                <Info className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {cls.isHoliday && (
                                <Badge
                                  variant="outline"
                                  className="h-5 text-[10px] bg-red-100 text-red-700 border-red-200"
                                >
                                  <Flag className="h-2.5 w-2.5 mr-1" />
                                  Holiday
                                </Badge>
                              )}
                              {cls.event && !cls.isHoliday && (
                                <Badge
                                  variant="outline"
                                  className="h-5 text-[10px] bg-blue-100 text-blue-700 border-blue-200"
                                >
                                  <CalendarX className="h-2.5 w-2.5 mr-1" />
                                  Event
                                </Badge>
                              )}
                              {cls.isAttendanceLocked && (
                                <Badge
                                  variant="outline"
                                  className="h-5 text-[10px] bg-amber-100 text-amber-700 border-amber-200"
                                >
                                  <Lock className="h-2.5 w-2.5 mr-1" />
                                  Locked
                                </Badge>
                              )}
                              <Badge
                                variant="secondary"
                                className="h-5 text-[10px] ml-auto"
                              >
                                {cls.attendanceRecords} marked
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Mobile Class Details */}
                  {showMobileDetails && selectedClass && (
                    <div className="lg:hidden space-y-3">
                      <Card>
                        <CardContent className="p-3 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Status
                            </span>
                            <div className="flex gap-1">
                              {selectedClass.isHoliday && (
                                <Badge
                                  variant="outline"
                                  className="h-5 text-[10px] bg-red-100 text-red-700 border-red-200"
                                >
                                  <Flag className="h-2.5 w-2.5 mr-1" />
                                  Holiday
                                </Badge>
                              )}
                              {selectedClass.event &&
                                !selectedClass.isHoliday && (
                                  <Badge
                                    variant="outline"
                                    className="h-5 text-[10px] bg-blue-100 text-blue-700 border-blue-200"
                                  >
                                    <CalendarX className="h-2.5 w-2.5 mr-1" />
                                    Event
                                  </Badge>
                                )}
                              {!selectedClass.isHoliday &&
                                !selectedClass.event && (
                                  <Badge
                                    variant="outline"
                                    className="h-5 text-[10px] bg-green-100 text-green-700 border-green-200"
                                  >
                                    <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                                    Working
                                  </Badge>
                                )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Attendance
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {selectedClass.attendanceRecords} marked
                            </Badge>
                          </div>
                          {selectedClass.isAttendanceLocked && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                Lock Status
                              </span>
                              <Badge
                                variant="outline"
                                className="bg-amber-100 text-amber-700 border-amber-200 text-xs"
                              >
                                <Lock className="h-3 w-3 mr-1" />
                                Locked
                              </Badge>
                            </div>
                          )}
                          <Separator />
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleMarkHoliday(selectedClass.classId)
                              }
                              disabled={isUpdating}
                              className="h-8 text-xs"
                            >
                              <Flag className="h-3.5 w-3.5 mr-1.5 text-red-500" />
                              Holiday
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleCreateEvent(selectedClass.classId)
                              }
                              disabled={isUpdating}
                              className="h-8 text-xs"
                            >
                              <CalendarX className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                              Event
                            </Button>
                            {selectedClass.isAttendanceLocked ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleLockAttendance(
                                    selectedClass.classId,
                                    false,
                                  )
                                }
                                disabled={isUpdating}
                                className="h-8 text-xs"
                              >
                                <Unlock className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                                Unlock
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleLockAttendance(
                                    selectedClass.classId,
                                    true,
                                  )
                                }
                                disabled={isUpdating}
                                className="h-8 text-xs"
                              >
                                <Lock className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                                Lock
                              </Button>
                            )}
                            {(selectedClass.isHoliday ||
                              selectedClass.event) && (
                              <>
                                {selectedClass.isHoliday && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      openRemoveDialog(
                                        "holiday",
                                        selectedClass.classId,
                                      )
                                    }
                                    disabled={isUpdating}
                                    className="h-8 text-xs text-destructive col-span-2"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                    Remove Holiday
                                  </Button>
                                )}
                                {selectedClass.event && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      openRemoveDialog(
                                        "event",
                                        selectedClass.classId,
                                      )
                                    }
                                    disabled={isUpdating}
                                    className="h-8 text-xs text-destructive col-span-2"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                    Remove Event
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No data available for this day
                </p>
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Override Details Modal */}
      <Dialog open={overrideModalOpen} onOpenChange={setOverrideModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Class Override Details
            </DialogTitle>
            <DialogDescription>
              {selectedOverrideClass && (
                <span>
                  {selectedOverrideClass.name} - Section{" "}
                  {selectedOverrideClass.section}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedOverrideClass && (
            <div className="space-y-4 py-2">
              {/* Holiday Details */}
              {selectedOverrideClass.isHoliday && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <Flag className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Holiday Override
                    </span>
                  </div>
                  <Card className="bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-800">
                    <CardContent className="p-3 space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Title</p>
                        <p className="text-sm font-medium">
                          {selectedOverrideClass.holidayTitle}
                        </p>
                      </div>
                      {selectedOverrideClass.holidayDescription && (
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Description
                          </p>
                          <p className="text-sm">
                            {selectedOverrideClass.holidayDescription}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Event Details */}
              {selectedOverrideClass.event &&
                !selectedOverrideClass.isHoliday && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <CalendarX className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Event Override
                      </span>
                    </div>
                    <Card className="bg-blue-50/50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-800">
                      <CardContent className="p-3 space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Event Name
                          </p>
                          <p className="text-sm font-medium">
                            {selectedOverrideClass.event}
                          </p>
                        </div>
                        {selectedOverrideClass.eventDescription && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Description
                            </p>
                            <p className="text-sm">
                              {selectedOverrideClass.eventDescription}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

              {/* Attendance Info */}
              {selectedOverrideClass.isAttendanceLocked && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <Lock className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Attendance Status
                    </span>
                  </div>
                  <Card className="bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-800">
                    <CardContent className="p-3">
                      <p className="text-sm">
                        Attendance is locked for this class
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedOverrideClass.attendanceRecords} attendance
                        records marked
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setOverrideModalOpen(false);
                    handleMarkHoliday(selectedOverrideClass.classId);
                  }}
                >
                  <Flag className="h-3.5 w-3.5 mr-1.5 text-red-500" />
                  Edit Holiday
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setOverrideModalOpen(false);
                    handleCreateEvent(selectedOverrideClass.classId);
                  }}
                >
                  <CalendarX className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                  Edit Event
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Remove Dialogs */}
      <AlertDialog
        open={dialogType === "removeHoliday"}
        onOpenChange={closeDialogs}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Remove {dialogClassId ? "Class Holiday" : "Global Holiday"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogClassId
                ? "Are you sure you want to remove the holiday from this class? This action cannot be undone."
                : "Are you sure you want to remove the holiday from all classes? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {dayInfo?.holidayTitle && (
            <div className="bg-muted/50 p-2 rounded text-sm">
              <p className="font-medium">{dayInfo.holidayTitle}</p>
              {dayInfo.holidayDescription && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {dayInfo.holidayDescription}
                </p>
              )}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveHoliday}
              className="bg-destructive"
              disabled={isUpdating}
            >
              {isUpdating ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={dialogType === "removeEvent"}
        onOpenChange={closeDialogs}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Remove {dialogClassId ? "Class Event" : "Global Event"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogClassId
                ? "Are you sure you want to remove the event from this class? This action cannot be undone."
                : "Are you sure you want to remove the event from all classes? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {dayInfo?.event && (
            <div className="bg-muted/50 p-2 rounded text-sm">
              <p className="font-medium">{dayInfo.event}</p>
              {dayInfo.eventDescription && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {dayInfo.eventDescription}
                </p>
              )}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveEvent}
              className="bg-destructive"
              disabled={isUpdating}
            >
              {isUpdating ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modals */}
      {selectedDate && (
        <>
          <HolidayModal
            open={holidayModalOpen}
            onOpenChange={closeHolidayModal}
            selectedDate={selectedDate}
            classId={dialogClassId}
            onSuccess={handleModalSuccess}
          />
          <EventModal
            open={eventModalOpen}
            onOpenChange={closeEventModal}
            selectedDate={selectedDate}
            classId={dialogClassId}
            onSuccess={handleModalSuccess}
          />
        </>
      )}
    </>
  );
}
