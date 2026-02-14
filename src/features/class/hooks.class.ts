"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createClassService,
  deleteClassService,
  getAllClasses,
  updateClassService,
} from "./api.class";
/* ------------------ QUERIES ------------------ */

export const useClasses = (sessionId?: string) => {
  return useQuery({
    queryKey: ["classes", sessionId],
    queryFn: () => getAllClasses(sessionId as string),
    enabled: !!sessionId, // prevents run if null
    staleTime: 1000 * 60 * 5,
  });
};

// export const useTeacher = (teacherId?: number) => {
//   return useQuery({
//     queryKey: ["teacher", teacherId],
//     queryFn: () => getTeacherById(Number(teacherId)),
//     enabled: !!teacherId,
//   });
// };

/* ------------------ CRUD MUTATIONS ------------------ */

export const useClassCrud = () => {
  const qc = useQueryClient();

  const invalidateTeachers = (sessionId: string) =>
    qc.invalidateQueries({ queryKey: ["classes", sessionId] });

  /* CREATE */
  const createClassMutation = useMutation({
    mutationFn: createClassService,
    onSuccess: (res) => {
      console.log(res);
      invalidateTeachers(res.data.session_id);
    },
  });

  /* UPDATE */
  const updateClassMutation = useMutation({
    mutationFn: updateClassService,
    onSuccess: (res) => {
      console.log(res);
      invalidateTeachers(res.data.session_id);
    },
  });

  /* DELETE */
  const deleteClassMutation = useMutation({
    mutationFn: deleteClassService,
    onSuccess: (res, d) => {
      console.log(res);
      invalidateTeachers(String(d.session_id));
    },
  });

  return {
    createClassMutation,
    updateClassMutation,
    deleteClassMutation,
  };
};
