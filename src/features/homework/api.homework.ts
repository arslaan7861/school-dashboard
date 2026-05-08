import { api } from "@/lib/axios";
import {
  ApiResponse,
  Homework,
  PaginatedResponse,
  CreateHomeworkRequest,
  BulkCreateHomeworkRequest,
  BulkCreateHomeworkResponse,
  UpdateHomeworkRequest,
  HomeworkFilters,
  StudentHomeworkFilters,
  HomeworkAttachment,
} from "./types.homework";
import { toast } from "sonner";

const BASE_URL = "/homework";

// Helper to convert File to FormData
const createFormData = (data: any, files?: File[] | File[][]): FormData => {
  const formData = new FormData();

  // Append JSON data
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      formData.append(key, JSON.stringify(value));
    }
  }

  // Append files
  if (files) {
    if (Array.isArray(files) && files[0] instanceof File) {
      // Single array of files (for single homework)
      (files as File[]).forEach((file) => {
        formData.append("files", file);
      });
    } else if (Array.isArray(files) && Array.isArray(files[0])) {
      // 2D array for bulk assignments - send with assignment index
      (files as File[][]).forEach((fileArray, assignmentIndex) => {
        fileArray.forEach((file) => {
          // Append with index to identify which assignment the file belongs to
          formData.append(`files_${assignmentIndex}`, file);
        });
      });
    }
  }

  return formData;
};

export const homeworkApi = {
  // Create homework with attachments
  create: (data: CreateHomeworkRequest): Promise<ApiResponse<Homework>> => {
    const formData = createFormData(
      {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        classId: data.classId,
        subjectId: data.subjectId,
        sessionId: data.sessionId,
      },
      data.files,
    );
    return api.post(`${BASE_URL}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getAll: (filters?: {
    subjectId?: number;
    fromDate?: string;
    toDate?: string;
    search?: string;
    classId?: number;
    sessionId: number; // Required
  }): Promise<ApiResponse<Homework[]>> =>
    api.get(`${BASE_URL}/`, { params: filters }),
  // Bulk create homework
  bulkCreate: (
    data: BulkCreateHomeworkRequest,
  ): Promise<ApiResponse<BulkCreateHomeworkResponse>> => {
    const formData = createFormData(
      {
        assignments: data.assignments,
        classId: data.classId,
        sessionId: data.sessionId,
      },
      data.files,
    );
    return api.post(`${BASE_URL}/bulk`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Get homework by class
  getByClass: (
    classId: number,
    filters?: HomeworkFilters,
  ): Promise<ApiResponse<Homework[]>> =>
    api.get(`${BASE_URL}/class/${classId}`, { params: filters }),

  // Get homework by ID
  getById: (homeworkId: number): Promise<ApiResponse<Homework>> =>
    api.get(`${BASE_URL}/${homeworkId}`),

  // Update homework
  update: (
    homeworkId: number,
    data: UpdateHomeworkRequest,
  ): Promise<ApiResponse<Homework>> =>
    api.put(`${BASE_URL}/${homeworkId}`, data),

  // Delete homework
  delete: (homeworkId: number): Promise<ApiResponse<void>> =>
    api.delete(`${BASE_URL}/${homeworkId}`),

  // Get homework for student
  getForStudent: (
    classStudentId: number,
    filters?: StudentHomeworkFilters,
  ): Promise<ApiResponse<Homework[]>> =>
    api.get(`${BASE_URL}/student/${classStudentId}`, { params: filters }),

  // Add attachment
  addAttachment: (
    homeworkId: number,
    file: File,
  ): Promise<ApiResponse<HomeworkAttachment>> => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`${BASE_URL}/${homeworkId}/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Delete attachment
  deleteAttachment: (attachmentId: number): Promise<ApiResponse<void>> =>
    api.delete(`${BASE_URL}/attachments/${attachmentId}`),
};
