import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { homeworkApi } from "./api.homework";
import {
  CreateHomeworkRequest,
  BulkCreateHomeworkRequest,
  UpdateHomeworkRequest,
  HomeworkFilters,
  StudentHomeworkFilters,
} from "./types.homework";
import { useAuthStore } from "@/store/authStore";

// ==================== Query Keys ====================

export const homeworkKeys = {
  all: ["homework"] as const,
  lists: () => [...homeworkKeys.all, "list"] as const,
  byClass: (classId: number, filters?: HomeworkFilters) =>
    [...homeworkKeys.lists(), classId, filters] as const,
  byStudent: (classStudentId: number, filters?: StudentHomeworkFilters) =>
    [...homeworkKeys.lists(), "student", classStudentId, filters] as const,
  details: () => [...homeworkKeys.all, "detail"] as const,
  detail: (id: number) => [...homeworkKeys.details(), id] as const,
};

// ==================== Query Hooks ====================

export const useHomeworkByClass = (
  classId: number,
  filters?: HomeworkFilters,
) => {
  return useQuery({
    queryKey: homeworkKeys.byClass(classId, filters),
    queryFn: () =>
      homeworkApi.getByClass(classId, filters).then((res) => res.data),
    enabled: !!classId,
  });
};

export const useHomework = (homeworkId: number) => {
  return useQuery({
    queryKey: homeworkKeys.detail(homeworkId),
    queryFn: () => homeworkApi.getById(homeworkId).then((res) => res.data),
    enabled: !!homeworkId,
  });
};

export const useHomeworkForStudent = (
  classStudentId: number,
  filters?: StudentHomeworkFilters,
) => {
  return useQuery({
    queryKey: homeworkKeys.byStudent(classStudentId, filters),
    queryFn: () =>
      homeworkApi
        .getForStudent(classStudentId, filters)
        .then((res) => res.data),
    enabled: !!classStudentId,
  });
};

// ==================== Mutation Hooks ====================

export const useCreateHomework = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHomeworkRequest) => homeworkApi.create(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: homeworkKeys.byClass(data.classId),
      });
    },
  });
};
// Update the useAllHomework hook to include sessionId
export const useAllHomework = (
  sessionId?: number,
  filters?: {
    subjectId?: number;
    fromDate?: string;
    toDate?: string;
    search?: string;
    classId?: number;
  },
) => {
  return useQuery({
    queryKey: [...homeworkKeys.all, "all", sessionId, filters],
    queryFn: () =>
      homeworkApi
        .getAll({ ...filters, sessionId: sessionId as number })
        .then((res) => res.data),

    enabled: !!sessionId,
  });
};
export const useBulkCreateHomework = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkCreateHomeworkRequest) =>
      homeworkApi.bulkCreate(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: homeworkKeys.byClass(data.classId),
      });
    },
  });
};

export const useUpdateHomework = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateHomeworkRequest }) =>
      homeworkApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: homeworkKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: homeworkKeys.lists() });
    },
  });
};

export const useDeleteHomework = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => homeworkApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: homeworkKeys.lists() });
    },
  });
};

export const useAddAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ homeworkId, file }: { homeworkId: number; file: File }) =>
      homeworkApi.addAttachment(homeworkId, file),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: homeworkKeys.detail(data.homeworkId),
      });
    },
  });
};

export const useDeleteAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attachmentId: number) =>
      homeworkApi.deleteAttachment(attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: homeworkKeys.details() });
    },
  });
};

// ==================== Helper Hook ====================

export const useHomeworkStatus = (dueDate: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const isOverdue = due < today;
  const daysRemaining = Math.ceil(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  let statusLabel = "";
  let statusColor = "";

  if (isOverdue) {
    statusLabel = "Overdue";
    statusColor = "text-red-600 bg-red-50";
  } else if (daysRemaining === 0) {
    statusLabel = "Due Today";
    statusColor = "text-orange-600 bg-orange-50";
  } else if (daysRemaining <= 3) {
    statusLabel = `Due in ${daysRemaining} days`;
    statusColor = "text-yellow-600 bg-yellow-50";
  } else {
    statusLabel = `Due in ${daysRemaining} days`;
    statusColor = "text-green-600 bg-green-50";
  }

  return { isOverdue, daysRemaining, statusLabel, statusColor };
};
