import { api } from "@/lib/axios";
import { ApiSuccess } from "@/types/api";
import { Teacher, TeacherDetail, TeachersResponse } from "./type.teacher";
import {
  createTeacherSchemaType,
  updateTeacherSchemaType,
} from "./validator.teacher";

export async function getAllTeachers(): Promise<ApiSuccess<TeachersResponse>> {
  return api.get("/teacher");
}

export async function getTeacherById(
  teacherId: number,
): Promise<ApiSuccess<TeacherDetail>> {
  return api.get(`/teacher/${teacherId}`);
}

export async function createTeacher(
  payload: createTeacherSchemaType & { image?: File | null },
): Promise<ApiSuccess<Teacher>> {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (key === "image" && value instanceof File) {
      formData.append("image", value);
    } else if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  return api.post("/teacher", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function updateTeacher(
  payload: updateTeacherSchemaType & {
    teacherId: number;
    image?: File | null;
  },
): Promise<ApiSuccess<Teacher>> {
  const { teacherId, ...data } = payload;

  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (key === "image" && value instanceof File) {
      formData.append("image", value);
    } else if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  return api.put(`/teacher/${teacherId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

// New toggle status endpoint
export async function toggleTeacherStatus(
  teacherId: number,
  isActive: boolean,
): Promise<ApiSuccess<Teacher>> {
  return api.patch(`/teacher/${teacherId}/toggle-status`, { isActive });
}

export async function deleteTeacher(
  teacherId: number,
): Promise<ApiSuccess<Teacher>> {
  return api.delete(`/teacher/${teacherId}`);
}
