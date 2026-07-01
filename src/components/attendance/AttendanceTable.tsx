"use client";

import {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle,
  XCircle,
  Clock,
  Save,
  AlertCircle,
  Lock,
  X,
  Check,
  Info,
} from "lucide-react";

import { format } from "date-fns";

import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import { Skeleton } from "@/components/ui/skeleton";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { AttendanceStatus } from "@/features/attendance";
import { cn } from "@/lib/utils";

// Define the exposed methods
export interface AttendanceTableRef {
  markAllPresent: () => void;
  markAllAbsent: () => void;
  markAllLate: () => void;
  markAllLeave: () => void;
  markAllUnmarked: () => void;
  saveChanges: () => void;
  hasUnsavedChanges: () => boolean;
  resetToOriginal: () => void;
}

interface AttendanceTableProps {
  attendance: any;
  isLoading: boolean;
  onSave: (attendance: any[], onSuccess?: () => void) => void;
  academicDayId: number | null;
  classId: string;
}

const statusOptions = [
  {
    value: "present",
    label: "Present",
    icon: CheckCircle,
    color: "text-green-600",
  },
  {
    value: "absent",
    label: "Absent",
    icon: XCircle,
    color: "text-red-600",
  },
  {
    value: "leave",
    label: "Leave",
    icon: Clock,
    color: "text-yellow-600",
  },
  {
    value: "late",
    label: "Late",
    icon: Clock,
    color: "text-orange-600",
  },
];

export const AttendanceTable = forwardRef<
  AttendanceTableRef,
  AttendanceTableProps
