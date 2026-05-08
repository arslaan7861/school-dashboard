"use client";

import { useState } from "react";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { CalendarLegend } from "@/components/calendar/CalendarLegend";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { DayDetailsSheet } from "@/components/calendar/DayDetailsSheet";
import { HolidayModal } from "@/components/calendar/HolidayModal";
import { EventModal } from "@/components/calendar/EventModal";
import { AttendanceLockModal } from "@/components/calendar/AttendanceLockModal";
import { CalendarDay } from "@/features/calendar/types.calendar";
import { useCalendarMonth } from "@/features/calendar/hooks.calendar";
import { useAuthStore } from "@/store/authStore";
import { format } from "date-fns";
import { useSessions } from "@/features/session/hooks.session";
import { Session } from "@/features/session/types.session";

export default function CalendarPage() {
  const { activeSessionId } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  // Modal states
  const [isDaySheetOpen, setIsDaySheetOpen] = useState(false);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);

  // For action-specific modals from hover card
  const [actionDay, setActionDay] = useState<CalendarDay | null>(null);

  const year = format(currentDate, "yyyy");
  const month = format(currentDate, "MM");

  const { data: monthData, isLoading } = useCalendarMonth({
    year,
    month,
    sessionId: Number(activeSessionId),
  });

  // Handle day click (opens full details sheet)
  const handleDayClick = (day: CalendarDay) => {
    setSelectedDay(day);
    setIsDaySheetOpen(true);
  };

  // Handle quick actions from hover card
  const handleMarkHoliday = (day: CalendarDay) => {
    setActionDay(day);
    setIsHolidayModalOpen(true);
  };

  const handleCreateEvent = (day: CalendarDay) => {
    setActionDay(day);
    setIsEventModalOpen(true);
  };

  const handleLockAttendance = (day: CalendarDay) => {
    setActionDay(day);
    setIsLockModalOpen(true);
  };

  const handleViewDetails = (day: CalendarDay) => {
    setSelectedDay(day);
    setIsDaySheetOpen(true);
  };

  // Handle modal success
  const handleUpdateSuccess = () => {
    // Refetch calendar data
    // The mutation hooks will handle invalidation
    setActionDay(null);
  };
  const { data } = useSessions();
  const sessions: Session[] = data?.data ?? [];

  const activeSession =
    sessions.find((s) => String(s.id) === activeSessionId) ||
    sessions.find((s) => s.isActive) ||
    sessions[0] ||
    null;

  return (
    <div className="h-full w-full space-y-6 py-6">
      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={() =>
          setCurrentDate((prev) => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() - 1);
            return newDate;
          })
        }
        sessionEndDate={new Date(activeSession?.endDate || "")}
        sessionStartDate={new Date(activeSession?.startDate || "")}
        onNextMonth={() =>
          setCurrentDate((prev) => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + 1);
            return newDate;
          })
        }
        onToday={() => setCurrentDate(new Date())}
        onMarkHoliday={() => {
          // Global action from header - uses current month
          setActionDay(null);
          setIsHolidayModalOpen(true);
        }}
        onCreateEvent={() => {
          setActionDay(null);
          setIsEventModalOpen(true);
        }}
        onLockAttendance={() => {
          setActionDay(null);
          setIsLockModalOpen(true);
        }}
      />

      <CalendarLegend />

      <CalendarGrid
        currentDate={currentDate}
        days={monthData || []}
        onDayClick={handleDayClick}
        onMarkHoliday={handleMarkHoliday}
        onCreateEvent={handleCreateEvent}
        onLockAttendance={handleLockAttendance}
        onViewDetails={handleViewDetails}
        isLoading={isLoading}
      />

      {/* Day Details Sheet */}
      <DayDetailsSheet
        open={isDaySheetOpen}
        onOpenChange={setIsDaySheetOpen}
        dayId={selectedDay?.id || null}
        selectedDate={selectedDay ? new Date(selectedDay.date) : null}
        onSuccess={handleUpdateSuccess}
      />

      {/* Modals - support both global and day-specific actions */}
      <HolidayModal
        open={isHolidayModalOpen}
        onOpenChange={setIsHolidayModalOpen}
        selectedDate={actionDay ? new Date(actionDay.date) : currentDate}
        classId={undefined} // You can add class selection logic here
        onSuccess={handleUpdateSuccess}
      />

      <EventModal
        open={isEventModalOpen}
        onOpenChange={setIsEventModalOpen}
        selectedDate={actionDay ? new Date(actionDay.date) : currentDate}
        classId={undefined}
        onSuccess={handleUpdateSuccess}
      />

      <AttendanceLockModal
        open={isLockModalOpen}
        onOpenChange={setIsLockModalOpen}
        selectedDate={actionDay ? new Date(actionDay.date) : currentDate}
        classId={undefined}
        onSuccess={handleUpdateSuccess}
      />
    </div>
  );
}
