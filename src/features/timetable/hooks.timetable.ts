"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { timetableApi } from "./api.timetable";
import {
  CreateSlotDto,
  CreateEntryDto,
  UpdateSlotDto,
  UpdateEntryDto,
} from "./types.timetable";

export const timetableKeys = {
  all: ["timetable"] as const,
  class: (classId?: number, sessionId?: number) =>
    [...timetableKeys.all, "class", classId, sessionId] as const,
};

// Get class timetable
export const useClassTimetable = (
  classId?: number,
  sessionId?: number,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: timetableKeys.class(classId, sessionId),
    queryFn: async () => {
      if (!classId) throw new Error("Class ID is required");
      const response = await timetableApi.getClassTimetable(classId, sessionId);
      return response.data;
    },
    enabled: !!classId && enabled,
  });
};

// Timetable CRUD operations
export const useTimetableCrud = (classId?: number, sessionId?: number) => {
  const queryClient = useQueryClient();

  const invalidateTimetable = () => {
    queryClient.invalidateQueries({
      queryKey: timetableKeys.class(classId, sessionId),
    });
  };

  // Create slot
  const createSlot = useMutation({
    mutationFn: (data: CreateSlotDto) => timetableApi.createSlot(data),
    onSuccess: (response) => {
      toast.success(response.message || "Slot created successfully");
      invalidateTimetable();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create slot");
    },
  });

  // Update slot
  const updateSlot = useMutation({
    mutationFn: ({ slotId, data }: { slotId: number; data: UpdateSlotDto }) =>
      timetableApi.updateSlot(slotId, data),
    onSuccess: (response) => {
      toast.success(response.message || "Slot updated successfully");
      invalidateTimetable();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update slot");
    },
  });

  // Delete slot
  const deleteSlot = useMutation({
    mutationFn: (slotId: number) => timetableApi.deleteSlot(slotId),
    onSuccess: (response) => {
      toast.success(response.message || "Slot deleted successfully");
      invalidateTimetable();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete slot");
    },
  });

  // Create entry
  const createEntry = useMutation({
    mutationFn: (data: CreateEntryDto) => timetableApi.createEntry(data),
    onSuccess: (response) => {
      toast.success(response.message || "Entry created successfully");
      invalidateTimetable();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create entry");
    },
  });

  // Update entry
  const updateEntry = useMutation({
    mutationFn: ({
      entryId,
      data,
    }: {
      entryId: number;
      data: UpdateEntryDto;
    }) => timetableApi.updateEntry(entryId, data),
    onSuccess: (response) => {
      toast.success(response.message || "Entry updated successfully");
      invalidateTimetable();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update entry");
    },
  });

  // Delete entry
  const deleteEntry = useMutation({
    mutationFn: (entryId: number) => timetableApi.deleteEntry(entryId),
    onSuccess: (response) => {
      toast.success(response.message || "Entry deleted successfully");
      invalidateTimetable();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete entry");
    },
  });

  return {
    createSlot: createSlot.mutate,
    createSlotAsync: createSlot.mutateAsync,
    updateSlot: updateSlot.mutate,
    updateSlotAsync: updateSlot.mutateAsync,
    deleteSlot: deleteSlot.mutate,
    deleteSlotAsync: deleteSlot.mutateAsync,
    createEntry: createEntry.mutate,
    createEntryAsync: createEntry.mutateAsync,
    updateEntry: updateEntry.mutate,
    updateEntryAsync: updateEntry.mutateAsync,
    deleteEntry: deleteEntry.mutate,
    deleteEntryAsync: deleteEntry.mutateAsync,
    isCreatingSlot: createSlot.isPending,
    isUpdatingSlot: updateSlot.isPending,
    isDeletingSlot: deleteSlot.isPending,
    isCreatingEntry: createEntry.isPending,
    isUpdatingEntry: updateEntry.isPending,
    isDeletingEntry: deleteEntry.isPending,
  };
};
