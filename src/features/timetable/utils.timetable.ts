import { format, parse, differenceInMinutes } from "date-fns";
import { WeekDay, WEEK_DAYS } from "./types.timetable";

export const getDayLabel = (day: WeekDay): string => {
  const found = WEEK_DAYS.find((d) => d.value === day);
  return found?.label || day;
};

export const formatTime = (time?: string): string => {
  if (!time) return "--:--";
  try {
    const date = parse(
      time,
      time.includes(":") ? "HH:mm:ss" : "HH:mm",
      new Date(),
    );
    return format(date, "h:mm a");
  } catch {
    return time.split(":").slice(0, 2).join(":");
  }
};

export const formatTimeForSubmission = (time: string): string => {
  if (!time) return "";
  return time.split(":").slice(0, 2).join(":");
};

export const formatDurationMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins} min${mins !== 1 ? "s" : ""}`;
  } else if (mins === 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  } else {
    return `${hours} hour${hours !== 1 ? "s" : ""} ${mins} min${mins !== 1 ? "s" : ""}`;
  }
};

export const getTimeDifference = (start?: string, end?: string): number | null => {
  if (!start || !end) return null;

  try {
    const startTime = parse(start, "HH:mm", new Date());
    const endTime = parse(end, "HH:mm", new Date());
    return differenceInMinutes(endTime, startTime);
  } catch {
    return null;
  }
};

export const LECTURE_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8];

export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const getSubjectColor = (subjectId: number, subjectName: string) => {
  const colors = [
    {
      bg: "bg-blue-100 dark:bg-blue-950/40",
      border: "border-blue-200 dark:border-blue-800",
      text: "text-blue-700 dark:text-blue-300",
      badge: "bg-blue-500",
      light: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      bg: "bg-emerald-100 dark:bg-emerald-950/40",
      border: "border-emerald-200 dark:border-emerald-800",
      text: "text-emerald-700 dark:text-emerald-300",
      badge: "bg-emerald-500",
      light: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      bg: "bg-amber-100 dark:bg-amber-950/40",
      border: "border-amber-200 dark:border-amber-800",
      text: "text-amber-700 dark:text-amber-300",
      badge: "bg-amber-500",
      light: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      bg: "bg-rose-100 dark:bg-rose-950/40",
      border: "border-rose-200 dark:border-rose-800",
      text: "text-rose-700 dark:text-rose-300",
      badge: "bg-rose-500",
      light: "bg-rose-50 dark:bg-rose-900/20",
    },
    {
      bg: "bg-purple-100 dark:bg-purple-950/40",
      border: "border-purple-200 dark:border-purple-800",
      text: "text-purple-700 dark:text-purple-300",
      badge: "bg-purple-500",
      light: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      bg: "bg-cyan-100 dark:bg-cyan-950/40",
      border: "border-cyan-200 dark:border-cyan-800",
      text: "text-cyan-700 dark:text-cyan-300",
      badge: "bg-cyan-500",
      light: "bg-cyan-50 dark:bg-cyan-900/20",
    },
    {
      bg: "bg-orange-100 dark:bg-orange-950/40",
      border: "border-orange-200 dark:border-orange-800",
      text: "text-orange-700 dark:text-orange-300",
      badge: "bg-orange-500",
      light: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      bg: "bg-indigo-100 dark:bg-indigo-950/40",
      border: "border-indigo-200 dark:border-indigo-800",
      text: "text-indigo-700 dark:text-indigo-300",
      badge: "bg-indigo-500",
      light: "bg-indigo-50 dark:bg-indigo-900/20",
    },
  ];
  const index = (subjectId + subjectName.length) % colors.length;
  return colors[index];
};
