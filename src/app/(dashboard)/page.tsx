"use client";

import { useState, useEffect } from "react";
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  School,
  Bus,
  FileText,
  MessageSquare,
  UserPlus,
  Award,
  Bell,
  DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useRouter } from "next/navigation";
import { useSessions } from "@/features/session/hooks.session";
import { useDashboardStats } from "@/features/dashboard/hooks.dashboard";

// ==================== SKELETON COMPONENTS ====================

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function ChartSkeleton() {
  return (
    <div className="space-y-3 pt-2">
      <div className="flex gap-2 justify-end">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-28" />
      </div>
      <Skeleton className="h-[300px] w-full" />
    </div>
  );
}

function AttendanceSummarySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-10" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
      ))}
    </div>
  );
}

function ActivityListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-start gap-3">
          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EventListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-14 w-[60px] rounded-md shrink-0" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function NoticeListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-3 rounded-lg border">
          <div className="space-y-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function DashboardPage() {
  const router = useRouter();
  const [greeting, setGreeting] = useState("");
  const [selectedChart, setSelectedChart] = useState<"attendance" | "fee">(
    "attendance",
  );

  const { data: sessionsResponse, isLoading: sessionsLoading } = useSessions();
  // The axios interceptor returns response.data, so useSessions gives { data: Session[] }
  const sessions: any[] = sessionsResponse?.data ?? [];
  const activeSession = sessions.find((s) => s.isActive);
  const sessionId = activeSession?.id;

  const { data: dashboardResponse, isLoading: dashboardLoading } =
    useDashboardStats(sessionId);
  // Backend returns { message, data: { STATS_DATA, ATTENDANCE_DATA, ... } }
  const stats = dashboardResponse?.data;

  const isLoading = sessionsLoading || (!!sessionId && dashboardLoading);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const STATS_DATA = stats?.STATS_DATA ?? {
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalSubjects: 0,
    studentsTrend: "—",
    teachersTrend: "—",
    classesTrend: "—",
    subjectsTrend: "—",
  };
  const ATTENDANCE_DATA = stats?.ATTENDANCE_DATA ?? [];
  const FEE_COLLECTION_DATA = stats?.FEE_COLLECTION_DATA ?? [];
  const ATTENDANCE_SUMMARY = stats?.ATTENDANCE_SUMMARY ?? {
    today: 0,
    week: 0,
    month: 0,
    overall: 0,
  };
  const UPCOMING_EVENTS = stats?.UPCOMING_EVENTS ?? [];
  const NOTICES = stats?.NOTICES ?? [];
  const RECENT_ACTIVITIES = stats?.RECENT_ACTIVITIES ?? [];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{greeting}, Admin!</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back to your school management dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => router.push("/calendar")}
          >
            <Calendar className="h-4 w-4" />
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Students"
              value={STATS_DATA.totalStudents}
              icon={Users}
              trend={STATS_DATA.studentsTrend}
              trendUp={true}
            />
            <StatCard
              title="Total Teachers"
              value={STATS_DATA.totalTeachers}
              icon={GraduationCap}
              trend={STATS_DATA.teachersTrend}
              trendUp={true}
            />
            <StatCard
              title="Total Classes"
              value={STATS_DATA.totalClasses}
              icon={School}
              trend={STATS_DATA.classesTrend}
              trendUp={true}
            />
            <StatCard
              title="Total Subjects"
              value={STATS_DATA.totalSubjects}
              icon={BookOpen}
              trend={STATS_DATA.subjectsTrend}
              trendUp={false}
            />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance & Fee Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Overview</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={selectedChart === "attendance" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedChart("attendance")}
              >
                Attendance
              </Button>
              <Button
                variant={selectedChart === "fee" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedChart("fee")}
              >
                Fee Collection
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ChartSkeleton />
            ) : selectedChart === "attendance" ? (
              <>
                {ATTENDANCE_DATA.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                    No attendance data for this session yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={ATTENDANCE_DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="month"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip cursor={{ fill: "transparent" }} />
                      <Area
                        type="monotone"
                        dataKey="present"
                        stackId="1"
                        stroke="var(--color-chart-1)"
                        fill="var(--color-chart-1)"
                        fillOpacity={0.6}
                        name="Present (%)"
                      />
                      <Area
                        type="monotone"
                        dataKey="absent"
                        stackId="1"
                        stroke="var(--color-chart-2)"
                        fill="var(--color-chart-2)"
                        fillOpacity={0.6}
                        name="Absent (%)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-chart-1 rounded-full" />
                    <span className="text-sm text-muted-foreground">
                      Present
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-chart-2 rounded-full" />
                    <span className="text-sm text-muted-foreground">
                      Absent
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                {FEE_COLLECTION_DATA.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                    No fee collection data for this session yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={FEE_COLLECTION_DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="month"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `₹${v / 1000}k`}
                      />
                      <Tooltip cursor={{ fill: "transparent" }} />
                      <Bar
                        dataKey="collected"
                        fill="var(--color-chart-1)"
                        name="Collected (₹)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="pending"
                        fill="var(--color-chart-2)"
                        name="Pending (₹)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-chart-1 rounded-full" />
                    <span className="text-sm text-muted-foreground">
                      Collected
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-chart-2 rounded-full" />
                    <span className="text-sm text-muted-foreground">
                      Pending
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Attendance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <AttendanceSummarySkeleton />
            ) : (
              <>
                <AttendanceSummaryItem
                  label="Today"
                  value={ATTENDANCE_SUMMARY.today}
                />
                <AttendanceSummaryItem
                  label="This Week"
                  value={ATTENDANCE_SUMMARY.week}
                />
                <AttendanceSummaryItem
                  label="This Month"
                  value={ATTENDANCE_SUMMARY.month}
                />
                <AttendanceSummaryItem
                  label="Overall"
                  value={ATTENDANCE_SUMMARY.overall}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Activities</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/activities")}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <ActivityListSkeleton />
            ) : RECENT_ACTIVITIES.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activities.
              </p>
            ) : (
              RECENT_ACTIVITIES.map((activity: any) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="p-2 bg-secondary rounded-full shrink-0">
                    {activity.type === "homework" && (
                      <FileText className="h-4 w-4 text-chart-1" />
                    )}
                    {activity.type === "attendance" && (
                      <CheckCircle className="h-4 w-4 text-chart-2" />
                    )}
                    {activity.type === "fee" && (
                      <DollarSign className="h-4 w-4 text-chart-3" />
                    )}
                    {activity.type === "message" && (
                      <MessageSquare className="h-4 w-4 text-chart-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events & Notices */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/calendar")}
              >
                View Calendar
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <EventListSkeleton />
              ) : UPCOMING_EVENTS.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No upcoming events or holidays.
                </p>
              ) : (
                UPCOMING_EVENTS.map((event: any) => (
                  <div key={event.id} className="flex items-center gap-3">
                    <div className="text-center min-w-[60px] p-2 bg-secondary rounded-md">
                      <div className="text-xl font-bold text-primary">
                        {event.day}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {event.month}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.description}
                      </p>
                    </div>
                    <Badge
                      variant={
                        event.type === "exam"
                          ? "destructive"
                          : event.type === "holiday"
                            ? "secondary"
                            : "default"
                      }
                    >
                      {event.type}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Notices */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Notices</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/announcements")}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <NoticeListSkeleton />
              ) : NOTICES.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No recent notices.
                </p>
              ) : (
                NOTICES.map((notice: any) => (
                  <div
                    key={notice.id}
                    className="p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
                    onClick={() => router.push(`/announcements`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium flex items-center gap-2">
                          {notice.title}
                          {notice.isNew && (
                            <Badge variant="default" className="text-xs">
                              New
                            </Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {notice.content}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          {notice.date}
                        </p>
                      </div>
                      <Bell className="h-4 w-4 text-muted-foreground/50 shrink-0 ml-2" />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <QuickActionButton
              icon={UserPlus}
              label="Add Student"
              onClick={() => router.push("/students/create")}
            />
            <QuickActionButton
              icon={GraduationCap}
              label="Add Teacher"
              onClick={() => router.push("/teachers/create")}
            />
            <QuickActionButton
              icon={School}
              label="Add Class"
              onClick={() => router.push("/classes/create")}
            />
            <QuickActionButton
              icon={BookOpen}
              label="Add Subject"
              onClick={() => router.push("/subjects/create")}
            />
            <QuickActionButton
              icon={Bus}
              label="Transport"
              onClick={() => router.push("/transport")}
            />
            <QuickActionButton
              icon={Award}
              label="Exams"
              onClick={() => router.push("/exams")}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== HELPER COMPONENTS ====================

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  trend: string;
  trendUp: boolean;
}

function StatCard({ title, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl md:text-3xl font-bold mt-2">
              {value.toLocaleString()}
            </p>
            <div className="flex items-center gap-1 mt-2">
              {trendUp ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <span
                className={`text-sm ${trendUp ? "text-emerald-500" : "text-destructive"}`}
              >
                {trend}
              </span>
              <span className="text-sm text-muted-foreground">
                vs last month
              </span>
            </div>
          </div>
          <div className="p-3 rounded-full bg-primary/10">
            <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface QuickActionButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}

function QuickActionButton({ icon: Icon, label, onClick }: QuickActionButtonProps) {
  return (
    <TooltipProvider>
      <UITooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            className="h-auto py-3 md:py-4 flex flex-col gap-1 md:gap-2 hover:bg-secondary/80 hover:text-primary transition-colors"
            onClick={onClick}
          >
            <Icon className="h-4 w-4 md:h-5 md:w-5" />
            <span className="text-xs md:text-sm">{label}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Quick access to {label}</p>
        </TooltipContent>
      </UITooltip>
    </TooltipProvider>
  );
}

interface AttendanceSummaryItemProps {
  label: string;
  value: number;
}

function AttendanceSummaryItem({ label, value }: AttendanceSummaryItemProps) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="font-semibold">{value}%</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
}
