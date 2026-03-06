"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  toggleTeacherStatus, // Add this
} from "./teacher.api";

/* ------------------ QUERIES ------------------ */

export const useTeachers = () => {
  return useQuery({
    queryKey: ["teachers"],
    queryFn: getAllTeachers,
    staleTime: 1000 * 60 * 5,
  });
};

export const useTeacher = (teacherId?: number) => {
  return useQuery({
    queryKey: ["teacher", teacherId],
    queryFn: () => getTeacherById(Number(teacherId)),
    enabled: !!teacherId,
  });
};

/* ------------------ CRUD MUTATIONS ------------------ */

export const useTeacherCrud = () => {
  const qc = useQueryClient();

  const invalidateTeachers = () => {
    qc.invalidateQueries({ queryKey: ["teachers"] });
  };

  const createTeacherMutation = useMutation({
    mutationFn: createTeacher,
    onSuccess: (res) => {
      toast.success(res.message || "Teacher created successfully");
      invalidateTeachers();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create teacher");
    },
  });

  const updateTeacherMutation = useMutation({
    mutationFn: updateTeacher,
    onSuccess: (res) => {
      toast.success(res.message || "Teacher updated successfully");
      invalidateTeachers();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update teacher");
    },
  });

  // New toggle status mutation
  const toggleTeacherStatusMutation = useMutation({
    mutationFn: ({
      teacherId,
      isActive,
    }: {
      teacherId: number;
      isActive: boolean;
    }) => toggleTeacherStatus(teacherId, isActive),
    onSuccess: (res) => {
      toast.success(res.message || "Teacher status updated successfully");
      invalidateTeachers();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update teacher status");
    },
  });

  const deleteTeacherMutation = useMutation({
    mutationFn: deleteTeacher,
    onSuccess: (res) => {
      toast.success(res.message || "Teacher deleted successfully");
      invalidateTeachers();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete teacher");
    },
  });

  return {
    createTeacherMutation,
    updateTeacherMutation,
    toggleTeacherStatusMutation, // Add this
    deleteTeacherMutation,
  };
};
