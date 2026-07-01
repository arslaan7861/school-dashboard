"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, School } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { Badge } from "@/components/ui/badge";

import { useSessions } from "@/features/session/hooks.session";
import { Session } from "@/features/session/types.session";
import { useAuthStore } from "@/store/authStore";

export function SessionSwitcher() {
  const { data, isLoading } = useSessions();
  const { isMobile } = useSidebar();

  const activeSessionId = useAuthStore((s) => s.activeSessionId);
  const setActiveSession = useAuthStore((s) => s.setActiveSession);

  const sessions: Session[] = data?.data ?? [];

  // decide active session
  const activeSession =
    sessions.find((s) => s.id === activeSessionId) ||
    sessions.find((s) => s.isActive) ||
    sessions[0] ||
    null;

  // if no stored active session but backend has one → store it
  React.useEffect(() => {
    if (!activeSessionId && activeSession) {
      setActiveSession(activeSession.id);
    }
  }, [activeSessionId, activeSession, setActiveSession]);

  if (isLoading || !activeSession) return null;

  const formatRange = (s: Session) => {
    const start = new Date(s.startDate).getFullYear();
    const end = new Date(s.endDate).getFullYear();
    return `${start} - ${end}`;
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {/* ICON */}
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <School className="size-4" />
              </div>

              {/* ACTIVE SESSION TEXT */}
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeSession.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {formatRange(activeSession)}
                </span>
              </div>

              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          {/* DROPDOWN */}
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Academic Sessions
            </DropdownMenuLabel>

            {sessions.map((session) => {
              const isActive = session.isActive;

              return (
                <DropdownMenuItem
                  key={session.id}
                  className="gap-2 p-2 flex justify-between items-center cursor-pointer"
                  onClick={() => setActiveSession(session.id)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{session.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatRange(session)}
                    </span>
                  </div>

                  {isActive && (
                    <Badge className="bg-green-600 hover:bg-green-600">
                      Active
                    </Badge>
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
