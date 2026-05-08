import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "./api.attendance";
import {
  MarkAttendanceRequest,
  BulkMarkAttendanceRequest,
} from "./types.attendance";

// ==================== Query Keys ====================

export const attendanceKeys = {
  all: ["attendance"] as const,
  byDay: (academicDayId: number, classId?: number) =>
    [...attendanceKeys.all, "day", academicDayId, classId] as const,
  byStudent: (
    classStudentId: number,
    fromDate?: string,
    toDate?: string,
    limit?: number,
  ) =>
    [
      ...attendanceKeys.all,
      "student",
      classStudentId,
      { fromDate, toDate, limit },
    ] as const,
  byClass: (classId: number, fromDate?: string, toDate?: string) =>
    [...attendanceKeys.all, "class", classId, { fromDate, toDate }] as const,
  summary: (
    classId: number,
    sessionId?: number,
    fromDate?: string,
    toDate?: string,
  ) =>
    [
      ...attendanceKeys.all,
      "summary",
      classId,
      { sessionId, fromDate, toDate },
    ] as const,
};

// ==================== Query Hooks ====================

export const useAttendanceByDay = (academicDayId: number, classId?: number) => {
  return useQuery({
    queryKey: attendanceKeys.byDay(academicDayId, classId),
    queryFn: () =>
      attendanceApi
        .getAttendanceByDay(academicDayId, classId)
        .then((res) => res.data),
    enabled: !!academicDayId,
  });
};

export const useAttendanceByStudent = (
  classStudentId: number,
  fromDate?: string,
  toDate?: string,
  limit?: number,
) => {
  return useQuery({
    queryKey: attendanceKeys.byStudent(classStudentId, fromDate, toDate, limit),
    queryFn: () =>
      attendanceApi
        .getAttendanceByStudent(classStudentId, fromDate, toDate, limit)
        .then((res) => res.data),
    enabled: !!classStudentId,
  });
};

export const useAttendanceByClass = (
  classId: number,
  fromDate?: string,
  toDate?: string,
) => {
  return useQuery({
    queryKey: attendanceKeys.byClass(classId, fromDate, toDate),
    queryFn: () =>
      attendanceApi
        .getAttendanceByClass(classId, fromDate, toDate)
        .then((res) => res.data),
    enabled: !!classId,
  });
};

export const useAttendanceSummary = (
  classId: number,
  sessionId?: number,
  fromDate?: string,
  toDate?: string,
) => {
  return useQuery({
    queryKey: attendanceKeys.summary(classId, sessionId, fromDate, toDate),
    queryFn: () =>
      attendanceApi
        .getAttendanceSummary(classId, sessionId, fromDate, toDate)
        .then((res) => res.data),
    enabled: !!classId,
  });
};

// ==================== Mutation Hooks ====================

export const useMarkAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MarkAttendanceRequest) =>
      attendanceApi.markAttendance(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.byDay(data.academicDayId),
      });
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.byStudent(data.classStudentId),
      });
    },
  });
};

export const useBulkMarkAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkMarkAttendanceRequest) =>
      attendanceApi.bulkMarkAttendance(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.byDay(data.academicDayId),
      });
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.byClass(data.classId),
      });
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.summary(data.classId),
      });
    },
  });
};

export const useLockAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      academicDayId,
      classId,
    }: {
      academicDayId: number;
      classId?: number;
    }) => attendanceApi.lockAttendance(academicDayId, classId),
    onSuccess: (_, { academicDayId, classId }) => {
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.byDay(academicDayId, classId),
      });
    },
  });
};

export const useUnlockAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      academicDayId,
      classId,
    }: {
      academicDayId: number;
      classId?: number;
    }) => attendanceApi.unlockAttendance(academicDayId, classId),
    onSuccess: (_, { academicDayId, classId }) => {
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.byDay(academicDayId, classId),
      });
    },
  });
};
