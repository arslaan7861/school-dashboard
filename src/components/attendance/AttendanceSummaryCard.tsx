"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Calendar, CheckCircle, Clock } from "lucide-react";

interface AttendanceSummaryCardProps {
  attendance: any;
  isLoading: boolean;
}

export function AttendanceSummaryCard({
  attendance,
  isLoading,
}: AttendanceSummaryCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  const academicDay = attendance?.academicDay;
  const summary = attendance?.summary;
  const total = summary?.totalStudents || 0;
  const present = summary?.present || 0;
  const percentage = total > 0 ? ((present + summary?.leave) / total) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Day Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{academicDay?.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">
              {percentage.toFixed(1)}% Present
            </span>
          </div>
        </div>

        <Progress value={percentage} className="h-2" />

        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Present</span>
            <span className="font-medium text-green-600">
              {summary?.present || 0}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Absent</span>
            <span className="font-medium text-red-600">
              {summary?.absent || 0}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Leave</span>
            <span className="font-medium text-yellow-600">
              {summary?.leave || 0}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Late</span>
            <span className="font-medium text-orange-600">
              {summary?.late || 0}
            </span>
          </div>
          {summary?.notMarked > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Not Marked</span>
              <span className="font-medium text-gray-400">
                {summary?.notMarked}
              </span>
            </div>
          )}
        </div>

        {academicDay?.isAttendanceLocked && (
          <div className="mt-2 p-2 bg-red-50 rounded-md">
            <p className="text-xs text-red-600 text-center">
              Attendance is locked
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
