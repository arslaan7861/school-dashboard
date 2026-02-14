"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "./teacher.api";

/* ------------------ QUERIES ------------------ */

export const useTeachers = () => {
  return useQuery({
    queryKey: ["teachers"],
    queryFn: getAllTeachers,
    staleTime: 1000 * 60 * 5, // 5 min
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

  const invalidateTeachers = () =>
    qc.invalidateQueries({ queryKey: ["teachers"] });

  /* CREATE */
  const createTeacherMutation = useMutation({
    mutationFn: createTeacher,
    onSuccess: (res) => {
      console.log(res);
      invalidateTeachers();
    },
  });

  /* UPDATE */
  const updateTeacherMutation = useMutation({
    mutationFn: updateTeacher,
    onSuccess: (res) => {
      console.log(res);
      invalidateTeachers();
    },
  });

  /* DELETE */
  const deleteTeacherMutation = useMutation({
    mutationFn: deleteTeacher,
    onSuccess: (res) => {
      console.log(res);
      invalidateTeachers();
    },
  });

  return {
    createTeacherMutation,
    updateTeacherMutation,
    deleteTeacherMutation,
  };
};
