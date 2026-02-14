"use client";

import DashboardLayout from "@/layout/main";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

function DashLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const router = useRouter();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!user) router.replace("/login");
  }, [user, hasHydrated, router]);

  if (!hasHydrated) return null;

  return <DashboardLayout>{children}</DashboardLayout>;
}

export default DashLayout;
