"use client";

import { useHomeworkStatus } from "@/features/homework";

interface HomeworkStatusBadgeProps {
  dueDate: string;
}

export function HomeworkStatusBadge({ dueDate }: HomeworkStatusBadgeProps) {
  const { statusLabel, statusColor } = useHomeworkStatus(dueDate);

  const getStatusStyles = () => {
    if (statusLabel.includes("Overdue")) {
      return "bg-red-100 text-red-800";
    }
    if (statusLabel.includes("Due Today")) {
      return "bg-orange-100 text-orange-800";
    }
    if (statusLabel.includes("days")) {
      return "bg-yellow-100 text-yellow-800";
    }
    return "bg-green-100 text-green-800";
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyles()}`}
    >
      {statusLabel}
    </span>
  );
}
