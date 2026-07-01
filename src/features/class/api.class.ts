import { api } from "@/lib/axios";
import {
  createClassSchemaType,
  updateClassSchemaType,
} from "./validator.class";
import { ApiSuccess } from "@/types/api";
import { ClassType } from "./types.class";

export async function createClassService(
  payload: createClassSchemaType,
): Promise<ApiSuccess<ClassType>> {
  return api.post("/classes", payload);
}

export async function getAllClasses(
  sessionId: number,
  search?: string,
): Promise<ApiSuccess<ClassType[]>> {
  return api.get(`/classes/${sessionId}`, {
    params: { search },
  });
}

export async function getClassById(
  classId: number,
): Promise<ApiSuccess<ClassType>> {
  return api.get(`/classes/get/${classId}`);
}

export async function updateClassService({
  classId,
  ...payload
}: updateClassSchemaType & { classId: number }): Promise<
  ApiSuccess<ClassType>
> {
  return api.put(`/classes/${classId}`, payload);
}

export async function deleteClassService(
  classId: number,
): Promise<ApiSuccess<never>> {
  return api.delete(`/classes/${classId}`);
}
