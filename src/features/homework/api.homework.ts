import { api } from "@/lib/axios";
import { ApiSuccess } from "@/types/api";
import {
  CreateHomeworkType,
  createHomeworkSchema,
  UpdateHomeworkType,
  updateHomeworkSchema,
  Homework,
  HomeworkListResponse,
  HomeworkResponse,
} from "./types.homework";

export async function getHomeworkByClass(
  classId: number,
  sessionId?: string,
): Promise<HomeworkListResponse> {
  return api.get(`/homework/class/${classId}`, {
    params: sessionId ? { sessionId } : {},
  });
}

export async function getHomeworkById(
  homeworkId: number,
  sessionId?: string,
): Promise<HomeworkResponse> {
  return api.get(`/homework/${homeworkId}`, {
    params: sessionId ? { sessionId } : {},
  });
}

export async function createHomework(
  classId: number,
  payload: CreateHomeworkType,
  attachments?: File[],
  sessionId?: string,
): Promise<HomeworkResponse> {
  // Validate payload before sending
  const validated = createHomeworkSchema.parse(payload);

  // Create FormData for file upload
  const formData = new FormData();

  // Append all fields
  formData.append("title", validated.title);
  formData.append("description", validated.description);
  formData.append("dueDate", validated.dueDate);
  formData.append("subjectId", validated.subjectId.toString());

  // Append sessionId if provided
  if (sessionId) {
    formData.append("sessionId", sessionId);
  }

  // Append attachments if any
  if (attachments && attachments.length > 0) {
    attachments.forEach((file) => {
      formData.append("attachments", file);
    });
  }

  return api.post(`/homework/class/${classId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export async function updateHomework(
  homeworkId: number,
  payload: UpdateHomeworkType,
  sessionId?: string,
): Promise<HomeworkResponse> {
  // Validate payload before sending
  const validated = updateHomeworkSchema.parse(payload);

  return api.patch(`/homework/${homeworkId}`, validated, {
    params: sessionId ? { sessionId } : {},
  });
}

export async function deleteHomework(
  homeworkId: number,
  sessionId?: string,
): Promise<ApiSuccess<null>> {
  return api.delete(`/homework/${homeworkId}`, {
    params: sessionId ? { sessionId } : {},
  });
}

export async function deleteAttachment(
  attachmentId: number,
  sessionId?: string,
): Promise<ApiSuccess<null>> {
  return api.delete(`/homework/attachments/${attachmentId}`, {
    params: sessionId ? { sessionId } : {},
  });
}

export async function addAttachments(
  homeworkId: number,
  attachments: File[],
  sessionId?: string,
): Promise<ApiSuccess<HomeworkAttachment[]>> {
  const formData = new FormData();

  attachments.forEach((file) => {
    formData.append("attachments", file);
  });

  return api.post(`/homework/${homeworkId}/attachments`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    params: sessionId ? { sessionId } : {},
  });
}

// Types for HomeworkAttachment
export interface HomeworkAttachment {
  id: number;
  url: string;
  fileName: string;
  fileType: string;
}
