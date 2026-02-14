import { api } from "@/lib/axios";
import { ApiSuccess } from "@/types/api";
import { Teacher, TeachersData } from "./type.teacher";
import {
  createTeacherSchemaType,
  updateTeacherSchemaType,
} from "./validator.teacher";

export async function getAllTeachers(): Promise<ApiSuccess<Teacher[]>> {
  return api.get("/teacher");
}

export async function getTeacherById(
  teacherId: number,
): Promise<ApiSuccess<Teacher>> {
  return api.get(`/teacher/${teacherId}`);
}

export async function createTeacher(
  payload: createTeacherSchemaType,
): Promise<ApiSuccess<Teacher>> {
  return api.post("/teacher", payload);
}

export async function updateTeacher({
  teacherId,
  ...payload
}: updateTeacherSchemaType & { teacherId: number }): Promise<
  ApiSuccess<Teacher>
> {
  return api.put(`/teacher/${teacherId}`, payload);
}

export async function deleteTeacher(
  teacherId: number,
): Promise<ApiSuccess<Teacher>> {
  return api.delete(`/teacher/${teacherId}`);
}
