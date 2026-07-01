"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";

interface DayData {
  id: number;
  date: string;
  isHoliday: boolean;
  holidayDescription?: string | null;
}

interface DroppableDayCardProps {
  day: DayData;
  children: React.ReactNode;
}

export function DroppableDayCard({ day, children }: DroppableDayCardProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `droppable-${day.date}`,
    data: { day },
  });

  return (
    <div
      ref={setNodeRef}
      className={`p-3 rounded-xl border-2 min-h-[160px] flex flex-col gap-2 transition-all ${
        isOver
          ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-inner scale-[1.02]"
          : "border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 bg-slate-50/50 dark:bg-slate-950/30"
      }`}
    >
      <div className="flex justify-between items-center pb-1 border-b border-dashed border-slate-200 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
          {new Date(day.date).toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
          })}
        </span>
        {day.isHoliday ? (
          <Badge
            variant="destructive"
            className="text-[9px] px-1.5 h-4 leading-none font-medium"
          >
            Holiday
          </Badge>
        ) : (
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            {new Date(day.date).toLocaleDateString(undefined, {
              weekday: "short",
            })}
          </span>
        )}
      </div>
      {day.holidayDescription && (
        <span
          className="text-[9px] text-red-500 dark:text-red-400 font-medium truncate bg-red-50 dark:bg-red-950/20 px-1 py-0.5 rounded"
          title={day.holidayDescription}
        >
          {day.holidayDescription}
        </span>
      )}
      <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-[180px] scrollbar-thin">
        {children}
      </div>
    </div>
  );
}
