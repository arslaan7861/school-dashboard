"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck } from "lucide-react";

import { useTeacherExamDuties } from "@/features/exam/hooks.exam";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTime } from "@/features/timetable/utils.timetable";
import { format } from "date-fns";
import { MapPin } from "lucide-react";

export function TeacherExams({ teacherId }: { teacherId: number }) {
  const { data: dutiesResponse, isLoading } = useTeacherExamDuties(teacherId);

  if (isLoading) {
    return <Skeleton className="w-full h-96 rounded-xl" />;
  }

  const duties = dutiesResponse || [];
  
  // Group by date, then room, then time
  const groupedData = duties.reduce((acc: Record<string, Record<string, Record<string, any[]>>>, duty: any) => {
    const date = duty.date ? format(new Date(duty.date), "PPP") : "TBA";
    const room = duty.room || "Unassigned Room";
    const timeKey = `${duty.startTime}-${duty.endTime}`;
    
    if (!acc[date]) acc[date] = {};
    if (!acc[date][room]) acc[date][room] = {};
    if (!acc[date][room][timeKey]) acc[date][room][timeKey] = [];
    
    acc[date][room][timeKey].push(duty);
    return acc;
  }, {} as Record<string, Record<string, Record<string, any[]>>>);

  const dates = Object.keys(groupedData).sort((a, b) => {
    if (a === "TBA") return 1;
    if (b === "TBA") return -1;
    return new Date(a).getTime() - new Date(b).getTime();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exam Duties</CardTitle>
        <CardDescription>
          Assigned invigilation or evaluation duties for exams.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {duties.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-3 rounded-lg border border-dashed p-8 text-center">
            <div className="rounded-full bg-muted p-3">
              <ClipboardCheck className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-muted-foreground">No exam duties found</h3>
              <p className="text-sm text-muted-foreground">
                This teacher currently has no exam duties assigned.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {dates.map(date => (
              <div key={date} className="space-y-4">
                <div className="bg-muted/50 p-3 rounded-lg border">
                  <h3 className="text-lg font-bold text-foreground">{date}</h3>
                </div>
                <div className="pl-2 space-y-6">
                  {Object.keys(groupedData[date]).sort().map(room => (
                    <div key={room} className="space-y-3">
                      <div className="flex items-center space-x-2 border-b pb-1">
                        <MapPin className="h-4 w-4 text-primary" />
                        <h4 className="text-md font-semibold text-muted-foreground">{room}</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.keys(groupedData[date][room]).sort().map(timeKey => {
                          const timeDuties = groupedData[date][room][timeKey];
                          const firstDuty = timeDuties[0];
                          
                          return (
                            <div key={timeKey} className="border rounded-lg p-4 bg-background shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                              <div className="text-sm font-semibold mb-3 border-b pb-2 flex justify-between text-muted-foreground">
                                <span>Time:</span>
                                <span>{formatTime(firstDuty.startTime)} - {formatTime(firstDuty.endTime)}</span>
                              </div>
                              <div className="flex-grow space-y-4">
                                {timeDuties.map((duty: any, index: number) => (
                                  <div key={duty.id} className={index !== 0 ? "pt-4 border-t" : ""}>
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="font-semibold text-base leading-tight">{duty.exam.name}</div>
                                      <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md capitalize whitespace-nowrap ml-2">
                                        {duty.component.type}
                                      </div>
                                    </div>
                                    <div className="text-sm font-medium mb-1">{duty.subject.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      Class: {duty.class.name} - {duty.class.section}
                                      {duty.batch && ` (${duty.batch.name})`}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
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
