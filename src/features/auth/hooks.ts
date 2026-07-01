"use client";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { loginUser, LoginPayload, LoginData } from "./api";
import { ApiSuccess, ApiError } from "@/types/api";
import { useRouter } from "next/navigation";

export const useLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation<ApiSuccess<LoginData>, ApiError, LoginPayload>({
    mutationFn: loginUser,
    onSuccess: (res) => {
      console.log(res);
      setAuth(res.data);
      router.replace("/");
    },
  });
};

export const useLogout = () => useAuthStore((s) => s.logout);
