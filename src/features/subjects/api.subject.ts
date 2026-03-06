import { api } from "@/lib/axios";
import {
  Subject,
  ApiResponse,
  CreateMultipleSubjectsPayload,
  UpdateSubjectData,
} from "./types.subject";

const BASE_URL = "/subjects";

export const subjectApi = {
  // Create multiple subjects
  createMultiple: async (
    payload: CreateMultipleSubjectsPayload,
  ): Promise<ApiResponse<Subject[]>> => {
    // The interceptor already returns response.data
    return api.post(`${BASE_URL}/bulk`, payload);
  },

  // Get subjects by class
  getByClass: async (
    classId: number,
    params?: {
      includeDetails?: boolean;
      isOptional?: boolean;
      isElective?: boolean;
      search?: string;
    },
  ): Promise<ApiResponse<Subject[]>> => {
    const queryParams: Record<string, string> = {};

    if (params?.includeDetails)
      queryParams.includeDetails = params.includeDetails ? "true" : "false";
    if (params?.isOptional !== undefined)
      queryParams.isOptional = params.isOptional ? "true" : "false";
    if (params?.isElective !== undefined)
      queryParams.isElective = params.isElective ? "true" : "false";
    if (params?.search) queryParams.search = params.search;

    // The interceptor already returns response.data
    return api.get(`${BASE_URL}/class/${classId}`, {
      params: queryParams,
    });
  },

  // Get subject by ID
  getById: async (subjectId: number): Promise<ApiResponse<Subject>> => {
    // The interceptor already returns response.data
    return api.get(`${BASE_URL}/${subjectId}`);
  },

  // Update subject fully
  update: async (
    subjectId: number,
    data: UpdateSubjectData,
  ): Promise<ApiResponse<Subject>> => {
    // The interceptor already returns response.data
    return api.put(`${BASE_URL}/${subjectId}`, data);
  },

  // Delete subject
  delete: async (subjectId: number): Promise<ApiResponse<null>> => {
    // The interceptor already returns response.data
    return api.delete(`${BASE_URL}/${subjectId}`);
  },
};
