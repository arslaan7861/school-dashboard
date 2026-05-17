// types.student.ts

import {
  CreateStudentFormValues,
  UpdateStudentFormValues,
} from "./validator.student";

export type { CreateStudentFormValues, UpdateStudentFormValues };

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// User info within student
export interface StudentUser {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  isActive: boolean;
  profilePic: string | null;
}

// Class relation info
export interface StudentClassRelation {
  id: number;
  rollNumber: number;
  classId: number;
  sessionId: number;
}

// Class info
export interface StudentClass {
  id: number;
  name: string;
  section: string;
}

// Main Student interface for listing
export interface StudentListItem {
  id: number;
  aadhaarNumber: string;
  address?: string;
  admissionNo: string;
  name: string;
  gender: "male" | "female" | "other" | null;
  dob: string | null;
  fatherName: string | null;
  fatherPhone: string | null;
  motherName: string | null;
  motherPhone: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  user: StudentUser;
  classRelation: StudentClassRelation | null;
  class: StudentClass | null;
  enrollmentStatus: "enrolled" | "unenrolled";
  createdAt: string;
  updatedAt: string;
}

// Class relation with details
export interface StudentClassRelationDetail {
  id: number;
  rollNumber: number;
  classId: number;
  className: string;
  classSection: string;
  sessionId: number;
  sessionName: string;
}

// Updated StudentDetail with class relation
export interface StudentDetail {
  id: number;
  admissionNo: string;
  aadhaarNumber: string;
  address?: string;
  name: string;
  gender: "male" | "female" | "other" | null;
  dob: string | null;
  fatherName: string | null;
  fatherPhone: string | null;
  motherName: string | null;
  motherPhone: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  user: StudentUser;
  classRelation: StudentClassRelationDetail | null;
  createdAt: string;
  updatedAt: string;
}

// Class option for dropdown filter
export interface ClassOption {
  id: number;
  name: string;
  section: string;
  displayName: string;
}

// Pagination info
export interface PaginationInfo {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
}

// Filters used in the request
export interface StudentFilters {
  sessionId: number;
  classId: number | null;
  showUnenrolled: boolean;
  search: string | null;
}

// Response for students listing
export interface StudentsListResponseData {
  students: StudentListItem[];
  classes: ClassOption[];
  pagination: PaginationInfo;
  filters: StudentFilters;
}

export type StudentsListResponse = ApiResponse<StudentsListResponseData>;

// Response for single student
export type StudentDetailResponse = ApiResponse<StudentDetail>;

// Response for student by class
export interface StudentsByClassResponseData {
  students: StudentListItem[];
  class: StudentClass;
  pagination: PaginationInfo;
  filters: {
    search: string | null;
  };
}

export type StudentsByClassResponse = ApiResponse<StudentsByClassResponseData>;

// Query parameters for fetching students
export interface StudentsQueryParams {
  sessionId: number;
  classId?: number;
  showUnenrolled?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// Query parameters for fetching students by class
export interface StudentsByClassQueryParams {
  classId: number;
  search?: string;
  page?: number;
  limit?: number;
}

// For the listing page state
export interface StudentsPageState {
  students: StudentListItem[];
  classes: ClassOption[];
  pagination: PaginationInfo;
  filters: StudentFilters;
  isLoading: boolean;
  error: string | null;
}

// For the filter form
export interface StudentFilterForm {
  classId: string;
  showUnenrolled: boolean;
  search: string;
}
