import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

// ==================== Create Subject Modal State ====================

type CreateSubjectModalState = {
  isOpen: boolean;
  classId: number | null;
  sessionId: number | null;
  onSuccess: (() => void) | null;
};

// ==================== Edit Subject Modal State ====================

type EditSubjectModalState = {
  isOpen: boolean;
  classId: number | null;
  subjectId: number | null;
  onSuccess: (() => void) | null;
};

// ==================== Store State ====================

type SubjectStore = {
  createSubjectModal: CreateSubjectModalState;
  editSubjectModal: EditSubjectModalState;
};

export const useSubjectModalStore = create<SubjectStore>()(
  immer(() => ({
    createSubjectModal: {
      isOpen: false,
      classId: null,
      sessionId: null,
      onSuccess: null,
    },
    editSubjectModal: {
      isOpen: false,
      classId: null,
      subjectId: null,
      onSuccess: null,
    },
  })),
);

// ==================== Actions ====================

// Create Subject Modal
export const openCreateSubjectModal = (params: {
  classId: number;
  sessionId: number;
  onSuccess?: () => void;
}) => {
  useSubjectModalStore.setState((state) => {
    state.createSubjectModal.isOpen = true;
    state.createSubjectModal.classId = params.classId;
    state.createSubjectModal.sessionId = params.sessionId;
    state.createSubjectModal.onSuccess = params.onSuccess || null;
  });
};

export const closeCreateSubjectModal = () => {
  useSubjectModalStore.setState((state) => {
    state.createSubjectModal.isOpen = false;
    state.createSubjectModal.classId = null;
    state.createSubjectModal.sessionId = null;
    state.createSubjectModal.onSuccess = null;
  });
};

// Edit Subject Modal
export const openEditSubjectModal = (params: {
  classId: number;
  subjectId: number;
  onSuccess?: () => void;
}) => {
  useSubjectModalStore.setState((state) => {
    state.editSubjectModal.isOpen = true;
    state.editSubjectModal.classId = params.classId;
    state.editSubjectModal.subjectId = params.subjectId;
    state.editSubjectModal.onSuccess = params.onSuccess || null;
  });
};

export const closeEditSubjectModal = () => {
  useSubjectModalStore.setState((state) => {
    state.editSubjectModal.isOpen = false;
    state.editSubjectModal.classId = null;
    state.editSubjectModal.subjectId = null;
    state.editSubjectModal.onSuccess = null;
  });
};
