import { api } from "@/lib/axios";
import {
  CalendarMonthDashboardResponse,
  CalendarMonthDashboardParams,
} from "./types.academic-day";

const BASE_URL = "/academic-days";

export const academicDayApi = {
  // Get calendar month dashboard
  getCalendarMonthDashboard: async (
    params: CalendarMonthDashboardParams,
  ): Promise<CalendarMonthDashboardResponse> => {
    const { year, month, sessionId } = params;

    const queryParams: Record<string, string> = {
      year,
      month,
      sessionId,
    };

    return api.get(`${BASE_URL}/calendar/month`, { params: queryParams });
  },
};
