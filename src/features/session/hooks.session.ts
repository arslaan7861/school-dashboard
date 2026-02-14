"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getAllSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  toggleSessionActive,
} from "./api.session";

/* ------------------ QUERIES ------------------ */

export const useSessions = () => {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: getAllSessions,
    staleTime: 1000 * 60 * 5,
  });
};

export const useSessionCrud = () => {
  const qc = useQueryClient();

  const invalidateSessions = () =>
    qc.invalidateQueries({ queryKey: ["sessions"] });

  /* CREATE */
  const createSessionMutation = useMutation({
    mutationFn: createSession,
    onSuccess: () => invalidateSessions(),
  });

  /* UPDATE */
  const updateSessionMutation = useMutation({
    mutationFn: updateSession,
    onSuccess: () => invalidateSessions(),
  });

  /* DELETE */
  const deleteSessionMutation = useMutation({
    mutationFn: deleteSession,
    onSuccess: () => invalidateSessions(),
  });

  /* TOGGLE ACTIVE */
  const toggleSessionActiveMutation = useMutation({
    mutationFn: toggleSessionActive,
    onSuccess: () => invalidateSessions(),
  });

  return {
    createSessionMutation,
    updateSessionMutation,
    deleteSessionMutation,
    toggleSessionActiveMutation,
  };
};
