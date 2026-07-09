import { api } from "@/lib/axios";
import {
  ApiResponse,
  Announcement,
  PaginatedResponse,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  AnnouncementFilters,
  UserAnnouncementFilters,
  MarkReadResponse,
} from "./types.announcement";

const BASE_URL = "/announcements";

// ==================== Admin APIs ====================

export const announcementApi = {
  // Create announcement (admin only)
  create: (
    data: FormData,
  ): Promise<ApiResponse<Announcement>> => api.post(`${BASE_URL}/`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),

  // Get all announcements (admin view)
  getAll: (
    filters?: AnnouncementFilters,
  ): Promise<PaginatedResponse<Announcement>> =>
    api.get(`${BASE_URL}/`, { params: filters }),

  // Get announcement by ID
  getById: (announcementId: number): Promise<ApiResponse<Announcement>> =>
    api.get(`${BASE_URL}/${announcementId}`),

  // Update announcement (admin only)
  update: (
    announcementId: number,
    data: UpdateAnnouncementRequest,
  ): Promise<ApiResponse<Announcement>> =>
    api.put(`${BASE_URL}/${announcementId}`, data),

  // Delete announcement (admin only)
  delete: (announcementId: number): Promise<ApiResponse<void>> =>
    api.delete(`${BASE_URL}/${announcementId}`),

  // Add attachment
  addAttachment: (announcementId: number, data: FormData): Promise<ApiResponse<any>> =>
    api.post(`${BASE_URL}/${announcementId}/attachments`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Delete attachment
  deleteAttachment: (attachmentId: number): Promise<ApiResponse<void>> =>
    api.delete(`${BASE_URL}/attachments/${attachmentId}`),

  // ==================== User APIs ====================

  // Get announcements for specific user
  getUserAnnouncements: (
    userId: number,
    filters?: UserAnnouncementFilters,
  ): Promise<PaginatedResponse<Announcement>> =>
    api.get(`${BASE_URL}/user/${userId}`, { params: filters }),

  // Mark announcement as read
  markAsRead: (
    announcementId: number,
    userId: number,
  ): Promise<ApiResponse<MarkReadResponse>> =>
    api.post(`${BASE_URL}/${announcementId}/read/${userId}`),
};
