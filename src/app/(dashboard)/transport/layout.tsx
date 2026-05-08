"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePathname, useRouter } from "next/navigation";

export default function TransportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Don't show tabs on nested routes (stop details, edit, etc.)
  const showTabs =
    pathname === "/transport" || pathname === "/transport/routes";

  if (!showTabs) {
    return <div className="p-6">{children}</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Tabs defaultValue="routes" className="w-full">
          <TabsList>
            <TabsTrigger
              value="routes"
              onClick={() => router.push("/transport")}
            >
              Routes
            </TabsTrigger>
            <TabsTrigger
              value="assignments"
              onClick={() => router.push("/transport/assignments")}
            >
              Assignments
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              onClick={() => router.push("/transport/settings")}
            >
              Settings
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {children}
    </div>
  );
}
