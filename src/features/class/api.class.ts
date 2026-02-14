import { api } from "@/lib/axios";
import {
  createClassSchemaType,
  updateClassSchemaType,
} from "./validator.class";
import { ApiSuccess } from "@/types/api";
import { classType } from "./types.class";

export async function createClassService(
  payload: createClassSchemaType,
): Promise<ApiSuccess<classType>> {
  return api.post("/classes", payload);
}
export async function getAllClasses(
  sessionId: string,
): Promise<ApiSuccess<classType[]>> {
  return api.post(`/classes/${sessionId}`);
}
export async function updateClassService({
  classId,
  ...payload
}: updateClassSchemaType & { classId: string }): Promise<
  ApiSuccess<classType>
> {
  return api.put(`/classes/${classId}`, payload);
}
export async function deleteClassService(
  payload: updateClassSchemaType,
): Promise<ApiSuccess<never>> {
  return api.put("/classes", payload);
}
