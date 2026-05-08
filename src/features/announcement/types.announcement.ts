// ==================== Enums ====================

export enum AnnouncementAudience {
  ALL = "all",
  CLASS = "class",
}

export enum UserRole {
  ADMIN = "admin",
  TEACHER = "teacher",
  STUDENT = "student",
}

// ==================== Announcement Types ====================

export interface AnnouncementClass {
  id: number;
  announcementId: number;
  classId: number;
  createdAt: string;
  updatedAt: string;
  class?: {
    id: number;
    name: string;
    section: string;
  };
}

export interface Announcement {
  id: number;
  title: string;
  message: string;
  audienceType: AnnouncementAudience;
  createdBy: number;
  sessionId: number;
  createdAt: string;
  updatedAt: string;
  session?: {
    id: number;
    name: string;
  };
  creator?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  classLinks?: AnnouncementClass[];
  isRead?: boolean;
}

export interface AnnouncementWithReadStatus extends Announcement {
  isRead: boolean;
}

// ==================== Request/Response Types ====================

export interface CreateAnnouncementRequest {
  title: string;
  message: string;
  audienceType: AnnouncementAudience;
  classIds?: number[];
  sendNotification?: boolean;
}

export interface UpdateAnnouncementRequest {
  title?: string;
  message?: string;
}

export interface AnnouncementFilters {
  sessionId?: number;
  audienceType?: AnnouncementAudience;
  limit?: number;
  offset?: number;
}

export interface UserAnnouncementFilters {
  sessionId?: number;
  limit?: number;
  offset?: number;
}

// ==================== API Response Types ====================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface MarkReadResponse {
  announcementId: number;
  userId: number;
  readAt: string;
}

// ==================== Component Types ====================

export interface AnnouncementFormValues {
  title: string;
  message: string;
  audienceType: AnnouncementAudience;
  classIds: number[];
  sendNotification: boolean;
}

export interface AnnouncementCardProps {
  announcement: Announcement;
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (announcement: Announcement) => void;
  onMarkRead?: (announcementId: number) => void;
  showReadStatus?: boolean;
}

export interface AnnouncementFiltersState {
  sessionId?: number;
  audienceType?: AnnouncementAudience;
  search?: string;
}
