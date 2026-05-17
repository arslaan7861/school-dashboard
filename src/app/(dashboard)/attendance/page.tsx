"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { format } from "date-fns";

import {
  Calendar as CalendarIcon,
  RefreshCw,
  Lock,
  Unlock,
  FileSpreadsheet,
  CheckCircle,
  ChevronDown,
  X,
  Clock10,
  Stethoscope,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useClasses } from "@/features/class/hooks.class";

import {
  useAttendanceByDay,
  useBulkMarkAttendance,
  useLockAttendance,
  useUnlockAttendance,
} from "@/features/attendance/hooks.attendance";

import { useAuthStore } from "@/store/authStore";

import { AttendanceStats } from "@/components/attendance/AttendanceStats";
import {
  AttendanceTable,
  AttendanceTableRef,
} from "@/components/attendance/AttendanceTable";
import { AttendanceSummaryCard } from "@/components/attendance/AttendanceSummaryCard";
import { BulkAttendanceModal } from "@/components/attendance/BulkAttendanceModal";
import { AcademicDaySelector } from "@/components/attendance/AcdemicDaySelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function AttendancePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSessionId = useAuthStore((s) => s.activeSessionId);
  const attendanceTableRef = useRef<AttendanceTableRef>(null);

  /* ----------------------------------------------------------
   * State
   * -------------------------------------------------------- */

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAcademicDayId, setSelectedAcademicDayId] = useState<
    number | null
  >(null);
  const [isDateSelectorOpen, setIsDateSelectorOpen] = useState(false);

  /* ----------------------------------------------------------
   * URL Sync Functions
   * -------------------------------------------------------- */

  const updateUrlParams = useCallback(
    (classId: string, dayId: number | null, date: Date) => {
      const params = new URLSearchParams();

      if (classId) {
        params.set("class", classId);
      }
      if (dayId) {
        params.set("day", dayId.toString());
        params.set("date", format(date, "yyyy-MM-dd"));
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(newUrl, { scroll: false });
    },
    [pathname, router],
  );

  // Initialize from URL on mount
  useEffect(() => {
    const classIdFromUrl = searchParams.get("class");
    const dayIdFromUrl = searchParams.get("day");
    const dateFromUrl = searchParams.get("date");

    if (classIdFromUrl) {
      setSelectedClassId(classIdFromUrl);
    }

    if (dayIdFromUrl && dateFromUrl) {
      setSelectedAcademicDayId(parseInt(dayIdFromUrl));
      setSelectedDate(new Date(dateFromUrl));
    }
  }, [searchParams]);

  /* ----------------------------------------------------------
   * Derived State
   * -------------------------------------------------------- */

  const parsedClassId = useMemo(() => {
    return selectedClassId ? Number(selectedClassId) : undefined;
  }, [selectedClassId]);

  const academicDayId = selectedAcademicDayId || undefined;
  const canShowAttendance = !!parsedClassId && !!academicDayId;

  /* ----------------------------------------------------------
   * Queries
   * -------------------------------------------------------- */

  const { data: classesData, isLoading: classesLoading } = useClasses(
    activeSessionId || undefined,
  );

  const {
    data: attendance,
    isLoading: attendanceLoading,
    isFetching: attendanceFetching,
    refetch,
  } = useAttendanceByDay(academicDayId, parsedClassId);

  /* ----------------------------------------------------------
   * Mutations
   * -------------------------------------------------------- */

  const bulkMarkAttendance = useBulkMarkAttendance();

  /* ----------------------------------------------------------
   * Handlers
   * -------------------------------------------------------- */

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    updateUrlParams(classId, selectedAcademicDayId, selectedDate);
  };

  const handleDateSelect = (newAcademicDayId: number, date: Date) => {
    setSelectedAcademicDayId(newAcademicDayId);
    setSelectedDate(date);
    updateUrlParams(selectedClassId, newAcademicDayId, date);
    setIsDateSelectorOpen(false);
  };

  const handleSaveAttendance = async (
    attendanceRecords: any[],
    onSuccess?: () => void,
  ) => {
    if (!academicDayId || !parsedClassId) return;

    await bulkMarkAttendance.mutateAsync(
      {
        academicDayId,
        classId: parsedClassId,
        attendance: attendanceRecords,
      },
      {
        onError: (e) => {
          toast.error(e.message);
          console.log(e);
          attendanceTableRef.current?.resetToOriginal();
        },
      },
    );
    onSuccess?.();
  };

  const handleMarkAllPresent = () => {
    attendanceTableRef.current?.markAllPresent();
  };

  const handleMarkAllAbsent = () => {
    attendanceTableRef.current?.markAllAbsent();
  };

  const handleMarkAllLate = () => {
    attendanceTableRef.current?.markAllLate();
  };

  const handleMarkAllLeave = () => {
    attendanceTableRef.current?.markAllLeave();
  };

  const classes = useMemo(() => {
    return classesData?.data || [];
  }, [classesData]);

  // Auto-select first class if none selected and classes exist
  useEffect(() => {
    const hasClassInUrl = searchParams.get("class");

    if (classes.length === 0) return;

    if (!selectedClassId && !hasClassInUrl) {
      const firstClassId = classes[0].id.toString();
      setSelectedClassId(firstClassId);
      updateUrlParams(firstClassId, selectedAcademicDayId, selectedDate);
    }
  }, [
    classes,
    selectedClassId,
    searchParams,
    updateUrlParams,
    selectedAcademicDayId,
    selectedDate,
  ]);

  /* ----------------------------------------------------------
   * Render
   * -------------------------------------------------------- */

  return (
    <div className="space-y-6 py-6  h-full flex flex-col ">
      {/* Header */}
      <header className="flex flex-col shrink-0 lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Attendance Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Mark and manage attendance records
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedClassId} onValueChange={handleClassChange}>
            <SelectTrigger className="md:w-[200px] w-full  ">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id.toString()}>
                  {cls.name} - {cls.section}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="justify-between min-w-[200px] grow md:grow-0"
            onClick={() => setIsDateSelectorOpen(true)}
          >
            <span className="flex items-center gap-2 truncate">
              <CalendarIcon className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </span>
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>

          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={attendanceFetching}
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${attendanceFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </header>

      {/* Stats */}
      {canShowAttendance && (
        <AttendanceStats
          attendance={attendance}
          isLoading={attendanceLoading}
        />
      )}

      {/* Content */}
      {canShowAttendance ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 grow min-h-0 flex-1">
          {/* Table */}
          <div className="xl:col-span-2 md:min-h-0 h-full ">
            <AttendanceTable
              ref={attendanceTableRef}
              attendance={attendance}
              isLoading={attendanceLoading || attendanceFetching}
              onSave={handleSaveAttendance}
              academicDayId={academicDayId}
              classId={selectedClassId}
            />
          </div>

          <div className="space-y-6 hidden md:block">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>Manage attendance operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 grid grid-cols-2 gap-3">
                <Button
                  variant="default"
                  className="w-full justify-start gap-2"
                  onClick={handleMarkAllPresent}
                  disabled={!canShowAttendance}
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark all present
                </Button>
                <Button
                  variant="destructive"
                  className="w-full justify-start gap-2"
                  onClick={handleMarkAllAbsent}
                  disabled={!canShowAttendance}
                >
                  <X className="h-4 w-4" />
                  Mark all absent
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start gap-2"
                  onClick={handleMarkAllLate}
                  disabled={!canShowAttendance}
                >
                  <Clock10 className="h-4 w-4" />
                  Mark all late
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={handleMarkAllLeave}
                  disabled={!canShowAttendance}
                >
                  <Stethoscope className="h-4 w-4" />
                  Mark all leave
                </Button>
              </CardContent>
            </Card>

            {/* Summary */}
            <AttendanceSummaryCard
              attendance={attendance}
              isLoading={attendanceLoading}
            />
          </div>
        </div>
      ) : (
        <Card className="grow ">
          <CardContent className="py-16 text-center">
            <CalendarIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {!selectedClassId && !selectedAcademicDayId
                ? "Select a class and academic day to begin attendance management."
                : !selectedClassId
                  ? "Please select a class."
                  : "Please select an academic day."}
            </p>
          </CardContent>
        </Card>
      )}

      {activeSessionId && (
        <AcademicDaySelector
          isOpen={isDateSelectorOpen}
          onClose={() => setIsDateSelectorOpen(false)}
          onSelect={handleDateSelect}
          selectedDate={selectedDate}
          dayId={selectedAcademicDayId}
        />
      )}
    </div>
  );
}
