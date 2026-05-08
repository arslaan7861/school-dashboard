import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { calendarApi } from "./api.calendar";
import {
  CalendarMonthQuery,
  UpdateCalendarRequest,
  MarkHolidayRequest,
  RemoveHolidayRequest,
  CreateEventRequest,
  RemoveEventRequest,
  LockAttendanceRequest,
  UnlockAttendanceRequest,
  CalendarAction,
} from "./types.calendar";
import { ApiError } from "@/types/api";

// Query keys
export const calendarKeys = {
  all: ["calendar"] as const,
  month: (params: CalendarMonthQuery) =>
    [...calendarKeys.all, "month", params] as const,
  day: (dayId: number) => [...calendarKeys.all, "day", dayId] as const, // Make dayId required
  days: () => [...calendarKeys.all, "day"] as const, // For invalidating all day queries
};

// Helper to invalidate related queries
const invalidateCalendarQueries = async (
  queryClient: ReturnType<typeof useQueryClient>,
  startDate?: string,
  dayId?: number,
  sessionId?: number,
) => {
  const invalidations = [];

  // Invalidate specific day if ID provided
  if (dayId) {
    invalidations.push(
      queryClient.invalidateQueries({
        queryKey: calendarKeys.day(dayId),
      }),
    );
  }

  // Invalidate all day queries (for safety when dayId not known)
  invalidations.push(
    queryClient.invalidateQueries({
      queryKey: calendarKeys.days(),
    }),
  );

  // Invalidate month view if date provided
  if (startDate) {
    const startMonth = startDate.substring(0, 7);
    invalidations.push(
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey as any[];
          return (
            queryKey[0] === "calendar" &&
            queryKey[1] === "month" &&
            queryKey[2]?.month === startMonth.split("-")[1] &&
            queryKey[2]?.year === startMonth.split("-")[0]
          );
        },
      }),
    );
  }

  // Invalidate all month queries for the session
  if (sessionId) {
    invalidations.push(
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey as any[];
          return (
            queryKey[0] === "calendar" &&
            queryKey[1] === "month" &&
            queryKey[2]?.sessionId === sessionId
          );
        },
      }),
    );
  }

  await Promise.all(invalidations);
};

