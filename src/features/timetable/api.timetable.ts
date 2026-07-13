import { api } from "@/lib/axios";
import {
  ClassTimetableResponse,
  TeacherTimetableResponse,
  CreateSlotDto,
  CreateEntryDto,
  UpdateSlotDto,
  UpdateEntryDto,
  CopyDayDto,
  MoveEntryDto,
} from "./types.timetable";

const BASE_URL = "/timetable";

export const timetableApi = {
  // Get class timetable
  getClassTimetable: async (
    classId: number,
    sessionId?: number,
  ): Promise<{
    success: boolean;
    message: string;
    data: ClassTimetableResponse;
  }> => {
    const params = sessionId ? { sessionId } : {};
    return api.get(`${BASE_URL}/class/${classId}`, { params });
  },

  // Get teacher timetable
  getTeacherTimetable: async (
    teacherId: number,
    sessionId?: number,
  ): Promise<{
    success: boolean;
    message: string;
    data: TeacherTimetableResponse;
  }> => {
    const params = sessionId ? { sessionId } : {};
    return api.get(`${BASE_URL}/teacher/${teacherId}`, { params });
  },

  // Create slot
  createSlot: async (
    data: CreateSlotDto,
  ): Promise<{ success: boolean; message: string; data: any }> => {
    return api.post(`${BASE_URL}/slots`, data);
  },

  // Update slot
  updateSlot: async (
    slotId: number,
    data: UpdateSlotDto,
  ): Promise<{ success: boolean; message: string; data: any }> => {
    return api.put(`${BASE_URL}/slots/${slotId}`, data);
  },

  // Delete slot
  deleteSlot: async (
    slotId: number,
  ): Promise<{ success: boolean; message: string; data: null }> => {
    return api.delete(`${BASE_URL}/slots/${slotId}`);
  },

  // Create entry
  createEntry: async (
    data: CreateEntryDto,
  ): Promise<{ success: boolean; message: string; data: any }> => {
    return api.post(`${BASE_URL}/entries`, data);
  },

  // Update entry
  updateEntry: async (
    entryId: number,
    data: UpdateEntryDto,
  ): Promise<{ success: boolean; message: string; data: any }> => {
    return api.put(`${BASE_URL}/entries/${entryId}`, data);
  },

  // Delete entry
  deleteEntry: async (
    entryId: number,
  ): Promise<{ success: boolean; message: string; data: null }> => {
    return api.delete(`${BASE_URL}/entries/${entryId}`);
  },

  // Copy day
  copyDay: async (
    classId: number,
    data: CopyDayDto,
  ): Promise<{ success: boolean; message: string; data: any }> => {
    return api.post(`${BASE_URL}/class/${classId}/copy-day`, data);
  },

  // Move entry
  moveEntry: async (
    entryId: number,
    data: MoveEntryDto,
  ): Promise<{ success: boolean; message: string; data: any }> => {
    return api.put(`${BASE_URL}/entries/${entryId}/move`, data);
  },
};
