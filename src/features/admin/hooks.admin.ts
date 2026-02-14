"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdmin,
  deleteAdmin,
  fetchAdmins,
  toggleUserActiveStatus,
  updateAdmin,
} from "./api.admin";

export const useAdmins = () => {
  return useQuery({
    queryKey: ["admins"],
    queryFn: fetchAdmins,
    staleTime: 1000 * 60 * 5,
  });
};
export const useAdminCrud = () => {
  const qc = useQueryClient();

  const invalidateAdmins = () => qc.invalidateQueries({ queryKey: ["admins"] });
  const createAdminMutation = useMutation({
    mutationFn: createAdmin,
    onSuccess: (res) => {
      invalidateAdmins();
      console.log(res);
    },
  });
  const updateAdminMutation = useMutation({
    mutationFn: updateAdmin,
    onSuccess: (res) => {
      invalidateAdmins();
      console.log(res);
    },
  });
  const toggleAdminActiveStatusMutation = useMutation({
    mutationFn: toggleUserActiveStatus,
    onSuccess: (res) => {
      console.log(res);
      invalidateAdmins();
    },
    onError: (e) => {
      console.log(e.message);
    },
  });
  const deleteAdminMutation = useMutation({
    mutationFn: deleteAdmin,
    onSuccess: (res) => {
      console.log(res);
      invalidateAdmins();
    },
  });
  return {
    createAdminMutation,
    updateAdminMutation,
    toggleAdminActiveStatusMutation,
    deleteAdminMutation,
  };
};
