"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createClassService,
  deleteClassService,
  getAllClasses,
  getClassById,
  updateClassService,
  promoteClassService,
} from "./api.class";

/* ------------------ QUERIES ------------------ */

export const useClasses = (sessionId?: number, search?: string) => {
  return useQuery({
    queryKey: ["classes", sessionId, search],
    queryFn: () => getAllClasses(sessionId as number, search),
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useClass = (classId?: number) => {
  return useQuery({
    queryKey: ["class", classId],
    queryFn: () => getClassById(classId as number),
    enabled: !!classId,
  });
};

/* ------------------ CRUD MUTATIONS ------------------ */

export const useClassCrud = (sessionId?: number) => {
  const qc = useQueryClient();

  const invalidateClasses = () => {
    if (sessionId) {
      qc.invalidateQueries({ queryKey: ["classes", sessionId] });
    }
    qc.invalidateQueries({ queryKey: ["classes"] });
  };

  /* CREATE */
  const createClassMutation = useMutation({
    mutationFn: createClassService,
    onSuccess: (res) => {
      toast.success(res.message || "Class created successfully");
      invalidateClasses();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create class");
    },
  });

  /* UPDATE */
  const updateClassMutation = useMutation({
    mutationFn: updateClassService,
    onSuccess: (res) => {
      toast.success(res.message || "Class updated successfully");
      invalidateClasses();
      qc.invalidateQueries({ queryKey: ["class"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update class");
    },
  });

  /* DELETE */
  const deleteClassMutation = useMutation({
    mutationFn: deleteClassService,
    onSuccess: (res) => {
      toast.success(res.message || "Class deleted successfully");
      invalidateClasses();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete class");
    },
  });

  /* PROMOTE */
  const promoteClassMutation = useMutation({
    mutationFn: promoteClassService,
    onSuccess: (res) => {
      toast.success(res.message || "Class promoted successfully");
      invalidateClasses();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to promote class");
    },
  });

  return {
    createClassMutation,
    updateClassMutation,
    deleteClassMutation,
    promoteClassMutation,
  };
};
