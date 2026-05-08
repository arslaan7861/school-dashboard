import { api } from "@/lib/axios";
import {
  ApiResponse,
  Exam,
  ExamClass,
  ExamSubject,
  ExamComponent,
  ExamSchedule,
  Mark,
  MarksByComponentResponse,
  PublishResultsResponse,
  ExamStatusSummary,
  AdmitCardEligibility,
  AdmitCard,
  CreateExamRequest,
  UpdateExamRequest,
  AssignExamToClassRequest,
  AddExamSubjectRequest,
  AddExamComponentRequest,
  CreateExamScheduleRequest,
  EnterMarksRequest,
  ExamFilters,
} from "./types.exam";

const BASE_URL = "/exams";

// ==================== Exam CRUD APIs ====================

export const examApi = {
  // Create exam
  create: (data: CreateExamRequest): Promise<ApiResponse<Exam>> =>
    api.post(`${BASE_URL}/`, data),

  // Get all exams
  getAll: (filters?: ExamFilters): Promise<ApiResponse<Exam[]>> =>
    api.get(`${BASE_URL}/`, { params: filters }),

  // Get exam by ID
  getById: (
    examId: number,
    includeDetails?: boolean,
  ): Promise<ApiResponse<Exam>> =>
    api.get(`${BASE_URL}/${examId}`, { params: { includeDetails } }),

  // Update exam
  update: (
    examId: number,
    data: UpdateExamRequest,
  ): Promise<ApiResponse<Exam>> => api.put(`${BASE_URL}/${examId}`, data),

  // Delete exam
  delete: (examId: number): Promise<ApiResponse<void>> =>
    api.delete(`${BASE_URL}/${examId}`),

  // ==================== Configuration APIs ====================

  // Assign exam to classes
  assignToClasses: (
    data: AssignExamToClassRequest,
  ): Promise<ApiResponse<ExamClass[]>> =>
    api.post(`${BASE_URL}/assign-classes`, data),

  // Add subject to exam
  addSubject: (
    data: AddExamSubjectRequest,
  ): Promise<ApiResponse<ExamSubject>> =>
    api.post(`${BASE_URL}/subjects`, data),

  // Add component to subject
  addComponent: (
    data: AddExamComponentRequest,
  ): Promise<ApiResponse<ExamComponent>> =>
    api.post(`${BASE_URL}/components`, data),

  // Create exam schedule
  createSchedule: (
    data: CreateExamScheduleRequest,
  ): Promise<ApiResponse<ExamSchedule>> =>
    api.post(`${BASE_URL}/schedules`, data),

  // ==================== Marks APIs ====================

  // Enter marks for a component
  enterMarks: (data: EnterMarksRequest): Promise<ApiResponse<Mark[]>> =>
    api.post(`${BASE_URL}/marks`, data),

  // Get marks by component
  getMarksByComponent: (
    examComponentId: number,
  ): Promise<ApiResponse<MarksByComponentResponse>> =>
    api.get(`${BASE_URL}/marks/component/${examComponentId}`),

  // ==================== Status & Results APIs ====================

  // Update exam status
  updateStatus: (examId: number, status: string): Promise<ApiResponse<Exam>> =>
    api.patch(`${BASE_URL}/${examId}/status`, { status }),

  // Get exam status summary
  getStatusSummary: (examId: number): Promise<ApiResponse<ExamStatusSummary>> =>
    api.get(`${BASE_URL}/${examId}/status-summary`),

  // Publish exam results
  publishResults: (
    examId: number,
  ): Promise<ApiResponse<PublishResultsResponse>> =>
    api.post(`${BASE_URL}/${examId}/publish-results`),

  // ==================== Admit Card APIs ====================

  // Check admit card eligibility
  checkEligibility: (
    examId: number,
    classStudentId: number,
  ): Promise<ApiResponse<AdmitCardEligibility>> =>
    api.get(`${BASE_URL}/${examId}/student/${classStudentId}/eligibility`),

  // Generate admit card
  generateAdmitCard: (
    examId: number,
    classStudentId: number,
  ): Promise<ApiResponse<AdmitCard>> =>
    api.get(`${BASE_URL}/${examId}/student/${classStudentId}/admit-card`),
};
