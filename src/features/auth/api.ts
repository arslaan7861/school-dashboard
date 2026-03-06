"use client";
import { api } from "@/lib/axios";
import { ApiSuccess } from "@/types/api";

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginData = {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    isActive: boolean; // Changed
  };
  token: string;
};

export const loginUser = (
  payload: LoginPayload,
): Promise<ApiSuccess<LoginData>> => api.post("/auth/login", payload);
