// ==================== Enums ====================

export enum ExamType {
  UNIT_TEST = "unit_test",
  MID_TERM = "mid_term",
  FINAL = "final",
  OTHER = "other",
}

export enum ExamStatus {
  DRAFT = "draft",
  SCHEDULED = "scheduled",
  ONGOING = "ongoing",
  COMPLETED = "completed",
}

export enum ExamClassStatus {
  PENDING = "pending",
  ACTIVE = "active",
  COMPLETED = "completed",
}

export enum ExamComponentStatus {
  PENDING = "pending",
  SCHEDULED = "scheduled",
  ONGOING = "ongoing",
  MARKS_ENTRY = "marks_entry",
  COMPLETED = "completed",
}

export enum MarksType {
  NUMBER = "number",
  GRADE = "grade",
}

export enum AdmitCardPolicyType {
  ALL_CLEAR = "all_clear",
  SPECIFIC_TYPES = "specific_types",
  DATE_BASED = "date_based",
}

// ==================== Exam Types ====================

export interface Exam {
  id: number;
  name: string;
  type: ExamType;
  startDate: string;
  endDate: string;
  sessionId: number;
  includeInFinalResult: boolean;
  weightage: number | null;
  status: ExamStatus;
  resultPublished: boolean;
  resultPublishedAt: string | null;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  session?: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
  };
  examClasses?: ExamClass[];
}

export interface ExamClass {
  id: number;
  examId: number;
  classId: number;
  sessionId: number;
  status: ExamClassStatus;
  marksEntryCompleted: boolean;
  marksEntryCompletedAt: string | null;
  class?: {
    id: number;
    name: string;
    section: string;
  };
  subjects?: ExamSubject[];
}

export interface ExamSubject {
  id: number;
  examClassId: number;
  subjectId: number;
  subject?: {
    id: number;
    name: string;
    marksType: string;
  };
  components?: ExamComponent[];
}

export interface ExamComponent {
  id: number;
  examSubjectId: number;
  subjectComponentId: number;
  maxMarks: number;
  passingMarks: number;
  marksType: MarksType;
  status: ExamComponentStatus;
  marksEntryCompleted: boolean;
  marksEntryCompletedAt: string | null;
  scheduledDate: string | null;
  subjectComponent?: {
    id: number;
    name: string;
    type: string;
    displayOrder: number;
  };
  schedules?: ExamSchedule[];
}

export interface ExamSchedule {
  id: number;
  examComponentId: number;
  academicBatchId: number;
  academicDayId: number;
  startTime: string;
  endTime: string;
  room: string | null;
  invigilatorId: number | null;
  isPublished: boolean;
  batch?: {
    id: number;
    name: string;
  };
  day?: {
    id: number;
    date: string;
    isHoliday: boolean;
  };
  invigilator?: {
    id: number;
    user?: {
      id: number;
      name: string;
    };
  };
}

// ==================== Admit Card Types ====================

export interface AdmitCardPolicy {
  id: number;
  policyType: AdmitCardPolicyType;
  allowedSources: string[];
  cutoffDate: string | null;
  graceDays: number | null;
  minPaidPercentage: number | null;
  isActive: boolean;
  sessionId: number;
  examId: number;
}

export interface AdmitCardEligibility {
  isEligible: boolean;
  reasons: string[];
  feeStatus: {
    totalDue: number;
    paidPercentage: number;
    isFeeClear: boolean;
  };
}

export interface AdmitCard {
  exam: {
    id: number;
    name: string;
    type: string;
    startDate: string;
    endDate: string;
  };
  student: {
    id: number;
    name: string;
    admissionNo: string;
    className: string;
    section: string;
    rollNumber?: string;
    photo?: string;
  };
  schedule: Array<{
    componentId: number;
    componentName: string;
    subjectName: string;
    date: string;
    day: string;
    startTime: string;
    endTime: string;
    room: string;
    invigilatorName?: string;
    maxMarks: number;
  }>;
  instructions: string[];
  isEligible: boolean;
  generatedAt: string;
}

// ==================== Marks Types ====================

export interface Mark {
  id: number;
  examComponentId: number;
  classStudentId: number;
  marksObtained: number | null;
  grade: string | null;
  isAbsent: boolean;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentMark {
  id: number;
  classStudentId: number;
  studentName: string;
  admissionNo: string;
  rollNumber?: string;
  marksObtained: number | null;
  grade: string | null;
  isAbsent: boolean;
  remarks: string | null;
  hasPassed: boolean | null;
  percentage: number | null;
}

export interface MarksByComponentResponse {
  component: {
    id: number;
    maxMarks: number;
    passingMarks: number;
    marksType: MarksType;
    subjectName: string;
    componentName: string;
  };
  marks: StudentMark[];
  summary: {
    totalStudents: number;
    presentCount: number;
    absentCount: number;
    passedCount: number;
    failedCount: number;
    averageMarks: number;
    highestMarks: number;
    lowestMarks: number;
  };
}

// ==================== Results Types ====================

export interface SubjectResult {
  subjectId: number;
  subjectName: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade?: string;
  components: Array<{
    componentName: string;
    maxMarks: number;
    obtainedMarks: number | null;
    isAbsent: boolean;
  }>;
}

export interface StudentResult {
  classStudentId: number;
  studentName: string;
  admissionNo: string;
  rollNumber?: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  result: "PASS" | "FAIL" | "ABSENT";
  subjects: SubjectResult[];
}

export interface PublishResultsResponse {
  exam: Exam;
  summary: {
    totalStudents: number;
    passedStudents: number;
    failedStudents: number;
    absentStudents: number;
    passPercentage: number;
  };
  results: StudentResult[];
}

export interface ExamStatusSummary {
  examStatus: ExamStatus;
  resultPublished: boolean;
  resultPublishedAt: string | null;
  totalClasses: number;
  totalComponents: number;
  completedComponents: number;
  progressPercentage: number;
  classes: Array<{
    classId: number;
    className: string;
    status: ExamClassStatus;
    marksEntryCompleted: boolean;
  }>;
}

// ==================== Request Types ====================

export interface CreateExamRequest {
  name: string;
  type: ExamType;
  startDate: string;
  endDate: string;
  sessionId: number;
  includeInFinalResult?: boolean;
  weightage?: number;
}

export interface UpdateExamRequest {
  name?: string;
  type?: ExamType;
  startDate?: string;
  endDate?: string;
  includeInFinalResult?: boolean;
  weightage?: number;
}

export interface AssignExamToClassRequest {
  examId: number;
  classIds: number[];
}

export interface AddExamSubjectRequest {
  examId: number;
  classId: number;
  subjectId: number;
}

export interface AddExamComponentRequest {
  examSubjectId: number;
  subjectComponentId: number;
  maxMarks: number;
  passingMarks: number;
  marksType?: MarksType;
}

export interface CreateExamScheduleRequest {
  examComponentId: number;
  academicBatchId: number;
  academicDayId: number;
  startTime: string;
  endTime: string;
  room?: string;
  invigilatorId?: number;
}

export interface EnterMarksRequest {
  examComponentId: number;
  marks: Array<{
    classStudentId: number;
    marksObtained?: number;
    grade?: string;
    isAbsent?: boolean;
    remarks?: string;
  }>;
}

export interface ExamFilters {
  sessionId?: number;
  status?: ExamStatus;
  search?: string;
}

// ==================== API Response Types ====================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
