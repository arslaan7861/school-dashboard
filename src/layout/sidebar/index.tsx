"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  CheckLineIcon,
  Coins,
  Command,
  GalleryVerticalEnd,
  GraduationCap,
  LayoutDashboard,
  PersonStanding,
  School,
  ShieldUser,
  SquareTerminal,
  Truck,
  User,
  Users,
  Megaphone,
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
      icon: LayoutDashboard,
    },
    {
      title: "Sessions",
      url: "/session",
      icon: CalendarRange,
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
      title: "Teachers",
      url: "/teachers",
      icon: Users,
    },
    {
      title: "Attendance",
      url: "/attendance",
      icon: CheckLineIcon,
    },
    {
      title: "Timetable",
      url: "/timetable",
      icon: CalendarClock,
    },
    {
      title: "Calendar",
      url: "/calendar",
      icon: CalendarCheck,
    },
    {
      title: "Exams",
      url: "/exams",
      icon: BookOpen,
    },
    {
      title: "Transport",
      url: "/transport",
      icon: Truck,
    },
    {
      title: "Fees",
      url: "/fees",
      icon: Coins,
    },
    {
      title: "Announcements",
      url: "/announcements",
      icon: Megaphone,
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
