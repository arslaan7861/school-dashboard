import { api } from "@/lib/axios";
import { ApiSuccess } from "@/types/api";
import {
  CreateSessionSchemaType,
  UpdateSessionSchemaType,
} from "./validators.session";
import { Session } from "./types.session";

/* ---------- GET ALL ---------- */
export async function getAllSessions(): Promise<ApiSuccess<Session[]>> {
  return api.get("/sessions");
}

/* ---------- GET BY ID ---------- */
export async function getSessionById(
  sessionId: number,
): Promise<ApiSuccess<Session>> {
  return api.get(`/sessions/${sessionId}`);
}

/* ---------- CREATE ---------- */
export async function createSession(
  payload: CreateSessionSchemaType,
): Promise<ApiSuccess<Session>> {
  return api.post("/sessions", payload);
}

/* ---------- UPDATE ---------- */
export async function updateSession({
  sessionId,
  ...body
}: UpdateSessionSchemaType & { sessionId: string }): Promise<
  ApiSuccess<Session>
> {
  return api.put(`/sessions/${sessionId}`, body);
}

/* ---------- DELETE ---------- */
export async function deleteSession(
  sessionId: number,
): Promise<ApiSuccess<Session>> {
  return api.delete(`/sessions/${sessionId}`);
}

/* ---------- TOGGLE ACTIVE ---------- */
export async function toggleSessionActive({
  sessionId,
  active,
}: {
  sessionId: string;
  active: boolean;
}): Promise<ApiSuccess<any>> {
  return api.patch(`/sessions/${sessionId}/toggle-active`, { active });
}
