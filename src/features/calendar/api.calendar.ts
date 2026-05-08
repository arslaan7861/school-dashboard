import { api } from "@/lib/axios";
import {
  CalendarMonthQuery,
  CalendarMonthResponse,
  DayDetailsResponse,
  UpdateCalendarRequest,
} from "./types.calendar";
import { ApiSuccess } from "@/types/api";

const BASE_URL = "/calendar";

export const calendarApi = {
  // Get month dashboard view
  getMonthDashboard: async (
    params: CalendarMonthQuery,
  ): Promise<ApiSuccess<CalendarMonthResponse[]>> => {
    return await api.get(`${BASE_URL}/month`, { params });
  },

  // Get day details with class overrides
  getDayDetails: async (
    dayId: number,
  ): Promise<ApiSuccess<DayDetailsResponse>> => {
    return await api.get(`${BASE_URL}/day/${dayId}`);
  },

  // Update calendar (bulk operations)
  updateCalendar: async (
    data: UpdateCalendarRequest,
  ): Promise<
    ApiSuccess<{ affectedDates: number; affectedClasses: number | string }>
  > => {
    return await api.post(`${BASE_URL}/update`, data);
  },
};
