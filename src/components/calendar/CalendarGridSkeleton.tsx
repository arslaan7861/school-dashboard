"use client";

import { Skeleton } from "@/components/ui/skeleton";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarGridSkeleton() {
  return (
    <div className="space-y-2">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid skeleton */}
      <div className="grid grid-cols-7 gap-2 auto-rows-fr">
        {Array.from({ length: 35 }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="min-h-[100px] sm:min-h-[140px]"
          >
            <div className="h-full p-2 sm:p-3 border rounded-lg bg-card">
              {/* Date skeleton */}
              <div className="flex items-start justify-between mb-2">
                <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded" />
                <div className="flex gap-1">
                  <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded" />
                  <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 rounded" />
                </div>
              </div>

              {/* Title skeleton */}
              <Skeleton className="h-3 w-3/4 mb-2" />

              {/* Attendance stats skeleton */}
              <div className="space-y-1 mt-auto">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="h-3 w-8" />
                </div>

                {/* Progress bar skeleton */}
                <div className="pt-1 mt-1">
                  <Skeleton className="h-1 w-full rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
