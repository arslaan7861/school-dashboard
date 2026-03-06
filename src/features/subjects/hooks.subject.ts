"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { subjectApi } from "./api.subject";
import {
  CreateMultipleSubjectsPayload,
  UpdateSubjectData,
} from "./types.subject";

// Query keys
export const subjectKeys = {
  all: ["subjects"] as const,
  lists: () => [...subjectKeys.all, "list"] as const,
  list: (classId?: number) => [...subjectKeys.lists(), classId] as const,
  listWithFilters: (classId?: number, includeDetails?: boolean) =>
    [...subjectKeys.list(classId), { includeDetails }] as const,
  details: () => [...subjectKeys.all, "detail"] as const,
  detail: (id: number) => [...subjectKeys.details(), id] as const,
};

// Helper to invalidate all list queries for a specific class
const invalidateClassLists = (queryClient: any, classId: number) => {
  // Invalidate the base list key
  queryClient.invalidateQueries({
    queryKey: subjectKeys.list(classId),
  });

  // Also invalidate any list queries that start with the class list pattern
  queryClient.invalidateQueries({
    predicate: (query: any) => {
      const queryKey = query.queryKey;
      return (
        Array.isArray(queryKey) &&
        queryKey[0] === "subjects" &&
        queryKey[1] === "list" &&
        queryKey[2] === classId
      );
    },
  });
};

// Get subjects by class
export const useSubjectsByClass = (
  classId?: number,
  options?: {
    includeDetails?: boolean;
    enabled?: boolean;
  },
) => {
  const { includeDetails = true, enabled = true } = options || {};

  return useQuery({
    queryKey: subjectKeys.listWithFilters(classId, includeDetails),
    queryFn: async () => {
      if (!classId) throw new Error("Class ID is required");

      const response = await subjectApi.getByClass(classId, {
        includeDetails,
      });

      return response.data;
    },
    enabled: !!classId && enabled,
  });
};

// Get single subject
export const useSubject = (subjectId?: number) => {
  return useQuery({
    queryKey: subjectKeys.detail(subjectId!),
    queryFn: async () => {
      if (!subjectId) throw new Error("Subject ID is required");

      const response = await subjectApi.getById(subjectId);

      if (!response?.data) {
        throw new Error("Subject not found");
      }

      return response.data;
    },
    enabled: !!subjectId,
    retry: false,
  });
};

// Subject CRUD operations
export const useSubjectCrud = () => {
  const queryClient = useQueryClient();

  // Helper to get classId from various sources
  const getClassId = async (subjectId: number): Promise<number | null> => {
    // Try to get from cache first
    const cached = queryClient.getQueryData(
      subjectKeys.detail(subjectId),
    ) as any;
    if (cached?.classId) return cached.classId;

    // If not in cache, fetch it
    try {
      const response = await subjectApi.getById(subjectId);
      return response.data?.classId || null;
    } catch {
      return null;
    }
  };

  // Create multiple subjects
  const createMultiple = useMutation({
    mutationFn: (payload: CreateMultipleSubjectsPayload) =>
      subjectApi.createMultiple(payload),
    onSuccess: (response, variables) => {
      toast.success(response?.message || "Subjects created successfully");

      // Get classId from the first subject
      const classId = variables.subjects[0]?.classId;
      if (classId) {
        invalidateClassLists(queryClient, classId);
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create subjects");
    },
  });

  // Update subject
  const update = useMutation({
    mutationFn: ({
      subjectId,
      data,
    }: {
      subjectId: number;
      data: UpdateSubjectData;
    }) => subjectApi.update(subjectId, data),
    onSuccess: async (response, variables) => {
      toast.success(response?.message || "Subject updated successfully");

      // Get classId from response or fetch it
      const classId =
        response?.data?.classId || (await getClassId(variables.subjectId));

      // Invalidate detail query
      queryClient.invalidateQueries({
        queryKey: subjectKeys.detail(variables.subjectId),
      });

      // Invalidate all list queries for this class
      if (classId) {
        invalidateClassLists(queryClient, classId);
      }

      // Also update the cache with the new data
      queryClient.setQueryData(
        subjectKeys.detail(variables.subjectId),
        response.data,
      );
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update subject");
    },
  });

  // Delete subject
  const deleteSubject = useMutation({
    mutationFn: (subjectId: number) => subjectApi.delete(subjectId),
    onSuccess: async (response, subjectId) => {
      toast.success(response?.message || "Subject deleted successfully");

      // Get classId from cache or fetch it before removal
      const classId = await getClassId(subjectId);

      // Remove the detail query from cache
      queryClient.removeQueries({
        queryKey: subjectKeys.detail(subjectId),
      });

      // Invalidate all list queries for this class
      if (classId) {
        invalidateClassLists(queryClient, classId);
      } else {
        // Fallback: invalidate all subject lists
        queryClient.invalidateQueries({
          queryKey: subjectKeys.lists(),
        });
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete subject");
    },
  });

  // Bulk delete subjects
  const bulkDelete = useMutation({
    mutationFn: (subjectIds: number[]) =>
      Promise.all(subjectIds.map((id) => subjectApi.delete(id))),
    onSuccess: async (responses, subjectIds) => {
      toast.success(`${subjectIds.length} subjects deleted successfully`);

      // Get unique classIds from all deleted subjects
      const classIds = new Set<number>();

      for (const subjectId of subjectIds) {
        const classId = await getClassId(subjectId);
        if (classId) classIds.add(classId);

        // Remove detail queries
        queryClient.removeQueries({
          queryKey: subjectKeys.detail(subjectId),
        });
      }

      // Invalidate all affected class lists
      if (classIds.size > 0) {
        classIds.forEach((classId) => {
          invalidateClassLists(queryClient, classId);
        });
      } else {
        // Fallback: invalidate all subject lists
        queryClient.invalidateQueries({
          queryKey: subjectKeys.lists(),
        });
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete subjects");
    },
  });

  return {
    createMultiple: createMultiple.mutate,
    createMultipleAsync: createMultiple.mutateAsync,
    update: update.mutate,
    updateAsync: update.mutateAsync,
    delete: deleteSubject.mutate,
    deleteAsync: deleteSubject.mutateAsync,
    bulkDelete: bulkDelete.mutate,
    bulkDeleteAsync: bulkDelete.mutateAsync,
    isCreating: createMultiple.isPending,
    isUpdating: update.isPending,
    isDeleting: deleteSubject.isPending,
    isBulkDeleting: bulkDelete.isPending,
  };
};
