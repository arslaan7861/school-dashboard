"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

import { useTeacherTimetable } from "@/features/timetable/hooks.timetable";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTime } from "@/features/timetable/utils.timetable";

export function TeacherTimetable({ teacherId }: { teacherId: number }) {
  const { data: timetableResponse, isLoading } = useTeacherTimetable(teacherId);

  if (isLoading) {
    return <Skeleton className="w-full h-96 rounded-xl" />;
  }

  const timetable = timetableResponse?.data?.timetable || [];
  
  // Find max lectures across all days to build grid headers if necessary, 
  // or just render it as a list of days for simplicity.
  const hasSchedule = timetable.some(day => day.slots.length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Schedule</CardTitle>
        <CardDescription>
          The timetable and assigned periods for this teacher.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasSchedule ? (
          <div className="flex flex-col items-center justify-center space-y-3 rounded-lg border border-dashed p-8 text-center">
            <div className="rounded-full bg-muted p-3">
              <CalendarDays className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-muted-foreground">No schedule found</h3>
              <p className="text-sm text-muted-foreground">
                This teacher currently has no classes assigned in the timetable.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {timetable.map((dayData) => {
              if (dayData.slots.length === 0) return null;
              return (
                <div key={dayData.day} className="space-y-3">
                  <h4 className="text-lg font-semibold capitalize border-b pb-2">{dayData.day}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {dayData.slots.map((slot) => (
                      <div key={slot.id} className="border rounded-lg p-4 bg-muted/30">
                        <div className="text-sm font-medium text-muted-foreground mb-1">
                          Lecture {slot.lectureNo}
                        </div>
                        <div className="font-semibold text-lg truncate">
                          {slot.subject.name}
                        </div>
                        <div className="text-sm">
                          {slot.class.name} - {slot.class.section}
                        </div>
                        {(slot.startTime || slot.endTime) && (
                          <div className="text-xs text-muted-foreground mt-2">
                            {slot.startTime ? formatTime(slot.startTime) : ""} - {slot.endTime ? formatTime(slot.endTime) : ""}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
