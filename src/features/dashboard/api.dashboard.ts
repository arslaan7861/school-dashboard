import { api } from "@/lib/axios";

export const getDashboardStats = async (sessionId: string | number) => {
  const response = await api.get(`/dashboard?sessionId=${sessionId}`);
  return response;
};
