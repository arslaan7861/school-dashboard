"use client";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { loginUser } from "./api";
import { useRouter } from "next/navigation";

export const useLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (res) => {
      console.log(res);
      setAuth(res.data);
      router.replace("/");
    },
  });
};

export const useLogout = () => useAuthStore((s) => s.logout);
