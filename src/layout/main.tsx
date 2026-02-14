"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Fullscreen, Sun } from "lucide-react";
import { Fragment } from "react/jsx-runtime";
import { AppSidebar } from "./sidebar";
import { Button } from "@/components/ui/button";
import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
function formatSegment(seg: string) {
  return seg.replace(/-/g, " ");
}
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const crumbs = useMemo(() => {
    let segments = pathname.split("/").filter(Boolean);

    //    remove "admin" if it's the first segment
    if (segments[0] === "admin") {
      segments = segments.slice(1);
    }

    const out: string[] = [];

    if (segments.length === 0) return out;

    //    session route handling
    if (segments[0] === "session") {
      out.push("Table");
      return out;
    }

    //    normal routes
    segments.forEach((seg) => {
      if (seg === "(adminpages)") return;
      out.push(formatSegment(seg));
    });

    return out;
  }, [pathname]);

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar variant="floating" />

      <SidebarInset className="h-svh overflow-hidden flex flex-col min-w-0">
        {/* HEADER (fixed) */}
        <header className="h-16 shrink-0 bg-background sticky top-0 z-20">
          <section className="flex h-16 items-center gap-2 min-w-0">
            <div className="flex items-center gap-2 px-4 min-w-0">
              <SidebarTrigger className="-ml-1 shrink-0" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />

              {/*    Dynamic Breadcrumb */}
              <Breadcrumb>
                <BreadcrumbList className="capitalize min-w-0">
                  {crumbs.map((c, idx) => {
                    const last = idx === crumbs.length - 1;

                    return (
                      <React.Fragment key={`${c}-${idx}`}>
                        <BreadcrumbItem className="min-w-0">
                          {last ? (
                            <BreadcrumbPage className="truncate">
                              {c}
                            </BreadcrumbPage>
                          ) : (
                            <BreadcrumbPage className="truncate opacity-70">
                              {c}
                            </BreadcrumbPage>
                          )}
                        </BreadcrumbItem>

                        {!last && (
                          <BreadcrumbSeparator className="opacity-60" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="ml-auto mr-4 space-x-4">
              <Button
                variant={"outline"}
                onClick={() => {
                  const elem = document.documentElement;

                  if (!document.fullscreenElement) {
                    elem.requestFullscreen();
                  } else {
                    document.exitFullscreen();
                  }
                }}
                size={"icon"}
              >
                <Fullscreen />
              </Button>
              <Button
                variant={"outline"}
                onClick={() => {
                  document
                    .getElementsByTagName("body")[0]
                    .classList.toggle("dark");
                }}
                size={"icon"}
              >
                <Sun />
              </Button>
            </div>
          </section>
          <Separator className="w-full px-4" />
        </header>
        <main className="flex-1 min-h-0 min-w-0">
          <div
            className="
              h-full w-full min-w-0
              overflow-y-auto overflow-x-hidden
              p-4 md:p-6 pt-0!
              overscroll-contain 
            "
          >
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
