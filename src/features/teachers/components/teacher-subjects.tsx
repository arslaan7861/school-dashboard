"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

import { useTeacherTimetable } from "@/features/timetable/hooks.timetable";
import { Skeleton } from "@/components/ui/skeleton";

export function TeacherSubjects({ teacherId }: { teacherId: number }) {
  const { data: timetableResponse, isLoading } = useTeacherTimetable(teacherId);

  if (isLoading) {
    return <Skeleton className="w-full h-96 rounded-xl" />;
  }

  const timetable = timetableResponse?.data?.timetable || [];
  
  // Extract unique subjects
  const subjectMap = new Map<string, { id: number; name: string; classes: Set<string> }>();
  
  timetable.forEach(day => {
    day.slots.forEach(slot => {
      if (!subjectMap.has(slot.subject.name)) {
        subjectMap.set(slot.subject.name, {
          id: slot.subject.id,
          name: slot.subject.name,
          classes: new Set([`${slot.class.name} - ${slot.class.section}`])
        });
      } else {
        subjectMap.get(slot.subject.name)!.classes.add(`${slot.class.name} - ${slot.class.section}`);
      }
    });
  });

  const subjects = Array.from(subjectMap.values());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assigned Subjects</CardTitle>
        <CardDescription>
          Subjects currently assigned to this teacher.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {subjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-3 rounded-lg border border-dashed p-8 text-center">
            <div className="rounded-full bg-muted p-3">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-muted-foreground">No subjects found</h3>
              <p className="text-sm text-muted-foreground">
                This teacher is not assigned to any subjects in the timetable.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map(subject => (
              <div key={subject.id} className="border rounded-lg p-4 bg-muted/30">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-primary/10 p-2 rounded-full text-primary">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <h4 className="font-semibold text-lg">{subject.name}</h4>
                </div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Taught in:</div>
                <div className="flex flex-wrap gap-2">
                  {Array.from(subject.classes).map(cls => (
                    <span key={cls} className="text-xs bg-background border px-2 py-1 rounded-md">
                      {cls}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
