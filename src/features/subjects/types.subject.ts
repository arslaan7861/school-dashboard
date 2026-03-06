export interface Teacher {
  id: number;
  name: string;
  employeeCode: string;
  email?: string;
  profilePic?: string;
}

export interface Batch {
  id: number;
  name: string;
  capacity?: number;
  teacherId: number;
  teacher?: Teacher;
  createdAt?: string;
  updatedAt?: string;
}

export interface Component {
  id: number;
  name: string;
  type: "theory" | "practical" | "internal" | "project" | "viva" | "other";
  displayOrder: number;
  includeInResult: boolean;
  batches: Batch[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Subject {
  id: number;
  name: string;
  marksType: "number" | "grade" | "none";
  isOptional: boolean;
  isElective: boolean;
  classId: number;
  sessionId: number;
  class?: {
    id: number;
    name: string;
    section: string;
  };
  session?: {
    id: number;
    name: string;
  };
  components?: Component[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubjectPayload {
  name: string;
  classId: number;
  sessionId: number;
  marksType?: "number" | "grade" | "none";
  isOptional?: boolean;
  isElective?: boolean;
  components: Array<{
    name: string;
    type?: string;
    displayOrder?: number;
    includeInResult?: boolean;
    batches: Array<{
      name: string;
      capacity?: number;
      teacherId: number;
    }>;
  }>;
}

export interface CreateMultipleSubjectsPayload {
  subjects: CreateSubjectPayload[];
}

export interface UpdateSubjectData {
  name?: string;
  marksType?: "number" | "grade" | "none";
  isOptional?: boolean;
  isElective?: boolean;
  components?: Array<{
    id?: number;
    name: string;
    type: string;
    displayOrder: number;
    includeInResult: boolean;
    _delete?: boolean;
    batches?: Array<{
      id?: number;
      name: string;
      capacity?: number;
      teacherId: number;
      _delete?: boolean;
    }>;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
