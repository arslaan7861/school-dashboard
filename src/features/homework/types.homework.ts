// ==================== Homework Types ====================

export interface HomeworkAttachment {
  id: number;
  homeworkId: number;
  url: string;
  key: string;
  fileName: string | null;
  fileType: string | null;
  size: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Homework {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  classId: number;
  subjectId: number;
  assignedBy: number;
  sessionId: number;
  createdAt: string;
  updatedAt: string;
  subject?: {
    id: number;
    name: string;
  };
  assignedByUser?: {
    id: number;
    name: string;
    email: string;
  };
  class?: {
    id: number;
    name: string;
    section: string;
  };
  session?: {
    id: number;
    name: string;
  };
  attachments?: HomeworkAttachment[];
}

export interface CreateHomeworkRequest {
  title: string;
  description: string;
  dueDate: string;
  classId: number;
  subjectId: number;
  sessionId: number;
  files?: File[];
}

export interface BulkHomeworkItem {
  title: string;
  description: string;
  dueDate: string;
  subjectId: number;
}

export interface BulkCreateHomeworkRequest {
  assignments: BulkHomeworkItem[];
  classId: number;
  sessionId: number;
  files?: File[][]; // Array of file arrays per assignment
}

export interface BulkCreateHomeworkResponse {
  created: number;
  failed: number;
  errors: Array<{
    index: number;
    title: string;
    error: string;
  }>;
  homeworks: Homework[];
}

export interface UpdateHomeworkRequest {
  title?: string;
  description?: string;
  dueDate?: string;
}

// ==================== Filter Types ====================

export interface HomeworkFilters {
  sessionId?: number;
  subjectId?: number;
  fromDate?: string;
  toDate?: string;
}

export interface StudentHomeworkFilters {
  sessionId?: number;
  fromDate?: string;
  toDate?: string;
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

// ==================== Component Types ====================

export interface HomeworkFormValues {
  title: string;
  description: string;
  dueDate: string;
  subjectId: number;
  attachments: File[];
}

export interface BulkHomeworkFormValues {
  assignments: BulkHomeworkItem[];
  attachments: File[][];
}

export interface HomeworkCardProps {
  homework: Homework;
  onEdit?: (homework: Homework) => void;
  onDelete?: (homeworkId: number) => void;
  onDownload?: (attachment: HomeworkAttachment) => void;
  isTeacher?: boolean;
}

export interface HomeworkStatus {
  isOverdue: boolean;
  daysRemaining: number;
  statusLabel: string;
  statusColor: string;
}
