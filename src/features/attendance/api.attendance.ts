import { api } from "@/lib/axios";
import {
  ApiResponse,
  Attendance,
  AttendanceByDayResponse,
  AttendanceByStudentResponse,
  AttendanceByClassResponse,
  AttendanceSummaryResponse,
  BulkMarkAttendanceRequest,
  BulkMarkAttendanceResponse,
  LockUnlockResponse,
  MarkAttendanceRequest,
} from "./types.attendance";

const BASE_URL = "/attendance";

// ==================== Mark Attendance APIs ====================

export const attendanceApi = {
  // Mark single student attendance
  markAttendance: (
    data: MarkAttendanceRequest,
  ): Promise<ApiResponse<Attendance>> => api.post(`${BASE_URL}/`, data),

  // Bulk mark attendance for a class
  bulkMarkAttendance: (
    data: BulkMarkAttendanceRequest,
  ): Promise<ApiResponse<BulkMarkAttendanceResponse>> =>
    api.post(`${BASE_URL}/bulk`, data),

  // ==================== Get Attendance APIs ====================

  // Get attendance by academic day
  getAttendanceByDay: (
    academicDayId: number,
    classId?: number,
  ): Promise<ApiResponse<AttendanceByDayResponse>> =>
    api.get(`${BASE_URL}/day/${academicDayId}`, { params: { classId } }),

  // Get attendance by student
  getAttendanceByStudent: (
    classStudentId: number,
    fromDate?: string,
    toDate?: string,
    limit?: number,
  ): Promise<ApiResponse<AttendanceByStudentResponse>> =>
    api.get(`${BASE_URL}/student/${classStudentId}`, {
      params: { fromDate, toDate, limit },
    }),

  // Get attendance by class
  getAttendanceByClass: (
    classId: number,
    fromDate?: string,
    toDate?: string,
  ): Promise<ApiResponse<AttendanceByClassResponse>> =>
    api.get(`${BASE_URL}/class/${classId}`, {
      params: { fromDate, toDate },
    }),

  // Get attendance summary for a class
  getAttendanceSummary: (
    classId: number,
    sessionId?: number,
    fromDate?: string,
    toDate?: string,
  ): Promise<ApiResponse<AttendanceSummaryResponse>> =>
    api.get(`${BASE_URL}/summary/${classId}`, {
      params: { sessionId, fromDate, toDate },
    }),

  // ==================== Lock/Unlock Attendance APIs ====================

  // Lock attendance
  lockAttendance: (
    academicDayId: number,
    classId?: number,
  ): Promise<ApiResponse<LockUnlockResponse>> =>
    api.post(`${BASE_URL}/${academicDayId}/lock`, { classId }),

  // Unlock attendance
  unlockAttendance: (
    academicDayId: number,
    classId?: number,
  ): Promise<ApiResponse<LockUnlockResponse>> =>
    api.post(`${BASE_URL}/${academicDayId}/unlock`, { classId }),
};
