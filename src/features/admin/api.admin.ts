"use client";

import { api } from "@/lib/axios";
import { ApiSuccess } from "@/types/api";
import { Admin } from "./types";
import {
  createAdminSchemaType,
  updateAdminSchemaType,
} from "./validators.admin";

export const fetchAdmins = async (): Promise<ApiSuccess<Admin[]>> => {
  return api.get("/auth/admins");
};
export async function createAdmin(
  payload: createAdminSchemaType,
): Promise<ApiSuccess<Admin>> {
  return api.post("/auth/create", payload);
}

export async function updateAdmin({
  userId,
  ...payload
}: updateAdminSchemaType & { userId: number }): Promise<ApiSuccess<Admin>> {
  return api.patch(`/auth/admin/${userId}`, payload);
}

export async function toggleUserActiveStatus({
  userId,
  active,
}: {
  userId: number;
  active: boolean;
}): Promise<ApiSuccess<never>> {
  return api.patch(`/auth/togglestatus/${userId}`, { active });
}

export async function deleteAdmin(userId: number): Promise<ApiSuccess<never>> {
  return api.delete(`/auth/${userId}`);
}
