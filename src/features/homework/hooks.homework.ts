import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getHomeworkByClass,
  getHomeworkById,
  createHomework,
  updateHomework,
  deleteHomework,
  deleteAttachment,
  addAttachments,
} from "./api.homework";
import { CreateHomeworkType, UpdateHomeworkType } from "./types.homework";

export const useHomeworkByClass = (classId: number, sessionId?: string) => {
  return useQuery({
    queryKey: ["homework", "class", classId, sessionId],
    queryFn: () => getHomeworkByClass(classId, sessionId),
    enabled: !!classId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useHomeworkById = (homeworkId: number, sessionId?: string) => {
  return useQuery({
    queryKey: ["homework", homeworkId, sessionId],
    queryFn: () => getHomeworkById(homeworkId, sessionId),
    enabled: !!homeworkId,
  });
};

export const useHomeworkMutations = (classId: number, sessionId?: string) => {
  const queryClient = useQueryClient();

  const invalidateHomework = () => {
    queryClient.invalidateQueries({
      queryKey: ["homework", "class", classId, sessionId],
    });
  };

  const createHomeworkMutation = useMutation({
    mutationFn: ({
      data,
      attachments,
    }: {
      data: CreateHomeworkType;
      attachments?: File[];
    }) => createHomework(classId, data, attachments, sessionId),
    onSuccess: (res) => {
      toast.success(res.message || "Homework assigned successfully");
      invalidateHomework();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to assign homework");
    },
  });

  const updateHomeworkMutation = useMutation({
    mutationFn: ({
      homeworkId,
      data,
    }: {
      homeworkId: number;
      data: UpdateHomeworkType;
    }) => updateHomework(homeworkId, data, sessionId),
    onSuccess: (res) => {
      toast.success(res.message || "Homework updated successfully");
      invalidateHomework();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update homework");
    },
  });

  const deleteHomeworkMutation = useMutation({
    mutationFn: (homeworkId: number) => deleteHomework(homeworkId, sessionId),
    onSuccess: (res) => {
      toast.success(res.message || "Homework deleted successfully");
      invalidateHomework();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete homework");
    },
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: (attachmentId: number) =>
      deleteAttachment(attachmentId, sessionId),
    onSuccess: (res) => {
      toast.success(res.message || "Attachment deleted successfully");
      invalidateHomework();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete attachment");
    },
  });

  const addAttachmentsMutation = useMutation({
    mutationFn: ({
      homeworkId,
      attachments,
    }: {
      homeworkId: number;
      attachments: File[];
    }) => addAttachments(homeworkId, attachments, sessionId),
    onSuccess: (res) => {
      toast.success(res.message || "Attachments added successfully");
      invalidateHomework();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to add attachments");
    },
  });

  return {
    createHomeworkMutation,
    updateHomeworkMutation,
    deleteHomeworkMutation,
    deleteAttachmentMutation,
    addAttachmentsMutation,
  };
};
