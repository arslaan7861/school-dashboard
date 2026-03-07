import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { studentSubjectApi } from "./api.studentSubject";
import {
  AddOptionalSubjectBody,
  ChangeBatchBody,
  RemoveSubjectParams,
} from "./types.studentSubject";
import { GetSubjectsByClassQuery } from "./validator.studentSubject";
import { ApiError } from "@/types/api";

// Query keys
export const studentSubjectKeys = {
  all: ["student-subjects"] as const,
  subjects: (classId?: number, params?: GetSubjectsByClassQuery) =>
    [...studentSubjectKeys.all, "subjects", classId, params] as const,
  enrollments: (classStudentId?: number) =>
    [...studentSubjectKeys.all, "enrollments", classStudentId] as const,
};

// Get all subjects by class
export const useSubjectsByClass = (
  classId?: number,
  params?: GetSubjectsByClassQuery,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: studentSubjectKeys.subjects(classId, params),
    queryFn: async () => {
      if (!classId) throw new Error("Class ID is required");
      if (!params?.sessionId) throw new Error("Session ID is required");
      const response = await studentSubjectApi.getSubjectsByClass(
        classId,
        params,
      );
      return response.data;
    },
    enabled: !!classId && !!params?.sessionId && enabled,
  });
};

// Get enrolled subjects
export const useEnrolledSubjects = (
  classStudentId?: number,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: studentSubjectKeys.enrollments(classStudentId),
    queryFn: async () => {
      if (!classStudentId) throw new Error("Class student ID is required");
      const response =
        await studentSubjectApi.getEnrolledSubjects(classStudentId);
      return response.data;
    },
    enabled: !!classStudentId && enabled,
  });
};

// Student subject mutations
export const useStudentSubjectMutations = (classStudentId?: number) => {
  const queryClient = useQueryClient();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({
      queryKey: studentSubjectKeys.enrollments(classStudentId),
    });
    queryClient.invalidateQueries({
      queryKey: studentSubjectKeys.subjects(),
    });
  };

  // Add optional subject
  const addOptionalSubject = useMutation({
    mutationFn: (data: AddOptionalSubjectBody) =>
      studentSubjectApi.addOptionalSubject(data),
    onSuccess: (response) => {
      toast.success(response.message || "Subject added successfully");
      invalidateQueries();
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to add subject");
    },
  });

  // Change batch
  const changeBatch = useMutation({
    mutationFn: ({
      enrollmentId,
      data,
    }: {
      enrollmentId: number;
      data: ChangeBatchBody;
    }) => studentSubjectApi.changeBatch(enrollmentId, data),
    onSuccess: (response) => {
      toast.success(response.message || "Batch changed successfully");
      invalidateQueries();
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to change batch");
    },
  });

  // Remove subject
  const removeSubject = useMutation({
    mutationFn: (params: RemoveSubjectParams) =>
      studentSubjectApi.removeSubject(params),
    onSuccess: (response) => {
      toast.success(response.message || "Subject removed successfully");
      invalidateQueries();
    },
    onError: (error: ApiError) => {
      toast.error(error?.message || "Failed to remove subject");
    },
  });

  return {
    addOptionalSubject: addOptionalSubject.mutate,
    addOptionalSubjectAsync: addOptionalSubject.mutateAsync,
    changeBatch: changeBatch.mutate,
    changeBatchAsync: changeBatch.mutateAsync,
    removeSubject: removeSubject.mutate,
    removeSubjectAsync: removeSubject.mutateAsync,
    isAdding: addOptionalSubject.isPending,
    isChangingBatch: changeBatch.isPending,
    isRemoving: removeSubject.isPending,
  };
};
