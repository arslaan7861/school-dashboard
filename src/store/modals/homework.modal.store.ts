import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Homework } from "@/features/homework/types.homework";

// ==================== Create Homework Modal State ====================

type CreateHomeworkModalState = {
  isOpen: boolean;
  classId: number | null;
  sessionId: number | null;
  onSuccess: (() => void) | null;
  defaultValues?: Partial<CreateHomeworkFormValues>;
};

// ==================== Bulk Create Homework Modal State ====================

type BulkCreateHomeworkModalState = {
  isOpen: boolean;
  classId: number | null;
  sessionId: number | null;
  onSuccess: (() => void) | null;
};

// ==================== Edit Homework Modal State ====================

type EditHomeworkModalState = {
  isOpen: boolean;
  homework: Homework | null;
  onSuccess: (() => void) | null;
};

// ==================== Delete Homework Modal State ====================

type DeleteHomeworkModalState = {
  isOpen: boolean;
  homeworkId: number | null;
  homeworkTitle: string | null;
  onSuccess: (() => void) | null;
};

// ==================== View Homework Modal State ====================

type ViewHomeworkModalState = {
  isOpen: boolean;
  homeworkId: number | null;
  onSuccess: (() => void) | null;
};

// ==================== Form Types ====================

export interface CreateHomeworkFormValues {
  title: string;
  description: string;
  dueDate: string;
  subjectId: number;
  files: File[];
}

export interface BulkHomeworkAssignment {
  title: string;
  description: string;
  dueDate: string;
  subjectId: number;
  files: File[];
}

export interface BulkCreateHomeworkFormValues {
  assignments: BulkHomeworkAssignment[];
}

// ==================== Store State ====================

type HomeworkStore = {
  createHomeworkModal: CreateHomeworkModalState;
  bulkCreateHomeworkModal: BulkCreateHomeworkModalState;
  editHomeworkModal: EditHomeworkModalState;
  deleteHomeworkModal: DeleteHomeworkModalState;
  viewHomeworkModal: ViewHomeworkModalState;
};

export const useHomeworkModalStore = create<HomeworkStore>()(
  immer(() => ({
    createHomeworkModal: {
      isOpen: false,
      classId: null,
      sessionId: null,
      onSuccess: null,
      defaultValues: undefined,
    },
    bulkCreateHomeworkModal: {
      isOpen: false,
      classId: null,
      sessionId: null,
      onSuccess: null,
    },
    editHomeworkModal: {
      isOpen: false,
      homework: null,
      onSuccess: null,
    },
    deleteHomeworkModal: {
      isOpen: false,
      homeworkId: null,
      homeworkTitle: null,
      onSuccess: null,
    },
    viewHomeworkModal: {
      isOpen: false,
      homeworkId: null,
      onSuccess: null,
    },
  })),
);

// ==================== Actions ====================

// Create Homework Modal
export const openCreateHomeworkModal = (params: {
  classId: number;
  sessionId: number;
  onSuccess?: () => void;
  defaultValues?: Partial<CreateHomeworkFormValues>;
}) => {
  useHomeworkModalStore.setState((state) => {
    state.createHomeworkModal.isOpen = true;
    state.createHomeworkModal.classId = params.classId;
    state.createHomeworkModal.sessionId = params.sessionId;
    state.createHomeworkModal.onSuccess = params.onSuccess || null;
    state.createHomeworkModal.defaultValues = params.defaultValues;
  });
};

export const closeCreateHomeworkModal = () => {
  useHomeworkModalStore.setState((state) => {
    state.createHomeworkModal.isOpen = false;
    state.createHomeworkModal.classId = null;
    state.createHomeworkModal.sessionId = null;
    state.createHomeworkModal.onSuccess = null;
    state.createHomeworkModal.defaultValues = undefined;
  });
};

// Bulk Create Homework Modal
export const openBulkCreateHomeworkModal = (params: {
  classId: number;
  sessionId: number;
  onSuccess?: () => void;
}) => {
  useHomeworkModalStore.setState((state) => {
    state.bulkCreateHomeworkModal.isOpen = true;
    state.bulkCreateHomeworkModal.classId = params.classId;
    state.bulkCreateHomeworkModal.sessionId = params.sessionId;
    state.bulkCreateHomeworkModal.onSuccess = params.onSuccess || null;
  });
};

export const closeBulkCreateHomeworkModal = () => {
  useHomeworkModalStore.setState((state) => {
    state.bulkCreateHomeworkModal.isOpen = false;
    state.bulkCreateHomeworkModal.classId = null;
    state.bulkCreateHomeworkModal.sessionId = null;
    state.bulkCreateHomeworkModal.onSuccess = null;
  });
};

// Edit Homework Modal
export const openEditHomeworkModal = (params: {
  homework: Homework;
  onSuccess?: () => void;
}) => {
  useHomeworkModalStore.setState((state) => {
    state.editHomeworkModal.isOpen = true;
    state.editHomeworkModal.homework = params.homework;
    state.editHomeworkModal.onSuccess = params.onSuccess || null;
  });
};

export const closeEditHomeworkModal = () => {
  useHomeworkModalStore.setState((state) => {
    state.editHomeworkModal.isOpen = false;
    state.editHomeworkModal.homework = null;
    state.editHomeworkModal.onSuccess = null;
  });
};

// Delete Homework Modal
export const openDeleteHomeworkModal = (params: {
  homeworkId: number;
  homeworkTitle: string;
  onSuccess?: () => void;
}) => {
  useHomeworkModalStore.setState((state) => {
    state.deleteHomeworkModal.isOpen = true;
    state.deleteHomeworkModal.homeworkId = params.homeworkId;
    state.deleteHomeworkModal.homeworkTitle = params.homeworkTitle;
    state.deleteHomeworkModal.onSuccess = params.onSuccess || null;
  });
};

export const closeDeleteHomeworkModal = () => {
  useHomeworkModalStore.setState((state) => {
    state.deleteHomeworkModal.isOpen = false;
    state.deleteHomeworkModal.homeworkId = null;
    state.deleteHomeworkModal.homeworkTitle = null;
    state.deleteHomeworkModal.onSuccess = null;
  });
};

// View Homework Modal
export const openViewHomeworkModal = (params: {
  homeworkId: number;
  onSuccess?: () => void;
}) => {
  useHomeworkModalStore.setState((state) => {
    state.viewHomeworkModal.isOpen = true;
    state.viewHomeworkModal.homeworkId = params.homeworkId;
    state.viewHomeworkModal.onSuccess = params.onSuccess || null;
  });
};

export const closeViewHomeworkModal = () => {
  useHomeworkModalStore.setState((state) => {
    state.viewHomeworkModal.isOpen = false;
    state.viewHomeworkModal.homeworkId = null;
    state.viewHomeworkModal.onSuccess = null;
  });
};
