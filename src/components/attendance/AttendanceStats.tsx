"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  TrendingUp,
} from "lucide-react";

interface AttendanceStatsProps {
  attendance: any;
  isLoading: boolean;
}

export function AttendanceStats({
  attendance,
  isLoading,
}: AttendanceStatsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const summary = attendance?.summary;
  const total = summary?.totalStudents || 0;
  const present = summary?.present + summary?.late || 0;
  const absent = summary?.absent + summary?.leave || 0;
  const leave = summary?.leave || 0;
  const late = summary?.late || 0;
  const notMarked = summary?.notMarked || 0;
  const percentage = total > 0 ? ((present + leave) / total) * 100 : 0;

  const stats = [
    {
      label: "Total",
      value: total,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      label: "Present",
      value: present,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      percent: total > 0 ? ((present / total) * 100).toFixed(0) : "0",
    },
    {
      label: "Absent",
      value: absent,
      icon: UserX,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950/30",
      percent: total > 0 ? ((absent / total) * 100).toFixed(0) : "0",
    },
    {
      label: "Leave",
      value: leave,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
      percent: total > 0 ? ((leave / total) * 100).toFixed(0) : "0",
    },
    {
      label: "Late",
      value: late,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
      percent: total > 0 ? ((late / total) * 100).toFixed(0) : "0",
    },
  ];

  return (
    <Card className="p-2">
      <CardContent className="p-2">
        {/* Header with Rate - Only visible on mobile/tablet */}
        <div className="hidden sm:flex items-center justify-between  lg:hidden">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Attendance Rate
            </p>
            <p className="text-2xl font-bold">{percentage.toFixed(1)}%</p>
            {notMarked > 0 && (
              <p className="text-xs text-orange-500 mt-1">
                {notMarked} not marked
              </p>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Stats Grid - Single column on mobile, 5 columns on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {stats.map((stat, index) => (
            <CompactStatCard key={index} {...stat} total={total} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface CompactStatCardProps {
  label: string;
  value: number;
  icon: any;
  color: string;
  bgColor: string;
  percent?: string;
  total?: number;
}

function CompactStatCard({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
  percent,
  total,
}: CompactStatCardProps) {
  // For mobile, show stat in a horizontal layout within the single card
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`p-2 rounded-full ${bgColor} shrink-0`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </div>
      {percent && total && total > 0 && (
        <div className="text-right shrink-0 ml-2 hidden md:block">
          <div className="text-sm font-semibold">{percent}%</div>
          <div className="text-xs text-gray-400">of total</div>
        </div>
      )}
    </div>
  );
}
