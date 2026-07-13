"use client";

import { parse, format } from "date-fns";
import { Coffee } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { WeekDay } from "../types.timetable";

// Format the duration in a more readable way
const formatBreakDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? "s" : ""}`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  }
  return `${hours} hour${hours !== 1 ? "s" : ""} ${mins} min${mins !== 1 ? "s" : ""}`;
};

// Format time for display in recess card
const formatRecessTime = (time?: string): string => {
  if (!time) return "";
  try {
    const date = parse(time, "HH:mm", new Date());
    return format(date, "h:mm a");
  } catch {
    return time;
  }
};

export const RecessCard = ({ recess, day }: { recess?: any; day: WeekDay }) => {
  return (
    <div
      className={cn(
        "h-[200px] rounded-xl border-2 p-3 transition-all",
        recess
          ? "border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/50 to-amber-100/30 dark:from-amber-950/20 dark:to-amber-900/10 hover:shadow-md"
          : "border-dashed border-muted-300 dark:border-muted-700 bg-muted/5 hover:bg-muted/10",
      )}
    >
      <div className="h-full flex flex-col items-center justify-center text-center">
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all",
            recess ? "bg-amber-100 dark:bg-amber-900/50" : "bg-muted/20",
          )}
        >
          <Coffee
            className={cn(
              "w-6 h-6",
              recess ? "text-amber-600 dark:text-amber-400" : "text-muted-400",
            )}
          />
        </div>

        {recess ? (
          <>
            <Badge
              variant="secondary"
              className="mb-2 bg-amber-200 text-amber-800 border-amber-300 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-700 font-mono"
            >
              {recess.display}
            </Badge>
            <h4 className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
              Break Time
            </h4>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
              {formatRecessTime(recess.start)} - {formatRecessTime(recess.end)}
            </p>
            <p className="text-[10px] text-amber-500/70 dark:text-amber-500/50 mt-2">
              {formatBreakDuration(recess.duration)}
            </p>
          </>
        ) : (
          <>
            <h4 className="font-medium text-muted-400 text-sm mb-1">
              No Recess
            </h4>
            <p className="text-xs text-muted-400">Scheduled</p>
            <p className="text-[10px] text-muted-300 mt-2">Between L4 & L5</p>
          </>
        )}
      </div>
    </div>
  );
};
