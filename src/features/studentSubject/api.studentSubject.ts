import { api } from "@/lib/axios";
import {
  EnrollmentsResponse,
  AddOptionalSubjectResponse,
  ChangeBatchResponse,
  RemoveSubjectResponse,
  GetSubjectsByClassResponse,
  AddOptionalSubjectBody,
  ChangeBatchBody,
  RemoveSubjectParams,
} from "./types.studentSubject";
import { GetSubjectsByClassQuery } from "./validator.studentSubject";

const BASE_URL = "/subjects";
const SUBJECTS_URL = "/subjects";

export const studentSubjectApi = {
  // Get all subjects by class
  getSubjectsByClass: async (
    classId: number,
    params: GetSubjectsByClassQuery,
  ): Promise<GetSubjectsByClassResponse> => {
    const queryParams: Record<string, string> = {
      sessionId: params.sessionId.toString(),
      includeDetails: params.includeDetails ? "true" : "false",
    };

    if (params.isOptional !== undefined) {
      queryParams.isOptional = params.isOptional ? "true" : "false";
    }
    if (params.isElective !== undefined) {
      queryParams.isElective = params.isElective ? "true" : "false";
    }
    if (params.search) {
      queryParams.search = params.search;
    }

    return api.get(`${SUBJECTS_URL}/class/${classId}`, { params: queryParams });
  },

  // Get enrolled subjects
  getEnrolledSubjects: async (
    classStudentId: number,
  ): Promise<EnrollmentsResponse> => {
    return api.get(`${BASE_URL}/student/${classStudentId}`);
  },

  // Add optional subject
  addOptionalSubject: async (
    data: AddOptionalSubjectBody,
  ): Promise<AddOptionalSubjectResponse> => {
    return api.post(`${BASE_URL}/add`, data);
  },

  // Change batch
  changeBatch: async (
    enrollmentId: number,
    data: ChangeBatchBody,
  ): Promise<ChangeBatchResponse> => {
    return api.put(`${BASE_URL}/changebatch/${enrollmentId}`, data);
  },

  // Remove subject
  removeSubject: async (
    params: RemoveSubjectParams,
  ): Promise<RemoveSubjectResponse> => {
    return api.delete(
      `${BASE_URL}/remove-subject/${params.classStudentId}/${params.subjectId}`,
    );
  },
};