>(({ attendance, isLoading, onSave, academicDayId, classId }, ref) => {
  const [attendanceState, setAttendanceState] = useState<
    Record<
      number,
      {
        status: AttendanceStatus;
        remarks: string;
      }
    >
  >({});

  const [originalState, setOriginalState] = useState<
    Record<
      number,
      {
        status: AttendanceStatus;
        remarks: string;
      }
    >
  >({});

  /* ----------------------------------------------------------
   * Derived - Calculate hasChanges by comparing with original
   * -------------------------------------------------------- */

  const students = useMemo(() => {
    return attendance?.attendance || [];
  }, [attendance]);

  const isLocked = attendance?.academicDay?.isAttendanceLocked;
  const isHoliday = attendance?.academicDay?.isHoliday;
  const summary = attendance?.summary;

  const markerName = useMemo(() => {
    const markedRecord = students.find((s: any) => s.marker?.name);
    return markedRecord?.marker?.name;
  }, [students]);

  // Derived hasChanges by comparing attendanceState with originalState
  const hasChanges = useMemo(() => {
    // If states are empty or different lengths, check each student
    const studentIds = new Set([
      ...Object.keys(attendanceState),
      ...Object.keys(originalState),
    ]);

    for (const studentId of studentIds) {
      const current = attendanceState[Number(studentId)];
      const original = originalState[Number(studentId)];

      // If student exists in one but not the other
      if (!current || !original) return true;

      // Compare status and remarks
      if (current.status !== original.status) return true;
      if (current.remarks !== original.remarks) return true;
    }

    return false;
  }, [attendanceState, originalState]);

  /* ----------------------------------------------------------
   * Helper Functions
   * -------------------------------------------------------- */

  const hasUnsavedChanges = () => {
    return hasChanges;
  };

  const resetToOriginal = () => {
    setAttendanceState({ ...originalState });
  };

  const markAllWithStatus = (status: AttendanceStatus) => {
    if (isLocked) return;

    const newState = { ...attendanceState };

    for (const student of students) {
      newState[student.classStudentId] = {
        ...newState[student.classStudentId],
        status: status,
      };
    }

    setAttendanceState(newState);
  };

  const markAllPresent = () => markAllWithStatus(AttendanceStatus.PRESENT);
  const markAllAbsent = () => markAllWithStatus(AttendanceStatus.ABSENT);
  const markAllLate = () => markAllWithStatus(AttendanceStatus.LATE);
  const markAllLeave = () => markAllWithStatus(AttendanceStatus.LEAVE);

  const markAllUnmarked = () => {
    if (isLocked) return;

    const newState = { ...attendanceState };

    for (const student of students) {
      const originalStatus = originalState[student.classStudentId]?.status;
      newState[student.classStudentId] = {
        ...newState[student.classStudentId],
        status: originalStatus || "not_marked",
      };
    }

    setAttendanceState(newState);
  };

  const saveChanges = () => {
    if (!hasChanges || isLocked) return;
    handleSave();
  };

  /* ----------------------------------------------------------
   * Expose methods to parent via ref
   * -------------------------------------------------------- */
  useImperativeHandle(ref, () => ({
    markAllPresent,
    markAllAbsent,
    markAllLate,
    markAllLeave,
    markAllUnmarked,
    saveChanges,
    hasUnsavedChanges,
    resetToOriginal,
  }));

  /* ----------------------------------------------------------
   * Reset local state whenever:
   * - academic day changes
   * - class changes
   * - attendance payload changes
   * -------------------------------------------------------- */

  useEffect(() => {
    if (!students.length) {
      setAttendanceState({});
      setOriginalState({});
      return;
    }

    const initialState: Record<
      number,
      {
        status: AttendanceStatus;
        remarks: string;
      }
    > = {};

    for (const student of students) {
      initialState[student.classStudentId] = {
        status: student.status,
        remarks: student.remarks || "",
      };
    }

    setAttendanceState(initialState);
    setOriginalState(initialState);
  }, [students, academicDayId, classId]);

  /* ----------------------------------------------------------
   * Handlers
   * -------------------------------------------------------- */

  const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
    if (isLocked) return;

    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleRemarksChange = (studentId: number, remarks: string) => {
    if (isLocked) return;

    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const handleSave = () => {
    const records = [];

    for (const [studentId, current] of Object.entries(attendanceState)) {
      const studentIdNum = Number(studentId);
      const original = originalState[studentIdNum];

      if (!original) continue;

      const statusChanged = current.status !== original.status;
      const remarksChanged = current.remarks !== original.remarks;

      if (statusChanged || remarksChanged) {
        records.push({
          classStudentId: studentIdNum,
          status: current.status,
          remarks: current.remarks || undefined,
        });
      }
    }

    if (records.length > 0) {
      onSave(records);
    }
  };

  /* ----------------------------------------------------------
   * Loading
   * -------------------------------------------------------- */

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  /* ----------------------------------------------------------
   * Empty State
   * -------------------------------------------------------- */

  if (!attendance) {
    return (
      <Card className="h-full items-center justify-center">
        <CardContent className="py-14 text-center ">
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-full bg-muted">
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No attendance data</p>
              <p className="text-sm text-muted-foreground mt-1">
                Select a class and academic day
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  /* ----------------------------------------------------------
   * Holiday State
   * -------------------------------------------------------- */

  if (isHoliday) {
    return (
      <Card className="h-full items-center justify-center">
        <CardContent className="py-14 text-center ">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-yellow-100 dark:bg-yellow-950/30">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Holiday</h3>
              <p className="text-muted-foreground mt-2">
                {attendance.academicDay?.holidayTitle || "No classes scheduled"}
              </p>
              {attendance.academicDay?.holidayDescription && (
                <p className="text-sm text-muted-foreground mt-1">
                  {attendance.academicDay?.holidayDescription}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  /* ----------------------------------------------------------
   * Main UI
   * -------------------------------------------------------- */

  return (
    <Card className="h-full min-h-0 max-h-full">
      {/* Header */}
      <CardHeader className="border-b bg-muted/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <CardTitle>Student Attendance</CardTitle>
            <CardDescription className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
              <span>{summary?.totalStudents} students</span>
              <span className="text-green-600">{summary?.present} present</span>
              <span className="text-red-600">{summary?.absent} absent</span>
              <span className="text-yellow-600">{summary?.leave} leave</span>
              <span className="text-orange-600">{summary?.late} late</span>
              {summary?.notMarked > 0 && (
                <span className="text-muted-foreground">
                  {summary?.notMarked} pending
                </span>
              )}
              {markerName && (
                <span className="text-muted-foreground">
                  • Marked by {markerName}
                </span>
              )}
              {hasChanges && (
                <span className="text-amber-600 font-medium ml-2">
                  • Unsaved changes
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 w-full lg:w-auto">
            {hasChanges && !isLocked && (
              <Button
                variant="outline"
                onClick={resetToOriginal}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
                Clear Changes
              </Button>
            )}

            <Button
              disabled={!hasChanges || isLocked}
              onClick={handleSave}
              className={cn(
                "gap-2",
                !(hasChanges && !isLocked) && "hidden",
              )}
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>

            {!isLocked && (
              <>
                <Button
                  onClick={markAllAbsent}
                  variant="destructive"
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Mark all absent
                </Button>

                <Button
                  onClick={markAllPresent}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4" />
                  Mark all present
                </Button>
              </>
            )}

            {isLocked && (
              <Badge variant="outline" className="gap-1.5">
                <Lock className="h-3 w-3" />
                Locked
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Table */}
      <CardContent className="py-0 grow overflow-y-auto scrollbar-thin min-h-0">
        <div className="overflow-y-auto h-full min-h-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="text-center md:text-left">
                  Roll No
                </TableHead>
                <TableHead className="text-center md:text-left">
                  Student
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Admission No
                </TableHead>
                <TableHead className="text-center md:text-left">
                  Status
                </TableHead>
                <TableHead className="min-w-[220px] hidden md:table-cell">
                  Remarks
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {students.map((student: any, index: number) => {
                const state = attendanceState[student.classStudentId];
                const status: string = state?.status ?? student.status;
                const currentStatus =
                  status === "not_marked" ? undefined : status;

                const currentRemarks = state?.remarks ?? student.remarks ?? "";
                const currentOption = statusOptions.find(
                  (s) => s.value === currentStatus,
                );

                // Check if this student has unsaved changes
                const original = originalState[student.classStudentId];
                const hasStudentChanges = original
                  ? original.status !== state?.status ||
                    original.remarks !== state?.remarks
                  : false;

                return (
                  <TableRow
                    key={student.classStudentId}
                    className={cn(
                      "hover:bg-muted/20",
                      hasStudentChanges &&
                        "bg-amber-50/30 dark:bg-amber-950/10",
                    )}
                  >
                    <TableCell className="text-center md:text-left">
                      {student.rollNumber}
                    </TableCell>

                    <TableCell className="text-center md:text-left">
                      <div className="flex items-center gap-2 justify-center md:justify-start">
                        <span className="font-medium">{student.studentName}</span>
                        {student.marker && (
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <button className="inline-flex items-center justify-center rounded-full hover:bg-muted p-0.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                                <Info className="h-3.5 w-3.5" />
                              </button>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80 p-4" align="start">
                              <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold uppercase text-sm">
                                    {student.marker.name.charAt(0)}
                                  </div>
                                  <div className="space-y-0.5">
                                    <h4 className="text-sm font-semibold text-left">{student.marker.name}</h4>
                                    <p className="text-xs text-muted-foreground text-left capitalize">{student.marker.role}</p>
                                  </div>
                                </div>
                                
                                <div className="space-y-1.5 text-xs border-t pt-2">
                                  {student.marker.email && (
                                    <div className="flex items-center justify-between text-muted-foreground">
                                      <span>Email</span>
                                      <span className="text-foreground font-medium">{student.marker.email}</span>
                                    </div>
                                  )}
                                  {student.markedAt && (
                                    <div className="flex items-center justify-between text-muted-foreground">
                                      <span>Marked At</span>
                                      <span className="text-foreground font-medium">
                                        {format(new Date(student.markedAt), "MMM d, yyyy h:mm a")}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="hidden md:block">
                      {student.admissionNo}
                    </TableCell>

                    <TableCell>
                      {isLocked ? (
                        <Badge variant="outline" className="gap-1.5 capitalize">
                          {currentOption && (
                            <currentOption.icon
                              className={cn("h-3 w-3", currentOption.color)}
                            />
                          )}
                          {currentStatus || "Unmarked"}
                        </Badge>
                      ) : (
                        <div className="relative">
                          <Select
                            value={currentStatus || ""}
                            onValueChange={(value) =>
                              handleStatusChange(
                                student.classStudentId,
                                value as AttendanceStatus,
                              )
                            }
                          >
                            <SelectTrigger
                              className={cn(
                                "mx-auto md:mx-0",
                                hasStudentChanges &&
                                  "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20",
                              )}
                            >
                              <SelectValue placeholder="Unmarked" />
                            </SelectTrigger>

                            <SelectContent>
                              {statusOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  <div className="flex items-center gap-2">
                                    <option.icon
                                      className={cn(
                                        "h-3.5 w-3.5",
                                        option.color,
                                      )}
                                    />
                                    {option.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {hasStudentChanges && (
                            <div className="absolute -top-1 -right-1">
                              <div className="h-2 w-2 rounded-full bg-amber-500" />
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>

                    {/* Remarks */}
                    <TableCell className="hidden md:block">
                      {isLocked ? (
                        <span className="text-sm text-muted-foreground">
                          {currentRemarks || "-"}
                        </span>
                      ) : (
                        <div className="relative">
                          <Input
                            placeholder="Optional remarks"
                            value={currentRemarks}
                            onChange={(e) =>
                              handleRemarksChange(
                                student.classStudentId,
                                e.target.value,
                              )
                            }
                            className={cn(
                              "max-w-60",
                              hasStudentChanges &&
                                "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20",
                            )}
                          />
                          {hasStudentChanges && (
                            <div className="absolute -top-1 -right-1">
                              <div className="h-2 w-2 rounded-full bg-amber-500" />
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
});
