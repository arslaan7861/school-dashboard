import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { academicDayApi } from "./api.academic-day";
import { CalendarMonthDashboardParams } from "./types.academic-day";
import { ApiError } from "@/types/api";

// Query keys
export const academicDayKeys = {
  all: ["academic-days"] as const,
  calendar: (params: CalendarMonthDashboardParams) =>
    [...academicDayKeys.all, "calendar", params] as const,
};

// Get calendar month dashboard
export const useCalendarMonthDashboard = (
  params: CalendarMonthDashboardParams,
  enabled: boolean = true,
) => {
  const { year, month, sessionId } = params;

  return useQuery({
    queryKey: academicDayKeys.calendar({ year, month, sessionId }),
    queryFn: async () => {
      try {
        const response = await academicDayApi.getCalendarMonthDashboard(params);
        return response.data;
      } catch (error) {
        const apiError = error as ApiError;
        toast.error(apiError.message || "Failed to load calendar data");
        throw error;
      }
    },
    enabled: enabled && !!sessionId && !!year && !!month,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Optional: Hook for refreshing calendar data
export const useRefreshCalendar = () => {
  const queryClient = useQueryClient();

  const refreshCalendar = (params: CalendarMonthDashboardParams) => {
    queryClient.invalidateQueries({
      queryKey: academicDayKeys.calendar(params),
    });
  };

  return { refreshCalendar };
};
