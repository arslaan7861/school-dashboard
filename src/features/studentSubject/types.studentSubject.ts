import { ApiSuccess } from "@/types/api";
import {
  AddOptionalSubjectBody,
  ChangeBatchBody,
  RemoveSubjectParams,
  GetSubjectsByClassQuery,
} from "./validator.studentSubject";

export type {
  AddOptionalSubjectBody,
  ChangeBatchBody,
  RemoveSubjectParams,
  GetSubjectsByClassQuery,
};

// Teacher info with profile
export interface TeacherInfo {
  id: number;
  name: string;
  email: string;
  profilePic: string | null;
}

// Component with teacher info
export interface EnrolledComponent {
  componentId: number;
  componentName: string;
  componentType: string;
  displayOrder: number;
  selectedBatchId: number;
  selectedBatchName: string;
  enrollmentId: number;
  teacher: TeacherInfo | null;
}

// Enrolled subject
export interface EnrolledSubject {
  subjectId: number;
  subjectName: string;
  isOptional: boolean;
  isElective: boolean;
  marksType: string;
  components: EnrolledComponent[];
}

// Enrollments response data
export interface EnrollmentsData {
  classStudentId: number;
  subjects: EnrolledSubject[];
  summary: {
    totalSubjects: number;
    totalComponents: number;
    coreSubjects: number;
    optionalSubjects: number;
    electiveSubjects: number;
  };
}

export type EnrollmentsResponse = ApiSuccess<EnrollmentsData>;

// Batch info for selection
export interface BatchInfo {
  id: number;
  name: string;
  capacity?: number;
  teacher: TeacherInfo | null;
}

// Component with batches for selection
export interface ComponentWithBatches {
  id: number;
  name: string;
  type: string;
  displayOrder: number;
  includeInResult: boolean;
  batches: BatchInfo[];
}

// Subject with components for selection
export interface SubjectWithDetails {
  id: number;
  name: string;
  marksType: string;
  isOptional: boolean;
  isElective: boolean;
  components: ComponentWithBatches[];
}

// Get subjects by class response
export type GetSubjectsByClassResponse = ApiSuccess<SubjectWithDetails[]>;

// Add optional subject response data
export interface AddOptionalSubjectData {
  classStudentId: number;
  subjectId: number;
  subjectName: string;
  enrollments: Array<{
    componentId: number;
    componentName: string;
    batchId: number;
    batchName: string;
    selectionType: "user-selected" | "auto-selected";
    enrollmentId: number;
  }>;
  summary: {
    totalComponents: number;
    userSelected: number;
    autoSelected: number;
  };
}

export type AddOptionalSubjectResponse = ApiSuccess<AddOptionalSubjectData>;

// Change batch response data
export interface ChangeBatchData {
  enrollmentId: number;
  oldBatch: {
    id: number;
    name: string;
  };
  newBatch: {
    id: number;
    name: string;
    subjectId: number;
    subjectName: string;
    componentId: number;
    componentName: string;
    componentType: string;
    teacher: TeacherInfo | null;
  };
  changedAt: string;
}

export type ChangeBatchResponse = ApiSuccess<ChangeBatchData>;

// Remove subject response data
export interface RemoveSubjectData {
  classStudentId: number;
  subjectId: number;
  subjectName: string;
  subjectType: "optional" | "elective";
  removedEnrollments: number;
  timestamp: string;
}

export type RemoveSubjectResponse = ApiSuccess<RemoveSubjectData>;

// Component selection for adding subject
export interface ComponentSelection {
  componentId: number;
  batchId: number;
}

// Add subject form values
export interface AddSubjectFormValues {
  classStudentId: number;
  subjectId: number;
  componentBatches: ComponentSelection[];
}

// Change batch form values
export interface ChangeBatchFormValues {
  newBatchId: number;
}

// Get enrollments for form params
export interface GetEnrollmentsForFormParams {
  classStudentId: number;
}