// Get month dashboard
export const useCalendarMonth = (params: CalendarMonthQuery) => {
  const { year, month, sessionId } = params;

  return useQuery({
    queryKey: calendarKeys.month({ year, month, sessionId }),
    queryFn: async () => {
      try {
        const response = await calendarApi.getMonthDashboard({
          year,
          month,
          sessionId,
        });

        if (Array.isArray(response)) {
          return response;
        }

        if (
          response &&
          typeof response === "object" &&
          "data" in response &&
          Array.isArray(response.data)
        ) {
          return response.data;
        }

        return [];
      } catch (error) {
        const apiError = error as ApiError;
        console.error("Calendar API Error:", apiError);
        throw new Error(apiError.message || "Failed to fetch calendar data");
      }
    },
    enabled: !!sessionId && !!year && !!month,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
};

// Get day details
export const useDayDetails = (dayId?: number) => {
  return useQuery({
    queryKey: calendarKeys.day(dayId!), // Using non-null assertion since we check enabled
    queryFn: async () => {
      if (!dayId) throw new Error("Day ID is required");
      try {
        const response = await calendarApi.getDayDetails(dayId);
        return response;
      } catch (error) {
        const apiError = error as ApiError;
        throw new Error(apiError.message || "Failed to fetch day details");
      }
    },
    enabled: !!dayId,
    retry: 1,
  });
};

// Calendar mutations
export const useCalendarMutations = () => {
  const queryClient = useQueryClient();

  // Update calendar (bulk operations)
  const updateCalendar = useMutation({
    mutationFn: async (data: UpdateCalendarRequest) => {
      try {
        const response = await calendarApi.updateCalendar(data);
        return response;
      } catch (error) {
        const apiError = error as ApiError;

        if (apiError.errors && apiError.errors.length > 0) {
          apiError.errors.forEach((err) => {
            toast.error(`${err.field}: ${err.message}`);
          });
        }

        throw new Error(apiError.message || "Failed to update calendar");
      }
    },
    onSuccess: async (response, variables) => {
      toast.success(response?.message || "Calendar updated successfully");

      // The response might contain the affected day IDs? If not, we'll invalidate broadly
      await invalidateCalendarQueries(
        queryClient,
        variables.startDate,
        undefined, // We don't have the day ID here, so invalidate all days
        variables.sessionId,
      );
    },
    onError: (error: Error) => {
      console.error("Calendar update error:", error);
    },
  });

  // Mark holiday
  const markHoliday = (data: Omit<MarkHolidayRequest, "action">) => {
    return updateCalendar.mutate({
      ...data,
      action: CalendarAction.MARK_HOLIDAY,
    } as MarkHolidayRequest);
  };

  // Remove holiday
  const removeHoliday = (data: Omit<RemoveHolidayRequest, "action">) => {
    return updateCalendar.mutate({
      ...data,
      action: CalendarAction.REMOVE_HOLIDAY,
    } as RemoveHolidayRequest);
  };

  // Create event
  const createEvent = (data: Omit<CreateEventRequest, "action">) => {
    return updateCalendar.mutate({
      ...data,
      action: CalendarAction.CREATE_EVENT,
    } as CreateEventRequest);
  };

  // Remove event
  const removeEvent = (data: Omit<RemoveEventRequest, "action">) => {
    return updateCalendar.mutate({
      ...data,
      action: CalendarAction.REMOVE_EVENT,
    } as RemoveEventRequest);
  };

  // Lock attendance
  const lockAttendance = (data: Omit<LockAttendanceRequest, "action">) => {
    return updateCalendar.mutate({
      ...data,
      action: CalendarAction.LOCK_ATTENDANCE,
    } as LockAttendanceRequest);
  };

  // Unlock attendance
  const unlockAttendance = (data: Omit<UnlockAttendanceRequest, "action">) => {
    return updateCalendar.mutate({
      ...data,
      action: CalendarAction.UNLOCK_ATTENDANCE,
    } as UnlockAttendanceRequest);
  };

  // Async versions
  const markHolidayAsync = async (data: Omit<MarkHolidayRequest, "action">) => {
    return updateCalendar.mutateAsync({
      ...data,
      action: CalendarAction.MARK_HOLIDAY,
    } as MarkHolidayRequest);
  };

  const removeHolidayAsync = async (
    data: Omit<RemoveHolidayRequest, "action">,
  ) => {
    return updateCalendar.mutateAsync({
      ...data,
      action: CalendarAction.REMOVE_HOLIDAY,
    } as RemoveHolidayRequest);
  };

  const createEventAsync = async (data: Omit<CreateEventRequest, "action">) => {
    return updateCalendar.mutateAsync({
      ...data,
      action: CalendarAction.CREATE_EVENT,
    } as CreateEventRequest);
  };

  const removeEventAsync = async (data: Omit<RemoveEventRequest, "action">) => {
    return updateCalendar.mutateAsync({
      ...data,
      action: CalendarAction.REMOVE_EVENT,
    } as RemoveEventRequest);
  };

  const lockAttendanceAsync = async (
    data: Omit<LockAttendanceRequest, "action">,
  ) => {
    return updateCalendar.mutateAsync({
      ...data,
      action: CalendarAction.LOCK_ATTENDANCE,
    } as LockAttendanceRequest);
  };

  const unlockAttendanceAsync = async (
    data: Omit<UnlockAttendanceRequest, "action">,
  ) => {
    return updateCalendar.mutateAsync({
      ...data,
      action: CalendarAction.UNLOCK_ATTENDANCE,
    } as UnlockAttendanceRequest);
  };

  return {
    // Mutations
    markHoliday,
    removeHoliday,
    createEvent,
    removeEvent,
    lockAttendance,
    unlockAttendance,

    // Async versions
    markHolidayAsync,
    removeHolidayAsync,
    createEventAsync,
    removeEventAsync,
    lockAttendanceAsync,
    unlockAttendanceAsync,

    // States
    isUpdating: updateCalendar.isPending,
    updateError: updateCalendar.error,
  };
};
