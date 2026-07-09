import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "./api.dashboard";

export const useDashboardStats = (sessionId?: string | number) => {
  return useQuery({
    queryKey: ["dashboardStats", sessionId],
    queryFn: () => getDashboardStats(sessionId!),
    enabled: !!sessionId,
  });
};
