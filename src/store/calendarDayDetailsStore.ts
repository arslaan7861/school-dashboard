import { create } from "zustand";
import { ClassOverrideInfo } from "@/features/calendar/types.calendar";

export type DialogType = "removeHoliday" | "removeEvent" | null;

interface CalendarDayDetailsState {
  // UI State
  selectedClass: ClassOverrideInfo | null;
  showMobileDetails: boolean;
  holidayModalOpen: boolean;
  eventModalOpen: boolean;
  dialogType: DialogType;
  dialogClassId?: number;
  isRefreshing: boolean;

  // Actions
  openHolidayModal: (classId?: number) => void;
  closeHolidayModal: () => void;

  openEventModal: (classId?: number) => void;
  closeEventModal: () => void;

  openRemoveDialog: (type: "holiday" | "event", classId?: number) => void;
  closeDialogs: () => void;

  selectClass: (cls: ClassOverrideInfo) => void;
  closeClassDetails: () => void;

  setRefreshing: (isRefreshing: boolean) => void;

  reset: () => void;
}

export const useCalendarDayDetailsStore = create<CalendarDayDetailsState>(
  (set) => ({
    // Initial state
    selectedClass: null,
    showMobileDetails: false,
    holidayModalOpen: false,
    eventModalOpen: false,
    dialogType: null,
    dialogClassId: undefined,
    isRefreshing: false,

    // Holiday Modal Actions
    openHolidayModal: (classId) =>
      set({
        holidayModalOpen: true,
        dialogClassId: classId,
      }),

    closeHolidayModal: () =>
      set({
        holidayModalOpen: false,
        dialogClassId: undefined,
      }),

    // Event Modal Actions
    openEventModal: (classId) =>
      set({
        eventModalOpen: true,
        dialogClassId: classId,
      }),

    closeEventModal: () =>
      set({
        eventModalOpen: false,
        dialogClassId: undefined,
      }),

    // Remove Dialog Actions
    openRemoveDialog: (type, classId) =>
      set({
        dialogType: type === "holiday" ? "removeHoliday" : "removeEvent",
        dialogClassId: classId,
      }),

    closeDialogs: () =>
      set({
        dialogType: null,
        dialogClassId: undefined,
      }),

    // Mobile Class Selection
    selectClass: (cls) =>
      set({
        selectedClass: cls,
        showMobileDetails: true,
      }),

    closeClassDetails: () =>
      set({
        selectedClass: null,
        showMobileDetails: false,
      }),

    // Refresh State
    setRefreshing: (isRefreshing) => set({ isRefreshing }),

    // Reset all state (useful when sheet closes)
    reset: () =>
      set({
        selectedClass: null,
        showMobileDetails: false,
        holidayModalOpen: false,
        eventModalOpen: false,
        dialogType: null,
        dialogClassId: undefined,
        isRefreshing: false,
      }),
  }),
);

// Optional: Selector hooks for better performance
export const useSelectedClass = () =>
  useCalendarDayDetailsStore((state) => state.selectedClass);

export const useShowMobileDetails = () =>
  useCalendarDayDetailsStore((state) => state.showMobileDetails);

export const useHolidayModalState = () => ({
  isOpen: useCalendarDayDetailsStore((state) => state.holidayModalOpen),
  classId: useCalendarDayDetailsStore((state) => state.dialogClassId),
  open: useCalendarDayDetailsStore((state) => state.openHolidayModal),
  close: useCalendarDayDetailsStore((state) => state.closeHolidayModal),
});

export const useEventModalState = () => ({
  isOpen: useCalendarDayDetailsStore((state) => state.eventModalOpen),
  classId: useCalendarDayDetailsStore((state) => state.dialogClassId),
  open: useCalendarDayDetailsStore((state) => state.openEventModal),
  close: useCalendarDayDetailsStore((state) => state.closeEventModal),
});

export const useRemoveDialogState = () => ({
  type: useCalendarDayDetailsStore((state) => state.dialogType),
  classId: useCalendarDayDetailsStore((state) => state.dialogClassId),
  open: useCalendarDayDetailsStore((state) => state.openRemoveDialog),
  close: useCalendarDayDetailsStore((state) => state.closeDialogs),
});

export const useMobileClassState = () => ({
  selectedClass: useCalendarDayDetailsStore((state) => state.selectedClass),
  showMobileDetails: useCalendarDayDetailsStore(
    (state) => state.showMobileDetails,
  ),
  select: useCalendarDayDetailsStore((state) => state.selectClass),
  close: useCalendarDayDetailsStore((state) => state.closeClassDetails),
});
