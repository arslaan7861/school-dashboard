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
  payload: createAdminSchemaType & { image?: File | null },
): Promise<ApiSuccess<Admin>> {
  const fd = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (key === "image" && value instanceof File) {
      fd.append("image", value);
    } else if (value !== undefined && value !== null) {
      fd.append(key, String(value));
    }
  });

  return api.post("/auth/create", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function updateAdmin({
  userId,
  image,
  ...payload
}: updateAdminSchemaType & {
  userId: number;
  image?: File | null;
}): Promise<ApiSuccess<Admin>> {
  const fd = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      fd.append(key, String(value));
    }
  });

  if (image instanceof File) {
    fd.append("image", image);
  }

  return api.patch(`/auth/admin/${userId}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function toggleUserActiveStatus({
  userId,
  isActive,
}: {
  userId: number;
  isActive: boolean;
}): Promise<ApiSuccess<never>> {
  return api.patch(`/auth/togglestatus/${userId}`, { isActive });
}

export async function deleteAdmin(userId: number): Promise<ApiSuccess<never>> {
  return api.delete(`/auth/${userId}`);
}
