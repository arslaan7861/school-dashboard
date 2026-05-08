import { ApiSuccess } from "@/types/api";

/* ==================== ATTENDANCE TYPES ==================== */

export type AttendanceStatus = "present" | "absent" | "leave";

export interface DayAttendanceSummary {
  total: number;
  present: number;
  absent: number;
  leave: number;
  completionPercentage: number;
}

/* ==================== DAY SUMMARY TYPES ==================== */

export interface DaySummary {
  totalClasses: number;
  classesWithAttendance: number;
  lockedClasses: number;
  attendance: DayAttendanceSummary;
}

/* ==================== DAY TYPES ==================== */

export interface CalendarDayInfo {
  date: string;
  isHoliday: boolean;
  holidayDescription: string | null;
  summary: DaySummary;
  events: string[]; // Array of events happening on this day (holidays, exams, etc.)
}

/* ==================== DATE RANGE TYPES ==================== */

export interface DateRange {
  start: string;
  end: string;
}

/* ==================== OVERALL SUMMARY TYPES ==================== */

export interface CalendarMonthOverallSummary {
  totalDays: number;
  totalHolidays: number;
  totalClasses: number;
  totalAttendanceMarked: number;
  totalAttendanceRecords: number;
  averageAttendanceRate: number;
}

/* ==================== MAIN RESPONSE TYPES ==================== */

export interface CalendarMonthDashboardData {
  year: number;
  month: number;
  sessionId: number;
  dateRange: DateRange;
  days: CalendarDayInfo[];
  summary: CalendarMonthOverallSummary;
}

export type CalendarMonthDashboardResponse =
  ApiSuccess<CalendarMonthDashboardData>;

/* ==================== QUERY PARAMS TYPES ==================== */

export interface CalendarMonthDashboardParams {
  year: string;
  month: string;
  sessionId: string;
}

/* ==================== FILTERED VIEW TYPES ==================== */

export interface FilteredCalendarView {
  days: CalendarDayInfo[];
  totalDays: number;
  totalHolidays: number;
  daysWithEvents: CalendarDayInfo[];
  daysWithCompleteAttendance: CalendarDayInfo[];
  daysWithPendingAttendance: CalendarDayInfo[];
}

/* ==================== STATISTICS TYPES ==================== */

export interface DailyAttendanceTrend {
  date: string;
  presentPercentage: number;
  absentPercentage: number;
  leavePercentage: number;
  totalAttendance: number;
}

export interface MonthlyStatistics {
  dailyTrends: DailyAttendanceTrend[];
  bestAttendanceDay: {
    date: string;
    percentage: number;
  } | null;
  worstAttendanceDay: {
    date: string;
    percentage: number;
  } | null;
  averageDailyAttendance: number;
}
