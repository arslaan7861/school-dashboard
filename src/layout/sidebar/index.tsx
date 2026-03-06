"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Calendar,
  CalendarDays,
  Command,
  GalleryVerticalEnd,
  GraduationCap,
  PersonStanding,
  School,
  ShieldUser,
  SquareTerminal,
  User,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "./sidenav";
import { NavUser } from "./usermenu";
import { SessionSwitcher } from "./sessionSwitcher";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: SquareTerminal,
    },
    {
      title: "Sessions",
      url: "/session",
      icon: CalendarDays,
    },
    {
      title: "Admins",
      url: "/admins",
      icon: ShieldUser,
    },
    {
      title: "Classes",
      url: "/classes",
      icon: School,
    },
    {
      title: "Students",
      url: "/students",
      icon: GraduationCap,
    },
    {
      title: "teachers",
      url: "/teachers",
      icon: User,
      isActive: true,
    },
    {
      title: "Time table",
      url: "/timetable",
      icon: Calendar,
      isActive: true,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SessionSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
