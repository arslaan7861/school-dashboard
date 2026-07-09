import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Announcement } from "@/features/announcement/types.announcement";

// ==================== Create/Edit Announcement Modal State ====================

type CreateAnnouncementModalState = {
  isOpen: boolean;
  announcementData: Announcement | null;
  onSuccess: (() => void) | null;
};

// ==================== Delete Announcement Modal State ====================

type DeleteAnnouncementModalState = {
  isOpen: boolean;
  announcementData: Announcement | null;
  onSuccess: (() => void) | null;
};

// ==================== Store State ====================

type AnnouncementStore = {
  createAnnouncementModal: CreateAnnouncementModalState;
  deleteAnnouncementModal: DeleteAnnouncementModalState;
};

export const useAnnouncementModalStore = create<AnnouncementStore>()(
  immer(() => ({
    createAnnouncementModal: {
      isOpen: false,
      announcementData: null,
      onSuccess: null,
    },
    deleteAnnouncementModal: {
      isOpen: false,
      announcementData: null,
      onSuccess: null,
    },
  })),
);

// ==================== Actions ====================

// Create/Edit Announcement Modal
export const openCreateAnnouncementModal = (params?: {
  announcementData?: Announcement;
  onSuccess?: () => void;
}) => {
  useAnnouncementModalStore.setState((state) => {
    state.createAnnouncementModal.isOpen = true;
    state.createAnnouncementModal.announcementData = params?.announcementData || null;
    state.createAnnouncementModal.onSuccess = params?.onSuccess || null;
  });
};

export const closeCreateAnnouncementModal = () => {
  useAnnouncementModalStore.setState((state) => {
    state.createAnnouncementModal.isOpen = false;
    state.createAnnouncementModal.announcementData = null;
    state.createAnnouncementModal.onSuccess = null;
  });
};

// Delete Announcement Modal
export const openDeleteAnnouncementModal = (params: {
  announcementData: Announcement;
  onSuccess?: () => void;
}) => {
  useAnnouncementModalStore.setState((state) => {
    state.deleteAnnouncementModal.isOpen = true;
    state.deleteAnnouncementModal.announcementData = params.announcementData;
    state.deleteAnnouncementModal.onSuccess = params.onSuccess || null;
  });
};

export const closeDeleteAnnouncementModal = () => {
  useAnnouncementModalStore.setState((state) => {
    state.deleteAnnouncementModal.isOpen = false;
    state.deleteAnnouncementModal.announcementData = null;
    state.deleteAnnouncementModal.onSuccess = null;
  });
};
