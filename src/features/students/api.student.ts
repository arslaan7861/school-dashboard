import { api } from "@/lib/axios";
import {
  StudentsListResponse,
  StudentDetailResponse,
  StudentsByClassResponse,
  StudentsQueryParams,
  StudentsByClassQueryParams,
  CreateStudentFormValues,
  UpdateStudentFormValues,
  ApiResponse,
} from "./types.student";

const BASE_URL = "/students";

export const studentApi = {
  // Get students listing with filters
  getStudents: async (
    params: StudentsQueryParams,
  ): Promise<StudentsListResponse> => {
    const { sessionId, classId, showUnenrolled, search, page, limit } = params;

    const queryParams: Record<string, string> = {};

    if (classId) queryParams.classId = classId.toString();
    if (showUnenrolled !== undefined)
      queryParams.showUnenrolled = showUnenrolled.toString();
    if (search) queryParams.search = search;
    if (page) queryParams.page = page.toString();
    if (limit) queryParams.limit = limit.toString();

    return api.get(`${BASE_URL}/session/${sessionId}`, {
      params: queryParams,
    });
  },

  // Get students by class
  getStudentsByClass: async (
    params: StudentsByClassQueryParams,
  ): Promise<StudentsByClassResponse> => {
    const { classId, search, page, limit } = params;

    const queryParams: Record<string, string> = {};

    if (search) queryParams.search = search;
    if (page) queryParams.page = page.toString();
    if (limit) queryParams.limit = limit.toString();

    return api.get(`${BASE_URL}/class/${classId}`, {
      params: queryParams,
    });
  },

  // Get student by ID
  getStudentById: async (studentId: number): Promise<StudentDetailResponse> => {
    return api.get(`${BASE_URL}/${studentId}`);
  },

  // Create student
  createStudent: async (
    data: CreateStudentFormValues,
    profileImage?: File,
  ): Promise<StudentDetailResponse> => {
    const formData = new FormData();

    // Append all fields to FormData
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, value.toString());
      }
    });

    // Append image if provided
    if (profileImage) {
      formData.append("image", profileImage);
    }

    return api.post(BASE_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Update student
  updateStudent: async (
    studentId: number,
    data: UpdateStudentFormValues,
    profileImage?: File,
  ): Promise<StudentDetailResponse> => {
    const formData = new FormData();

    // Append all fields to FormData
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, value.toString());
      }
    });

    // Append image if provided
    if (profileImage) {
      formData.append("image", profileImage);
    }

    return api.put(`${BASE_URL}/${studentId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Delete student
  deleteStudent: async (studentId: number): Promise<ApiResponse<null>> => {
    return api.delete(`${BASE_URL}/${studentId}`);
  },
};
