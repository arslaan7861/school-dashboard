"use client";

import DashboardLayout from "@/layout/main";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const ALLOWED_DASHBOARD_ROLES = ["admin", "teacher"];

function DashLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const router = useRouter();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!user) {
      router.replace("/login");
    } else if (!ALLOWED_DASHBOARD_ROLES.includes(user.role)) {
      router.replace("/unauthorized");
    }
  }, [user, hasHydrated, router]);

  if (!hasHydrated || !user || !ALLOWED_DASHBOARD_ROLES.includes(user.role)) return null;

  return <DashboardLayout>{children}</DashboardLayout>;
}

export default DashLayout;
