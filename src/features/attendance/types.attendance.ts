// ==================== Enums ====================

export enum AttendanceStatus {
  PRESENT = "present",
  ABSENT = "absent",
  LEAVE = "leave",
  LATE = "late",
}

// ==================== Attendance Types ====================

export interface Attendance {
  id: number;
  academicDayId: number;
  classStudentId: number;
  status: AttendanceStatus;
  remarks: string | null;
  markedBy: number;
  createdAt: string;
  updatedAt: string;
  academicDay?: AcademicDay;
  student?: ClassStudentRelation;
  marker?: Teacher;
}

export interface AcademicDay {
  id: number;
  date: string;
  startTime: string | null;
  endTime: string | null;
  isHoliday: boolean;
  holidayTitle: string | null;
  holidayDescription: string | null;
  event: string | null;
  eventDescription: string | null;
  isAttendanceTaken: boolean;
  isAttendanceLocked: boolean;
  sessionId: number;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicDayOverride {
  id: number;
  academicDayId: number;
  classId: number;
  isHoliday: boolean | null;
  holidayTitle: string | null;
  holidayDescription: string | null;
  event: string | null;
  eventDescription: string | null;
  isAttendanceLocked: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClassStudentRelation {
  id: number;
  rollNumber: number;
  sessionId: number;
  studentId: number;
  classId: number;
  student?: Student;
  class?: Class;
}

export interface Student {
  id: number;
  admissionNo: string;
  name: string;
  gender: string | null;
  dob: string | null;
  fatherName: string | null;
  fatherPhone: string | null;
  motherName: string | null;
  motherPhone: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  userId: number;
  user?: User;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  profileImage?: ProfileImage;
}

export interface ProfileImage {
  id: number;
  secureUrl: string;
  publicId: string;
}

export interface Class {
  id: number;
  name: string;
  section: string;
  sessionId: number;
  classTeacherId: number;
}

export interface Teacher {
  id: number;
  userId: number;
  employeeCode: string;
  joiningDate: string;
  qualification: string;
  user?: User;
}

// ==================== Request/Response Types ====================

export interface MarkAttendanceRequest {
  academicDayId: number;
  classStudentId: number;
  status: AttendanceStatus;
  remarks?: string;
}

export interface BulkMarkAttendanceRequest {
  academicDayId: number;
  classId: number;
  attendance: Array<{
    classStudentId: number;
    status: AttendanceStatus;
    remarks?: string;
  }>;
}

export interface BulkMarkAttendanceResponse {
  total: number;
  success: number;
  failed: number;
  errors: Array<{
    classStudentId: number;
    error: string;
  }>;
}

// ==================== Attendance Response Types ====================

export interface AttendanceByDayResponse {
  academicDay: {
    id: number;
    date: string;
    isHoliday: boolean;
    isAttendanceLocked: boolean;
    isAttendanceTaken: boolean;
  };
  attendance: Array<{
    id: number;
    classStudentId: number;
    studentName: string;
    admissionNo: string;
    rollNumber: number;
    className: string;
    section: string;
    status: string;
    remarks: string | null;
    markedBy: string;
    markedAt: string;
  }>;
  summary: {
    totalStudents: number;
    present: number;
    absent: number;
    leave: number;
    late: number;
    notMarked: number;
  };
}

export interface AttendanceByStudentResponse {
  student: {
    id: number;
    name: string;
    admissionNo: string;
    className: string;
    section: string;
    rollNumber: number;
  };
  attendance: Array<{
    id: number;
    date: string;
    status: string;
    remarks: string | null;
    isHoliday: boolean;
    holidayTitle: string | null;
    event: string | null;
    markedBy: string;
  }>;
  summary: {
    totalDays: number;
    present: number;
    absent: number;
    leave: number;
    late: number;
    attendancePercentage: number;
  };
}

export interface AttendanceByClassResponse {
  classInfo: {
    id: number;
    name: string;
    section: string;
    totalStudents: number;
  };
  attendance: Array<{
    date: string;
    isHoliday: boolean;
    holidayTitle: string | null;
    totalStudents: number;
    present: number;
    absent: number;
    leave: number;
    late: number;
    notMarked: number;
    attendancePercentage: number;
  }>;
  summary: {
    totalDays: number;
    averageAttendance: number;
    bestDay: { date: string; percentage: number };
    worstDay: { date: string; percentage: number };
  };
}

export interface AttendanceSummaryResponse {
  classInfo: {
    id: number;
    name: string;
    section: string;
    totalStudents: number;
    sessionName: string;
  };
  overallSummary: {
    totalDays: number;
    averageAttendance: number;
    bestPerformer: StudentAttendanceSummary | null;
    needsAttention: StudentAttendanceSummary[];
  };
  studentSummaries: StudentAttendanceSummary[];
  monthlyBreakdown: MonthlySummary[];
}

export interface StudentAttendanceSummary {
  classStudentId: number;
  studentId: number;
  studentName: string;
  admissionNo: string;
  rollNumber: number;
  totalDays: number;
  present: number;
  absent: number;
  leave: number;
  late: number;
  attendancePercentage: number;
  status: "Good" | "Average" | "Poor" | "Critical";
}

export interface MonthlySummary {
  month: string;
  year: number;
  totalDays: number;
  present: number;
  absent: number;
  leave: number;
  late: number;
  attendancePercentage: number;
}

export interface LockUnlockResponse {
  academicDayId: number;
  locked: boolean;
  type: "global" | "class_specific";
  classId?: number;
}

// ==================== API Response Types ====================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
  };
}
